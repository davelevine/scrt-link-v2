import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { error, json } from '@sveltejs/kit';

import { PUBLIC_S3_BUCKET } from '$env/static/public';
import { s3Client, withKeyPrefix } from '$lib/s3';

import type { RequestEvent } from './$types';

export const POST = async ({ url }: RequestEvent) => {
	const Bucket = PUBLIC_S3_BUCKET;
	const key: string | null = url.searchParams.get('file');

	if (!key) {
		return error(400, 'File parameter missing.');
	}

	// Namespace the object under the instance key prefix (transparent to the client,
	// which stores the unprefixed key and gets it re-applied on download).
	const prefixedKey = withKeyPrefix(key);

	try {
		// Cloudflare R2 does not implement the S3 POST Object (browser form-upload)
		// operation — it responds with 501 Not Implemented. Use a presigned PUT
		// instead, which R2 supports. The client must send the exact Content-Type it
		// was signed with. No object ACL — R2 rejects per-object ACLs; access is
		// controlled by the presigned URL.
		const uploadUrl = await getSignedUrl(
			s3Client,
			new PutObjectCommand({
				Bucket,
				Key: prefixedKey,
				ContentType: 'application/octet-stream'
			}),
			{ expiresIn: 3 * 60 * 60 } // seconds -> 3h (for really big files)
		);

		return json({ url: uploadUrl });
	} catch (err) {
		console.error(err);
		error(400, 'Not able to get a presigned upload URL.');
	}
};
