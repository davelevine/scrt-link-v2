import { DeleteObjectCommand, paginateListObjectsV2 } from '@aws-sdk/client-s3';
import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { and, eq, isNull, or } from 'drizzle-orm';
import { lte } from 'drizzle-orm';

import { CRON_SECRET } from '$env/static/private';
import { PUBLIC_S3_BUCKET } from '$env/static/public';
import { SECRET_REQUEST_RETENTION_PERIOD_IN_DAYS } from '$lib/client/constants';
import {
	DAILY_UPLOAD_BUDGET_BYTES,
	FILE_RETENTION_PERIOD_IN_DAYS,
	R2_STORAGE_ALERT_THRESHOLD_BYTES
} from '$lib/constants';
import { appName, emailSupport } from '$lib/data/app';
import { GB } from '$lib/data/units';
import { s3Client, s3KeyPrefix } from '$lib/s3';
import { db } from '$lib/server/db';
import {
	apiKey,
	emailVerificationRequest,
	rateLimit,
	secret as secretSchema,
	secretRequest,
	uploadUsage
} from '$lib/server/db/schema';
import sendTransactionalEmail from '$lib/server/resend';

const BucketName = PUBLIC_S3_BUCKET;
const client = s3Client;

function subtractDays(date: Date, days: number) {
	date.setDate(date.getDate() - days);
	return date;
}

