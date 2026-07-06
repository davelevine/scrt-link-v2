import { SecretType } from '$lib/data/enums';
import { GB } from '$lib/data/units';

import { expiresInOptionsExtended } from './secretSettings';

// The per-account limits applied across the app (text/file size, view count,
// expiry options, feature availability).
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
