import { redirectLocalized } from '$lib/i18n';

import type { PageServerLoad } from './$types';

// Billing is disabled on this instance and every account already has the top
// tier, so there is no pricing to show. Send visitors to the home page.
export const load: PageServerLoad = async () => {
	return redirectLocalized(307, '/');
};
