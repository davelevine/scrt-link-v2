import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { error, json } from '@sveltejs/kit';

import { PUBLIC_S3_BUCKET } from '$env/static/public';
import { MAX_UPLOAD_CHUNK_SIZE } from '$lib/constants';
import { s3Client, withKeyPrefix } from '$lib/s3';
import { isUploadRateLimited } from '$lib/server/rate-limit';

import type { RequestEvent } from './$types';

export const POST = async (event: RequestEvent) => {
	// Throttle presigned-URL minting per IP. Without this, the endpoint is an
	// unauthenticated way to write arbitrary objects into the bucket at scale.
	if (await isUploadRateLimited(event)) {
		return error(429, 'Too many upload requests. Please slow down and try again.');
	}

	const { url } = event;
	const Bucket = PUBLIC_S3_BUCKET;
	const key: string | null = url.searchParams.get('file');

	if (!key) {
		return error(400, 'File parameter missing.');
	}

	// The client declares the exact (encrypted) byte length of the chunk it is
	// about to upload. Reject anything over the per-chunk ceiling, and sign the
	// length into the URL below so the actual PUT can't exceed what was declared.
	const size = Number(url.searchParams.get('size'));
	if (!Number.isInteger(size) || size <= 0) {
		return error(400, 'Missing or invalid file size.');
	}
	if (size > MAX_UPLOAD_CHUNK_SIZE) {
		return error(413, 'File exceeds the maximum allowed size.');
	}

	// Namespace the object under the instance key prefix (transparent to the client,
	// which stores the unprefixed key and gets it re-applied on download).
	const prefixedKey = withKeyPrefix(key);

	try {
		// Cloudflare R2 does not implement the S3 POST Object (browser form-upload)
		// operation — it responds with 501 Not Implemented. Use a presigned PUT
		// instead, which R2 supports. The client must send the exact Content-Type it
		// was signed with. ContentLength is signed too, so R2 rejects an upload whose
		// size doesn't match the declared (and capped) value. No object ACL — R2
		// rejects per-object ACLs; access is controlled by the presigned URL.
		const uploadUrl = await getSignedUrl(
			s3Client,
			new PutObjectCommand({
				Bucket,
				Key: prefixedKey,
				ContentType: 'application/octet-stream',
				ContentLength: size
			}),
			{ expiresIn: 60 * 60 } // seconds -> 1h
		);

		return json({ url: uploadUrl });
	} catch (err) {
		console.error(err);
		error(400, 'Not able to get a presigned upload URL.');
	}
};
