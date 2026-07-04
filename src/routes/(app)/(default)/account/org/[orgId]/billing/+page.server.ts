import { redirectLocalized } from '$lib/i18n';

import type { PageServerLoad } from './$types';

// Billing is disabled on this instance. Redirect the (now unlinked) org billing
// page back to the organization overview.
export const load: PageServerLoad = async ({ params }) => {
	return redirectLocalized(302, `/account/org/${params.orgId}`);
};
