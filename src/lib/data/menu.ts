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
		label: m.keen_swift_heron_ask(),
		badge: m.calm_tidy_finch_label()
	}
];

export const useCasesMenu = () => [
	{
		href: '/business',
		label: m.great_funny_beaver_gleam()
	},
	{
		href: '/use-cases/it-security',
		label: m.warm_calm_hawk_defend()
	},
	{
		href: '/use-cases/legal-compliance',
		label: m.clear_pure_owl_advise()
	},
	{
		href: '/use-cases/journalists',
		label: m.brave_sharp_fox_report()
	},
	{
		href: '/use-cases/customer-support',
		label: m.kind_warm_bear_assist()
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
	},
	{
		href: 'https://deepwiki.com/stophecom/scrt-link-v2',
		label: 'Wiki',
		externalLink: true
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
	},
	{
		href: '/faq',
		label: m.few_awful_chipmunk_trust()
	},
	{
		href: 'https://github.com/davelevine/scrt-link-v2',
		label: 'GitHub',
		externalLink: true
	},
	{
		href: 'https://scrt.link',
		label: 'scrt.link',
		externalLink: true
	}
];
