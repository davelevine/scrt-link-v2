<script lang="ts">
	import EmailForm from '$lib/components/forms/email-form.svelte';
	import { SingleFormPage } from '$lib/components/page';
	import Link from '$lib/components/ui/link';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SingleFormPage title={m.tough_jumpy_anteater_taste()} description={m.teary_brief_robin_scoop()}>
	<EmailForm
		form={data.signupForm}
		buttonLabel={m.full_awake_puffin_pray()}
		formAction="?/signupWithEmail"
	/>
	<div class="px-5 text-center text-sm">
		{m.many_home_felix_seek()}
		<Link href={localizeHref('/login')}>{m.legal_weak_jay_bless()}</Link>
	</div>
	<div class="py-5">
		<Separator decorative />
	</div>
	<div class="muted px-5 text-center text-xs">
		{m.ornate_main_beaver_snip()}
		<Link href={localizeHref('/terms-of-service')}>{m.green_sharp_parrot_smile()}</Link>
	</div>
</SingleFormPage>
