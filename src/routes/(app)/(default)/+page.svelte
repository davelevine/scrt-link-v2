<script lang="ts">
	import { page } from '$app/state';
	import CreateSecret from '$lib/components/blocks/create-secret.svelte';
	import HowItWorks from '$lib/components/blocks/how-it-works.svelte';
	import IntersectionObserver from '$lib/components/helpers/intersection-observer.svelte';
	import Page from '$lib/components/page/default-page.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Container from '$lib/components/ui/container/container.svelte';
	import { Section } from '$lib/components/ui/section';
	import { m } from '$lib/paraglide/messages.js';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Page title={m.lucky_warm_mayfly_engage()} lead={m.aloof_quaint_snail_pave()}>
	<Container class="mb-12">
		<CreateSecret form={data.secretForm} effectiveTier={data.effectiveTier} />
	</Container>
	<Section title={m.full_minor_fireant_accept()} lead={m.dirty_bright_robin_earn()}>
		<HowItWorks />
	</Section>

	<Section title={m.flat_zany_baboon_adapt()} lead={m.royal_odd_ox_read()}>
		<IntersectionObserver top={-100} once={true}>
			{#snippet children(intersecting)}
				<div
					class="flex transition-all {intersecting
						? 'translate-y-0 opacity-100 duration-500'
						: 'translate-y-10 opacity-0'}"
				>
					<Card class="mb-2">
						<div class="flex flex-col gap-4 py-2">
							<div class="font-mono text-sm break-all sm:text-lg">
								<span class="text-muted-foreground">https://{page.url.host}/s</span><span
									class="text-accent font-semibold">#Xy7k2p9wLqZ…</span
								>
							</div>
							<p>{m.equal_elegant_herring_yell()}</p>
						</div>
					</Card>
				</div>
			{/snippet}
		</IntersectionObserver>
	</Section>
</Page>
