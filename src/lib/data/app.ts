import { Flame, LockKeyhole, ShieldPlus } from '@lucide/svelte';

import { m } from '$lib/paraglide/messages.js';

export const appName = 'Secrets';
export const emailSupport = 'dave@levine.io';
export const emailNoReply = 'no-reply@levine.io';

export const privacyFeatures = () => [
	{
		icon: LockKeyhole,
		text: m.sea_giant_flamingo_forgive()
	},
	{
		icon: ShieldPlus,
		text: m.calm_proud_swan_host()
	},
	{
		icon: Flame,
		text: m.mean_smug_loris_cherish()
	}
];
