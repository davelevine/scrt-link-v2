import { VERCEL_URL } from '$env/static/private';
import { PUBLIC_ENV, PUBLIC_PRODUCTION_URL } from '$env/static/public';
import { MB } from '$lib/data/units';

export const getBaseUrl = () => {
	switch (PUBLIC_ENV) {
		case 'preview': {
			return `https://${VERCEL_URL}`;
		}
		case 'staging': {
			return `https://dev.${PUBLIC_PRODUCTION_URL}`;
		}
		case 'production': {
			return `https://${PUBLIC_PRODUCTION_URL}`;
		}
		default: {
			return `https://localhost:5173`;
		}
	}
};

export const FILE_RETENTION_PERIOD_IN_DAYS = 30;

// Hard server-side ceiling for a single presigned upload (one encrypted chunk).
// Client chunks at 64 MB (see secret-file-upload.svelte); the margin covers
// AES-GCM/envelope overhead. The presign endpoint refuses to sign — and signs
// Content-Length into the URL, so R2 rejects — anything larger. Bounds the bytes
// any single upload URL can write regardless of client-side limits.
export const MAX_UPLOAD_CHUNK_SIZE = 65 * MB;
export const MAX_API_KEYS_PER_USER = 5;
export const MAX_ORGANIZATIONS_PER_USER = 1;
