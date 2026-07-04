import type { Reroute } from '@sveltejs/kit';

import { deLocalizeUrl } from '$lib/paraglide/runtime';

// Reroute (rewrite) for localization: a request to '/de/foo' uses route '/foo'.
export const reroute: Reroute = (request) => {
	return deLocalizeUrl(request.url).pathname;
};
