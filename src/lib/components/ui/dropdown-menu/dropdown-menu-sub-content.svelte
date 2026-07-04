<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	import { cn, flyAndScale } from '$lib/client/utils.js';

	type $$Props = DropdownMenuPrimitive.SubContentProps;

	let className: $$Props['class'] = undefined;
	export let transition = flyAndScale;
	export let transitionConfig = {
		x: -10,
		y: 0
	};
	export { className as class };
</script>

<DropdownMenuPrimitive.Portal>
	<DropdownMenuPrimitive.SubContent
		forceMount
		class={cn(
			'bg-popover text-popover-foreground z-50 min-w-[8rem] rounded-md border p-1 shadow-lg focus:outline-hidden',
			className
		)}
		{...$$restProps}
	>
		{#snippet child({ props, open }: { props: Record<string, unknown>; open: boolean })}
			{#if open}
				<div {...props} transition:transition={transitionConfig}>
					<slot />
				</div>
			{/if}
		{/snippet}
	</DropdownMenuPrimitive.SubContent>
</DropdownMenuPrimitive.Portal>
