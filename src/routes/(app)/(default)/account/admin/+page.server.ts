import {
	getAdoptionRates,
	getApiKeyStats,
	getGlobalStats,
	getOrganizationSizes,
	getRecentSignups,
	getSecretCounts,
	getSecretRequestStats,
	getTopUsersBySecrets,
	getTotalOrganizations,
	getTotalUsers,
	getUserSignupsByMonth,
	getWhiteLabelStats
} from '$lib/server/analytics';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [
		totalUsers,
		userSignups,
		recentSignups,
		adoptionRates,
		globalStats,
		topUsers,
		secretCounts,
		secretRequestStats,
		totalOrganizations,
		organizationSizes,
		apiKeyStats,
		whiteLabelStats
	] = await Promise.all([
		getTotalUsers(),
		getUserSignupsByMonth(),
		getRecentSignups(10),
		getAdoptionRates(),
		getGlobalStats(),
		getTopUsersBySecrets(10),
		getSecretCounts(),
		getSecretRequestStats(),
		getTotalOrganizations(),
		getOrganizationSizes(),
		getApiKeyStats(),
		getWhiteLabelStats()
	]);

	return {
		pageTitle: 'Admin',
		totalUsers,
		userSignups,
		recentSignups,
		adoptionRates,
		globalStats,
		topUsers,
		secretCounts,
		secretRequestStats,
		totalOrganizations,
		organizationSizes,
		apiKeyStats,
		whiteLabelStats
	};
};
