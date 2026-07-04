import { S3Client } from '@aws-sdk/client-s3';

import { S3_ACCESS_KEY, S3_SECRET_KEY } from '$env/static/private';
import { PUBLIC_S3_ENDPOINT, PUBLIC_S3_KEY_PREFIX } from '$env/static/public';

// S3-compatible client. Configured for Cloudflare R2:
//   PUBLIC_S3_ENDPOINT = <account_id>.r2.cloudflarestorage.com
//   region             = 'auto' (R2 convention; ignored due to custom endpoint)
// Works with any S3-compatible provider by swapping the endpoint + credentials.
export const s3Client = new S3Client({
	endpoint: { hostname: PUBLIC_S3_ENDPOINT, path: '', protocol: 'https:' }, // For some reason the ":" is required
	region: 'auto',
	credentials: {
		accessKeyId: S3_ACCESS_KEY,
		secretAccessKey: S3_SECRET_KEY
	}
});

// All objects are namespaced under this key prefix. Lets the app share a bucket
// with unrelated data safely — critically, the cron cleanup only lists/deletes
// within this prefix (see api/v1/cron). Set `PUBLIC_S3_KEY_PREFIX`, e.g. `scrt-link/`.
export const s3KeyPrefix = PUBLIC_S3_KEY_PREFIX ?? '';

/** Prefixes an object key with the instance's key prefix. */
export const withKeyPrefix = (key: string): string => `${s3KeyPrefix}${key}`;
