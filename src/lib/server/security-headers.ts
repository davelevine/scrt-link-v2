/**
 * Applies frame-embedding (clickjacking) protection headers to a response.
 *
 * Every response is fully frame-denied: `X-Frame-Options: DENY`. Both this and
 * CSP `frame-ancestors 'none'` (set in svelte.config.js) agree so modern and
 * legacy browsers behave the same.
 *
 * Mutates the passed `Headers` in place.
 */
export function applyFrameHeaders(headers: Headers): void {
	headers.set('X-Frame-Options', 'DENY');
}
