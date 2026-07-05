import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { createGuardHook } from 'svelte-guard';

import { TierOptions } from '$lib/data/enums';
import { buildThemeCss, resolveThemeOption, THEME_STYLE_ID } from '$lib/data/theme';
import { paraglideMiddleware } from '$lib/paraglide/server';
import * as auth from '$lib/server/auth.js';
import { applyFrameHeaders } from '$lib/server/security-headers';

const guards = import.meta.glob('./routes/**/-guard.*');
export const handleGuards = createGuardHook(guards);

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		event.locals.effectiveTier = TierOptions.CONFIDENTIAL;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;
	// Billing is disabled on this instance: every authenticated user gets the top
	// tier. Anonymous visitors keep the free/default limits (see early return above).
	event.locals.effectiveTier = user ? TierOptions.TOP_SECRET_SERVICE : TierOptions.CONFIDENTIAL;

	return resolve(event);
};

// creating a handle to use the paraglide middleware
const paraglideHandle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace('%lang%', locale);
			}
		});
	});

const handleTheme: Handle = async ({ event, resolve }) => {
	const themeOption = resolveThemeOption(event.locals.user?.preferences?.themeColor);

	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace(
				'%THEME_CSS%',
				`<style id="${THEME_STYLE_ID}">${buildThemeCss(themeOption)}</style>`
			)
	});
};

const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=(), usb=(), payment=()'
	);

	applyFrameHeaders(response.headers);
	return response;
};

export const handle: Handle = sequence(
	handleSecurityHeaders,
	handleAuth,
	handleGuards,
	paraglideHandle,
	handleTheme
);
