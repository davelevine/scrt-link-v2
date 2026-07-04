import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { createGuardHook } from 'svelte-guard';

import { ThemeOptions, TierOptions } from '$lib/data/enums';
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

type ThemeVars = { primary: string; primaryFg: string; accent: string };
type Theme = { light: ThemeVars; dark: ThemeVars };

const THEME_MAP: Record<ThemeOptions, Theme> = {
	[ThemeOptions.NAVY]: {
		light: { primary: '#1a2942', primaryFg: '#ffffff', accent: '#d92f2f' },
		dark: { primary: '#3a5a92', primaryFg: '#ffffff', accent: '#e85555' }
	},
	[ThemeOptions.PINK]: {
		light: { primary: '#e60077', primaryFg: '#ffffff', accent: '#2c1b55' },
		dark: { primary: '#ff3d96', primaryFg: '#ffffff', accent: '#f0e1ff' }
	},
	[ThemeOptions.PURPLE]: {
		light: { primary: '#70379d', primaryFg: '#ffffff', accent: '#f59e0b' },
		dark: { primary: '#a04be2', primaryFg: '#ffffff', accent: '#fbbf24' }
	},
	[ThemeOptions.BLUE]: {
		light: { primary: '#2071c9', primaryFg: '#ffffff', accent: '#f97316' },
		dark: { primary: '#60a5fa', primaryFg: '#000000', accent: '#fb923c' }
	},
	[ThemeOptions.TEAL]: {
		light: { primary: '#076969', primaryFg: '#ffffff', accent: '#f97316' },
		dark: { primary: '#2dd4bf', primaryFg: '#003838', accent: '#fb923c' }
	}
};

function buildThemeStyle(theme: Theme): string {
	const l = theme.light;
	const d = theme.dark;
	return `<style>
		:root {
			--color-primary: ${l.primary};
			--color-primary-foreground: ${l.primaryFg};
			--color-accent: ${l.accent};
		}
		.dark {
			--color-primary: ${d.primary};
			--color-primary-foreground: ${d.primaryFg};
			--color-accent: ${d.accent};
		}
	</style>`;
}

const handleTheme: Handle = async ({ event, resolve }) => {
	const themeOption =
		(event.locals.user?.preferences?.themeColor as ThemeOptions) ?? ThemeOptions.NAVY;
	const theme = THEME_MAP[themeOption] ?? THEME_MAP[ThemeOptions.NAVY];

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%THEME_CSS%', buildThemeStyle(theme))
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
