<script lang="ts">
	import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	import Textarea from '$lib/components/forms/form-fields/textarea.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { m } from '$lib/paraglide/messages.js';
	import { stripPattern } from '$lib/utils';
	import { type ContactFormSchema, contactFormSchema } from '$lib/validators/formSchemas';

	import FormWrapper from './form-wrapper.svelte';

	let { data }: { data: SuperValidated<Infer<ContactFormSchema>> } = $props();

	const form = superForm(data, {
		validators: zod4Client(contactFormSchema()),
		validationMethod: 'auto',
		dataType: 'json',

		onSubmit: async ({ jsonData }) => {
			jsonData({ ...$formData });
		},

		onError({ result }) {
			// We use message for unexpected errors
			$message = {
				status: 'error',
				title: 'Unexpected error',
				description: result.error.message || 'Some error'
			};
		}
	});

	const { form: formData, message, delayed, constraints, enhance } = form;
</script>

<FormWrapper message={$message}>
	<form method="POST" action="?/contact" use:enhance>
		<Form.Field {form} name="email" class="py-4">
			<Form.Control let:attrs>
				<Form.Label>{m.clear_lost_goose_beam()}</Form.Label>
				<Input
					{...attrs}
					bind:value={$formData.email}
					{...stripPattern($constraints.email)}
					type="email"
				/>
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="content" class="flex min-h-32 flex-col justify-center">
			<Textarea
				bind:value={$formData.content}
				label={m.calm_low_turkey_explore()}
				placeholder={m.grand_male_jackal_persist()}
				{...$constraints.content}
			/>
		</Form.Field>

		<div class="py-4">
			<Form.Button delayed={$delayed} class="w-full" size="lg"
				>{m.flat_moving_finch_assure()}</Form.Button
			>
		</div>
	</form>
</FormWrapper>
