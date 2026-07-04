import { m } from '$lib/paraglide/messages.js';
import { getOrganizationsByUserId } from '$lib/server/organization';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user!;

	const userOrganizations = await getOrganizationsByUserId(user.id);

	// Allow organization regardless of role. Limits currently restrict to 1 organization.
	const userOrganization = userOrganizations[0];

	return {
		user: user,
		userOrganization: userOrganization,
		userOrganizations,
		isPersistentHeader: true,
		headerBreadcrumb: m.novel_proud_anaconda_zoom()
	};
};
