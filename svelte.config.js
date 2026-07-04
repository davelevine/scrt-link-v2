import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md']
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter:
			process.env.ADAPTER === 'node'
				? (await import('@sveltejs/adapter-node')).default()
				: // Pin the Vercel serverless runtime to Node 24 (matches the repo's Node pin
					// in package.json `engines` + .npmrc). Also lets the adapter build succeed on
					// newer local Node versions instead of failing default-runtime detection.
					(await import('@sveltejs/adapter-vercel')).default({ runtime: 'nodejs24.x' }),

		csrf: { checkOrigin: process.env.CSRF_CHECK_ORIGIN === 'false' ? false : true }, // For debug purposes only

		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['none'],
				'script-src': [
					'self',
					// Hash of mode-watcher's inline anti-FOUC `setInitialMode` script in <head>.
					// SvelteKit doesn't nonce library-injected head scripts, so it must be
					// allowlisted by hash. Re-check this if mode-watcher is upgraded or its
					// <ModeWatcher> props change (the inline script content would change).
					'sha256-ROCYlxtWUqR9ME4wxI9LchLFa/eBFKzkqmIeHvTRK00=',
					'https://vercel.live'
				],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'blob:'],
				'media-src': ['self'],
				// Cloudflare R2 host — presigned uploads (POST) and file-chunk downloads
				// (GET) go to <bucket>.<account>.r2.cloudflarestorage.com.
				'connect-src': ['self', 'data:', 'https://*.r2.cloudflarestorage.com'],
				'frame-src': ['self', 'https://vercel.live'],
				'worker-src': ['self'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'frame-ancestors': ['none'],
				'form-action': ['self'],
				'manifest-src': ['self']
			}
		}
	},

	extensions: ['.svelte', '.svx', '.md']
};

export default config;
