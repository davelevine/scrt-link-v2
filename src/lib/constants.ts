import { VERCEL_URL } from '$env/static/private';
import { PUBLIC_ENV, PUBLIC_PRODUCTION_URL } from '$env/static/public';
import { GB, MB } from '$lib/data/units';

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

// Global rolling-24h ceiling on total declared upload volume across ALL clients.
// A patient script can pace under the per-IP rate limit, so this caps cumulative
// ingestion (and therefore the R2 bill) regardless of request rate or IP spread.
export const DAILY_UPLOAD_BUDGET_BYTES = 5 * GB;

// The daily cron emails an alert when total bucket storage exceeds this. Set
// well above normal usage but far below the ~150 GB the daily budget could
// accrue over the 30-day retention window, so anomalies surface early.
export const R2_STORAGE_ALERT_THRESHOLD_BYTES = 30 * GB;
export const MAX_API_KEYS_PER_USER = 5;
export const MAX_ORGANIZATIONS_PER_USER = 1;
