<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

	import { cn } from '$lib/client/utils';
	import { localizeHref } from '$lib/paraglide/runtime';

	type Props = {
		class?: string;
		title: string;
		menu: { href: string; label: string; externalLink?: boolean; badge?: string }[];
	};
	let { title, menu, class: className }: Props = $props();
</script>

<div class={cn(className)}>
	<h5 class="text-primary p-1 font-semibold">{title}</h5>
	<ul class="">
		{#each menu as menuItem (menuItem.href)}
			<li class="flex items-center">
				<a
					class="flex items-center gap-1 p-1 py-2 font-medium hover:underline sm:py-1"
					target={menuItem?.externalLink ? '_blank' : ''}
					rel={menuItem?.externalLink ? 'noopener noreferrer' : undefined}
					href={menuItem?.externalLink ? menuItem.href : localizeHref(menuItem.href)}
				>
					{menuItem.label}
					{#if menuItem?.externalLink}
						<ArrowUpRight class="h-3.5 w-3.5" />
					{/if}
				</a>
				{#if menuItem?.badge}
					<span
						class="bg-foreground text-background ms-1 inline-flex rounded-full px-[5px] py-[1px] text-[9px] font-semibold uppercase"
						>{menuItem.badge}</span
					>
				{/if}
			</li>
		{/each}
	</ul>
</div>
