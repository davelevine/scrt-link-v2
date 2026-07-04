<script lang="ts">
	import {
		Body,
		Container,
		Head,
		Heading,
		Hr,
		Html,
		Img,
		Text
	} from 'svelte-email-tailwind';

	import { getBaseUrl } from '$lib/constants';
	import { appName } from '$lib/data/app';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';

	type Props = {
		name?: string;
	};

	let { name = '' }: Props = $props();
</script>

<Html lang={getLocale()} class="font-sans">
	<Head />
	<Body class="bg-background ">
		<Container class="py-12">
			<Img src={`${getBaseUrl()}/logo.png`} alt="Logo" width="140" height="140" />

			<Heading class="text-primary text-4xl ">{name ? 'Hi {name}' : 'Hi there'}</Heading>

			<Text class="mb-4 text-xl leading-snug"
				>{m.royal_watery_lionfish_glow()}
				<strong>{m.stock_round_finch_support()}</strong>
			</Text>

			<Text class="mb-10 text-lg">
				{m.curly_aqua_carp_arrive()}</Text
			>

			<Hr class="border-border mt-8" />

			<Text class="text-muted text-xs">
				©{new Date().getFullYear()}
				{appName}
			</Text>
		</Container>
	</Body>
</Html>
