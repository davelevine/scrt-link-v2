import type { RequestEvent } from '@sveltejs/kit';
import { RateLimiter } from 'sveltekit-rate-limiter/server';

import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { m } from '$lib/paraglide/messages.js';

import { PostgresRateLimiterStore } from './rate-limit-store';

export const limiter = new RateLimiter({
	// Shared store across all serverless instances. The default in-memory store
	// is per-lambda, so requests can bypass limits by hitting different instances.
	store: new PostgresRateLimiterStore(),
	IP: [500, 'h'], // IP address limiter (relaxed for shared IPs — CGNAT/corporate NATs can host 50+ users)
	IPUA: [15, 'm'], // IP + User Agent limiter
	cookie: {
		// Cookie limiter
		name: 'limiterid', // Unique cookie name for this limiter
		secret: env.RATE_LIMIT_COOKIE_SECRET ?? '', // Read at runtime ($env/dynamic/private)
		rate: [15, 'm'],
		// preflight: true causes the library to return hash() = false (not null) when the
		// cookie is missing, which triggers an IMMEDIATE block regardless of IP/IPUA counts.
		// A user with no cookie gets a 429 on their very first request. On Vercel serverless
		// this fires constantly: cold-start lambdas, edge-cached pages, and cookie-blocking
		// browsers all arrive without the cookie. With preflight: false the library sets the
		// cookie on the first action call itself (graceful fallback) and counts normally.
		preflight: false
	},
	onLimited: async (_event, reason) => {
		console.warn(`[rate-limit] blocked: reason=${reason}`);
	}
});

/** Returns true when the request should be blocked. Always false in development. */
export async function isRateLimited(event: RequestEvent): Promise<boolean> {
	if (dev) return false;
	return limiter.isLimited(event);
}

// Dedicated limiter for presigned-upload-URL minting. Kept separate from the
// form limiter above because a single large file is uploaded as many 64 MB
// chunks — each needing its own presign — which would trip the 15/min form
// limit. This is IP-only (API clients don't carry the limiter cookie) and tuned
// to comfortably fit a chunked multi-GB upload while blocking scripted abuse
// loops. Distinct rate config → distinct store hash, so it can't collide with
// the form limiter's counters.
export const uploadLimiter = new RateLimiter({
	store: new PostgresRateLimiterStore(),
	IP: [60, 'm']
});

/** True when presigned-upload requests from this IP should be blocked. */
export async function isUploadRateLimited(event: RequestEvent): Promise<boolean> {
	if (dev) return false;
	return uploadLimiter.isLimited(event);
}

/** Standardized 429 message payload — call at use-site so translations resolve correctly. */
export const rateLimitErrorMessage = (): App.Superforms.Message => ({
	status: 'error',
	title: m.nimble_fancy_pony_amuse(),
	description: m.blue_this_raven_seek()
});
