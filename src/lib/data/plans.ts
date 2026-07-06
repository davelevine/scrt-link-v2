import { SecretType } from '$lib/data/enums';
import { GB } from '$lib/data/units';

import { expiresInOptionsExtended } from './secretSettings';

// Billing and subscription tiers have been removed. Every feature is available
// to everyone; this returns a single, unlocked set of limits.
export const getUserPlanLimits = () => ({
	[SecretType.TEXT]: 100_000,
	[SecretType.FILE]: 1 * GB,
	[SecretType.REDIRECT]: true,
	[SecretType.SNAP]: true,
	[SecretType.NEOGRAM]: true,
	secretRequests: true,
	apiAccess: true,
	passwordAllowed: true,
	readReceiptsAllowed: true,
	expirationOptions: expiresInOptionsExtended,
	whiteLabel: true,
	maxViewLimit: 1000
});
