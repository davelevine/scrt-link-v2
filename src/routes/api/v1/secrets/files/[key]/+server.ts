import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { importPublicKey, verifyMessageSignature } from '@scrt-link/core';
import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { PUBLIC_S3_BUCKET } from '$env/static/public';
import { s3Client, withKeyPrefix } from '$lib/s3';
import { db } from '$lib/server/db';
import { secret as secretSchema } from '$lib/server/db/schema';

import type { RequestEvent } from './$types';

export const POST = async ({ params, request }: RequestEvent) => {
	const body = await request.json();
	const { secretIdHash, keyHash, signature } = body;

	// Pin the bucket server-side; never trust a client-supplied bucket name.
	const Bucket = PUBLIC_S3_BUCKET;

	if (!keyHash) {
		error(400, 'No file key provided.');
	}

	// Re-apply the instance key prefix the object was uploaded under.
	const Key = withKeyPrefix(keyHash);

	const [secret] = await db
		.select()
		.from(secretSchema)
		.where(eq(secretSchema.secretIdHash, secretIdHash));

	if (!secret) {
		error(400, `No database entry for id ${secretIdHash}.`);
	}

	// Here we check if the requested file belongs to the "owner" via signature.
	const publicKey = await importPublicKey(secret.publicKey);
	if (!publicKey) {
		error(400, `Public key missing or invalid.`);
	}
	const isSignatureValid = verifyMessageSignature(params.key, signature, publicKey);
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
