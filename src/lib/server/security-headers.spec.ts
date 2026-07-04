import { describe, expect, test } from 'vitest';

import { applyFrameHeaders } from './security-headers';

// Mirrors the frame-ancestors directive emitted by SvelteKit's CSP config.
const BASE_CSP =
	"default-src 'none'; script-src 'self'; frame-src 'self'; frame-ancestors 'none'; base-uri 'self'";

describe('applyFrameHeaders', () => {
	test('denies framing entirely', () => {
		const headers = new Headers({ 'content-security-policy': BASE_CSP });
		applyFrameHeaders(headers);
		expect(headers.get('X-Frame-Options')).toBe('DENY');
	});

	test('leaves the CSP frame-ancestors directive untouched', () => {
		const headers = new Headers({ 'content-security-policy': BASE_CSP });
		applyFrameHeaders(headers);
		expect(headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
	});

	test('sets DENY even when no CSP header is present', () => {
		const headers = new Headers();
		applyFrameHeaders(headers);
		expect(headers.get('X-Frame-Options')).toBe('DENY');
		expect(headers.get('content-security-policy')).toBeNull();
	});
});