type ObjectList = { Key: string }[];
export const GET: RequestHandler = async ({ request }) => {
	const authorization = request.headers.get('authorization');

	if (authorization === `Bearer ${CRON_SECRET}`) {
		// Delete files older than X days
		const deleteFilesBeforeDate = subtractDays(new Date(), FILE_RETENTION_PERIOD_IN_DAYS);

		// Running totals for the storage alert (below).
		let totalBytes = 0;
		let totalObjects = 0;

		// IMPORTANT: scope the listing to this instance's key prefix. The bucket may
		// be shared with unrelated data — without `Prefix` the cleanup would list and
		// delete every object in the bucket. `s3KeyPrefix` may be '' (whole bucket)
		// only when the instance owns the bucket exclusively.
		for await (const data of paginateListObjectsV2(
			{ client, pageSize: 1000 },
			{ Bucket: BucketName, Prefix: s3KeyPrefix }
		)) {
			if (!data.Contents) {
				error(500, 'No Contents');
			}

			// Tally current storage across every page for the alert check below.
			for (const obj of data.Contents) {
				totalBytes += obj.Size ?? 0;
				totalObjects += 1;
			}

			// Filter files by retention threshold date
			// Using "as ObjectList" b/c https://www.karltarvas.com/2021/03/11/typescript-array-filter-boolean.html
			const s3ObjectsToDelete = data.Contents.map(({ Key, LastModified }) => {
				if (LastModified && LastModified < deleteFilesBeforeDate) {
					if (typeof Key === 'string') {
						return { Key };
					}
				}
			}).filter(Boolean) as ObjectList;

			if (s3ObjectsToDelete.length) {
				console.log(`Cron: Start deleting files...`);
				// Using per-object DeleteObjectCommand instead of batch DeleteObjectsCommand:
				// some S3-compatible endpoints reject the checksum header that AWS SDK v3
				// attaches to the batch op.
				await Promise.all(
					s3ObjectsToDelete.map(({ Key }) =>
						client.send(new DeleteObjectCommand({ Bucket: BucketName, Key }))
					)
				);
				console.log(`Cron: Deleted ${s3ObjectsToDelete.length} files from S3.`);
			} else {
				console.log(`Cron: No files to delete from S3.`);
			}
		}

		// Storage alert: email the operator when the bucket grows past the
		// threshold, so a runaway upload surfaces before the bill does.
		console.log(
			`Cron: R2 storage ${(totalBytes / GB).toFixed(2)} GB across ${totalObjects} objects.`
		);
		if (totalBytes > R2_STORAGE_ALERT_THRESHOLD_BYTES) {
			const usedGb = (totalBytes / GB).toFixed(1);
			const thresholdGb = (R2_STORAGE_ALERT_THRESHOLD_BYTES / GB).toFixed(0);
			const budgetGb = (DAILY_UPLOAD_BUDGET_BYTES / GB).toFixed(0);
			console.warn(`Cron: R2 storage ${usedGb} GB exceeds alert threshold ${thresholdGb} GB.`);
			await sendTransactionalEmail({
				to: emailSupport,
				subject: `⚠️ ${appName}: R2 storage at ${usedGb} GB`,
				html:
					`<p>Bucket <strong>${BucketName}</strong> (prefix <code>${s3KeyPrefix || '/'}</code>) is holding ` +
					`<strong>${usedGb} GB</strong> across ${totalObjects} objects — above the ${thresholdGb} GB alert threshold.</p>` +
					`<p>The daily upload budget is ${budgetGb} GB. If this is unexpected, check for upload abuse ` +
					`(<code>/api/v1/secrets/files</code>).</p>`
			});
		}

		// Delete secrets that have been retrieved older than 7 days
		const deleteRetrievedSecretsBeforeDate = subtractDays(new Date(), 7);
		const deleteExpiredSecretsBeforeDate = subtractDays(new Date(), 7);

		const deletedSecrets = await db
			.delete(secretSchema)
			.where(
				or(
					lte(secretSchema.retrievedAt, deleteRetrievedSecretsBeforeDate),
					lte(secretSchema.expiresAt, deleteExpiredSecretsBeforeDate) // Expired secrets
				)
			)
			.returning();

		console.log(`Cron: Deleted ${deletedSecrets.length} entries from the Secrets database.`);

		// Delete secret requests older than the retention period (unanswered or responded)
		const deleteRequestsBeforeDate = subtractDays(
			new Date(),
			SECRET_REQUEST_RETENTION_PERIOD_IN_DAYS
		);

		const deletedSecretRequests = await db
			.delete(secretRequest)
			.where(
				or(
					and(
						lte(secretRequest.expiresAt, deleteRequestsBeforeDate),
						isNull(secretRequest.respondedAt)
					),
					lte(secretRequest.respondedAt, deleteRequestsBeforeDate)
				)
			)
			.returning();

		console.log(
			`Cron: Deleted ${deletedSecretRequests.length} entries from the Secret Requests database.`
		);

		// Delete email verification requests if expired
		const deletedEmailVerificationRequests = await db
			.delete(emailVerificationRequest)
			.where(
				lte(emailVerificationRequest.expiresAt, new Date()) // Expired requests
			)
			.returning();

		console.log(
			`Cron: Deleted ${deletedEmailVerificationRequests.length} entries from the Email Verification Requests database.`
		);

		// Delete revoked API keys
		const deleteRevokedAPIkeys = await db
			.delete(apiKey)
			.where(
				eq(apiKey.revoked, true) // Revoked
			)
			.returning();

		console.log(`Cron: Deleted ${deleteRevokedAPIkeys.length} entries from the api keys database.`);

		// Delete expired rate-limit entries
		const deletedRateLimitEntries = await db
			.delete(rateLimit)
			.where(lte(rateLimit.expiresAt, new Date()))
			.returning();

		console.log(
			`Cron: Deleted ${deletedRateLimitEntries.length} expired entries from the rate limit database.`
		);

		// Prune the upload-budget ledger (only the last 24h matters; keep 2 days
		// of slack so a window query is never starved).
		const deletedUploadUsage = await db
			.delete(uploadUsage)
			.where(lte(uploadUsage.createdAt, subtractDays(new Date(), 2)))
			.returning();

		console.log(
			`Cron: Deleted ${deletedUploadUsage.length} old entries from the upload usage ledger.`
		);

		return json({ success: true });
	} else {
		error(401, 'Unauthorized');
	}
};
