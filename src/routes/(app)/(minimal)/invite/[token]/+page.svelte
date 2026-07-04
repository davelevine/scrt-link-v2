<script lang="ts">
	import { enhance } from '$app/forms';
	import { SingleFormPage } from '$lib/components/page';
	import Button from '$lib/components/ui/button/button.svelte';
	import { m } from '$lib/paraglide/messages.js';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SingleFormPage
	title={m.white_long_parakeet_buy()}
	description={data.organizationName
		? m.tough_keen_bee_pause({ organizationName: data.organizationName })
		: m.simple_last_slug_lend()}
>
	<form method="POST" action="?/acceptInvitation" use:enhance class="mt-12">
		<Button type="submit" class="w-full">{m.glad_loud_crab_accept()}</Button>
	</form>
</SingleFormPage>
