import type { RequestEvent } from '@sveltejs/kit';

import { dev } from '$app/environment';

// --- Cookie names ---

export const EMAIL_VERIFICATION_COOKIE = 'email_verification';
export const PASSWORD_VERIFIED_COOKIE = 'password-verified';
export const RECOVERY_VERIFIED_COOKIE = 'recovery-verified';
export const NEEDS_RECOVERY_COOKIE = 'needs-recovery';

// --- Secure cookie defaults ---

const SECURE_COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	secure: !dev,
	sameSite: 'strict' as const,
	maxAge: 60 * 5 // 5 minutes
};

// --- Verification cookie helpers ---

/** Set a short-lived cookie proving a server-side check passed, bound to a user ID. */
export function setVerificationCookie(event: RequestEvent, name: string, userId: string) {
	event.cookies.set(name, userId, SECURE_COOKIE_OPTIONS);
}

/**
 * Consume a verification cookie. Returns true if valid for the given user ID.
 * The cookie is deleted on success to prevent reuse.
 */
export function consumeVerificationCookie(
	event: RequestEvent,
	name: string,
	userId: string
): boolean {
	const value = event.cookies.get(name);
	if (!value || value !== userId) return false;
	event.cookies.delete(name, { path: '/' });
	return true;
}

// --- Recovery flow guard cookie ---

export function setNeedsRecoveryCookie(event: RequestEvent, userId: string) {
	event.cookies.set(NEEDS_RECOVERY_COOKIE, userId, {
		...SECURE_COOKIE_OPTIONS,
		maxAge: 60 * 60 // 1 hour
	});
}

export function hasNeedsRecoveryCookie(event: RequestEvent, userId: string): boolean {
	return event.cookies.get(NEEDS_RECOVERY_COOKIE) === userId;
}

export function deleteNeedsRecoveryCookie(event: RequestEvent) {
	event.cookies.delete(NEEDS_RECOVERY_COOKIE, { path: '/' });
}

// --- Email verification cookie ---

export function setEmailVerificationCookie(event: RequestEvent, email: string) {
	event.cookies.set(EMAIL_VERIFICATION_COOKIE, email, {
		path: '/',
		secure: !dev
	});
}

export function getEmailVerificationCookie(event: RequestEvent): string | undefined {
	return event.cookies.get(EMAIL_VERIFICATION_COOKIE);
}

export function deleteEmailVerificationCookie(event: RequestEvent) {
	event.cookies.delete(EMAIL_VERIFICATION_COOKIE, { path: '/' });
}
