<script lang="ts">
	import EmailForm from '$lib/components/forms/email-form.svelte';
	import { SingleFormPage } from '$lib/components/page';
	import Link from '$lib/components/ui/link';
	import { m } from '$lib/paraglide/messages.js';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SingleFormPage title={m.legal_weak_jay_bless()} description={m.ago_crazy_pelican_pray()}>
	<EmailForm form={data.emailForm} formAction="?/loginWithEmail" />
	<div class="px-5 text-center text-sm">
		{m.warm_ideal_butterfly_radiate()}
		<Link href="/signup">{m.grassy_sea_pug_gasp()}</Link>
	</div>
</SingleFormPage>
