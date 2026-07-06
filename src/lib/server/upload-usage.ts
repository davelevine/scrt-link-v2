import { gte, sql } from 'drizzle-orm';

import { DAILY_UPLOAD_BUDGET_BYTES } from '$lib/constants';

import { db } from './db';
import { uploadUsage } from './db/schema';

const WINDOW_MS = 24 * 60 * 60 * 1000;

/** Total declared upload bytes recorded in the last 24h (global, all clients). */
async function bytesInWindow(): Promise<number> {
	const since = new Date(Date.now() - WINDOW_MS);
	const [row] = await db
		.select({ total: sql<string>`coalesce(sum(${uploadUsage.bytes}), 0)` })
		.from(uploadUsage)
		.where(gte(uploadUsage.createdAt, since));
	return Number(row?.total ?? 0);
}

/**
 * Global daily upload budget. Returns true if `size` fits under the rolling
 * 24h ceiling, recording it against the budget when it does.
 *
 * Fails OPEN on any DB error (logged) so a not-yet-applied migration or a
 * transient DB blip can never take down all file uploads — the per-IP rate
 * limit and per-chunk size cap still apply in that case.
 */
export async function tryReserveUploadBudget(size: number): Promise<boolean> {
	try {
		const used = await bytesInWindow();
		if (used + size > DAILY_UPLOAD_BUDGET_BYTES) {
			return false;
		}
		await db.insert(uploadUsage).values({ bytes: size });
		return true;
	} catch (err) {
		console.error('[upload-budget] check failed — allowing upload:', err);
		return true;
	}
}
