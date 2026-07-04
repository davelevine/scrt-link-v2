import {
	ConciergeBell,
	MessageCircleDashed,
	Paperclip,
	Redo2,
	TypeOutline,
	Zap
} from '@lucide/svelte';

import { m } from '$lib/paraglide/messages.js';

export const secretMenu = () => [
	{
		icon: TypeOutline,
		href: '/text',
		label: m.aloof_caring_anteater_compose()
	},
	{
		icon: Paperclip,
		href: '/file',
		label: m.formal_aware_platypus_charm()
	},
	{
		icon: Redo2,
		href: '/redirect',
		label: m.bad_royal_kudu_nudge()
	},
	{
		icon: Zap,
		href: '/snap',
		label: m.awake_big_halibut_view()
	},
	{
		icon: MessageCircleDashed,
		href: '/neogram',
		label: 'Neogram'
	},
	{
		icon: ConciergeBell,
		href: '/account/requests',
		label: m.keen_swift_heron_ask()
	}
];

export const productMenu = () => [
	{
		href: '/api-documentation',
		label: 'API Docs'
	},
	{
		href: '/cli',
		label: 'CLI'
	}
];

export const companyMenu = () => [
	{
		href: '/about',
		label: m.polite_misty_jan_hint()
	},
	{
		href: '/privacy',
		label: m.awake_frail_kitten_hush()
	},
	{
		href: '/security',
		label: m.nice_last_quail_pop()
	}
];

export const helpMenu = () => [
	{
		href: '/contact',
		label: m.early_bright_salmon_comfort()
	}
];
