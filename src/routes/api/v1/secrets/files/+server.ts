import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
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

	const Conditions = [{ 'Content-Type': 'application/octet-stream' }];

	try {
		// Note: no object ACL — Cloudflare R2 rejects per-object ACLs. Access is
		// controlled by the presigned URL and bucket configuration.
		const post = await createPresignedPost(s3Client, {
			Bucket,
			Fields: {
				key: prefixedKey,
				'Content-type': 'application/octet-stream'
			},
			Key: prefixedKey,
			Expires: 3 * 60 * 60, // seconds -> 3h (For really big files)
			Conditions
		});

		return json(post);
	} catch (err) {
		console.error(err);
		error(400, 'No able to get a presigned post URL.');
	}
};
