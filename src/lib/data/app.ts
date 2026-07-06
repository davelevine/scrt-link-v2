import {
	Flame,
	Handshake,
	Lock,
	LockKeyhole,
	ShieldCheck,
	ShieldPlus,
	Timer,
	Trash2,
	Zap
} from '@lucide/svelte';

import { m } from '$lib/paraglide/messages.js';

export const appName = 'Encoded';
export const emailSupport = 'dave@levine.io';
export const emailNoReply = 'no-reply@levine.io';
export const whiteLabelDemoWebsite = 'https://br3f.com';

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

export const businessFeatures = () => [
	{
		title: m.wide_zany_piranha_flow(),
		icon: Zap,
		description: m.loved_awful_okapi_revive({ SLA: 'SLA' })
	},
	{
		title: m.icy_topical_hare_peel(),
		icon: ShieldCheck,
		description: m.proof_seemly_eagle_cry()
	},
	{
		title: m.dull_round_javelina_cheer(),
		icon: Timer,
		description: m.spare_grand_dove_fry()
	}
];

export const securityFeatures = () => [
	{
		title: m.flat_zany_baboon_adapt(),
		icon: Lock,
		description: m.misty_giant_snake_swim()
	},
	{
		title: m.grand_vivid_newt_dash(),
		icon: Trash2,
		description: m.true_whole_quail_dust()
	},
	{
		title: m.basic_sound_rabbit_believe(),
		icon: Handshake,
		description: m.proof_every_gadfly_edit()
	},
	{
		title: m.minor_top_reindeer_cherish(),
		icon: Zap,
		description: m.cozy_top_ocelot_work()
	}
];
