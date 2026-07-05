import { ThemeOptions } from '$lib/data/enums';

// Theme color definitions, shared by the server (initial `%THEME_CSS%` injection in
// hooks.server.ts) and the client (reactive re-application after login / theme change
// in the app layout). Keeping them here — not in hooks.server.ts — lets both sides use
// the exact same values.

type ThemeVars = { primary: string; primaryFg: string; accent: string };
type Theme = { light: ThemeVars; dark: ThemeVars };

export const THEME_MAP: Record<ThemeOptions, Theme> = {
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

/** Coerce an unknown/absent value to a valid theme option (defaults to NAVY). */
export const resolveThemeOption = (value: unknown): ThemeOptions =>
	value != null && (value as ThemeOptions) in THEME_MAP ? (value as ThemeOptions) : ThemeOptions.NAVY;

/**
 * CSS custom properties for a theme, as the *inner* text of a `<style>` element
 * (no wrapping tags). Light values go on `:root`, dark values on `.dark`.
 */
export const buildThemeCss = (themeOption: ThemeOptions): string => {
	const theme = THEME_MAP[resolveThemeOption(themeOption)];
	const { light: l, dark: d } = theme;
	return (
		`:root{--color-primary:${l.primary};--color-primary-foreground:${l.primaryFg};--color-accent:${l.accent};}` +
		`.dark{--color-primary:${d.primary};--color-primary-foreground:${d.primaryFg};--color-accent:${d.accent};}`
	);
};

/** The DOM id of the `<style>` element that holds the theme custom properties. */
export const THEME_STYLE_ID = 'theme-vars';
