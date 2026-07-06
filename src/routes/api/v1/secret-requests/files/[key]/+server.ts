import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { importPublicKey, verifyMessageSignature } from '@scrt-link/core';
import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { PUBLIC_S3_BUCKET } from '$env/static/public';
import { s3Client, withKeyPrefix } from '$lib/s3';
import { db } from '$lib/server/db';
import { secretRequest } from '$lib/server/db/schema';

import type { RequestEvent } from './$types';

export const POST = async ({ params, request }: RequestEvent) => {
	const body = await request.json();
	const { requestIdHash, keyHash, signature } = body;

	// Pin the bucket server-side; never trust a client-supplied bucket name.
	const Bucket = PUBLIC_S3_BUCKET;

	if (!keyHash) {
		error(400, 'No file key provided.');
	}

	// Re-apply the instance key prefix the object was uploaded under.
	const Key = withKeyPrefix(keyHash);

	const [secretRequestRow] = await db
		.select()
		.from(secretRequest)
		.where(eq(secretRequest.requestIdHash, requestIdHash));

	if (!secretRequestRow) {
		error(400, `No database entry for id ${requestIdHash}.`);
	}

	if (!secretRequestRow.responseFilePublicKey) {
		error(400, `No attachment for this request.`);
	}

	// Verify the chunk belongs to the responder via their signature.
	const publicKey = await importPublicKey(secretRequestRow.responseFilePublicKey);
	if (!publicKey) {
		error(400, `Public key missing or invalid.`);
	}
	const isSignatureValid = await verifyMessageSignature(params.key, signature, publicKey);
	if (!isSignatureValid) {
		error(400, `Invalid signature`);
	}

	// No ACL — R2 rejects per-object ACLs; the presigned URL grants access.
	const bucketParams = {
		Bucket,
		Key
	};
	const url = await getSignedUrl(s3Client, new GetObjectCommand(bucketParams), {
		expiresIn: 5 * 60 // 5min
	});

	if (!url) {
		error(400, `Couldn't get signed url. File no longer exist.`);
	}

	return json({ url });
};
