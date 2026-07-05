<script lang="ts">
	import { type Snippet } from 'svelte';

	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { PUBLIC_ENV } from '$env/static/public';
	import Progress from '$lib/components/blocks/progress.svelte';
	import { appName } from '$lib/data/app';
	import { buildThemeCss, resolveThemeOption, THEME_STYLE_ID } from '$lib/data/theme';
	import { getLocale } from '$lib/paraglide/runtime';

	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// The theme's CSS variables are injected server-side (`%THEME_CSS%`) from the user at
	// the initial document load. Client-side navigations (e.g. logging in) never re-render
	// the <head>, so re-apply the signed-in user's saved theme here whenever it changes.
	// Done in-place (no full reload) so the in-memory master key and pending password survive.
	$effect(() => {
		if (!browser) return;
		const css = buildThemeCss(resolveThemeOption(data.user?.preferences?.themeColor));
		let style = document.getElementById(THEME_STYLE_ID);
		if (!style) {
			style = document.createElement('style');
			style.id = THEME_STYLE_ID;
			document.head.appendChild(style);
		}
		style.textContent = css;
	});
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="shortcut icon" href="/favicon.ico" />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/site.webmanifest" />

	<meta name="apple-mobile-web-app-title" content={appName} />
	<meta property="og:locale" content={getLocale()} />
	<meta property="og:site_name" content={appName} />

	<meta name="msapplication-TileColor" content="#172941" />
	<meta name="theme-color" content="#172941" />

	<meta property="og:url" content={page.url.href} />
	<meta property="og:type" content="website" />

	<meta property="og:image" content={`${page.url.origin}/og-image.png`} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={page.url.host} />

	{#if PUBLIC_ENV !== 'production'}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>
<Progress />
{@render children()}
