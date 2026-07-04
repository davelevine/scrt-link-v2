<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { slide } from 'svelte/transition';

	import { cn } from '$lib/client/utils.js';

	// bits-ui v2's ContentProps no longer carries transition/transitionConfig, but
	// this wrapper applies a custom Svelte transition via a `child` snippet, so add
	// them back as props for callers.
	type $$Props = AccordionPrimitive.ContentProps & {
		transition?: typeof slide;
		transitionConfig?: Parameters<typeof slide>[1];
	};

	let className: $$Props['class'] = undefined;
	export let transition: NonNullable<$$Props['transition']> = slide;
	export let transitionConfig: NonNullable<$$Props['transitionConfig']> = {
		duration: 200
	};
	export { className as class };
</script>

<AccordionPrimitive.Content
	forceMount
	class={cn('overflow-hidden text-sm transition-all', className)}
	{...$$restProps}
>
	{#snippet child({ props, open }: { props: Record<string, unknown>; open: boolean })}
		{#if open}
			<div {...props} transition:transition={transitionConfig}>
				<div class="pt-0 pb-4">
					<slot />
				</div>
			</div>
		{/if}
	{/snippet}
</AccordionPrimitive.Content>
