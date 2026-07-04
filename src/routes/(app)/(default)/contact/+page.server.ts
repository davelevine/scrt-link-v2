import { type Actions, error } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { m } from '$lib/paraglide/messages.js';
import { isRateLimited, rateLimitErrorMessage } from '$lib/server/rate-limit';
import { sendContactEmail } from '$lib/server/transactional-email';
import { contactFormSchema } from '$lib/validators/formSchemas';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(contactFormSchema()))
	};
};

export const actions: Actions = {
	contact: async (event) => {
		const form = await superValidate(event.request, zod4(contactFormSchema()));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (await isRateLimited(event)) return message(form, rateLimitErrorMessage(), { status: 429 });

		const { email, content } = form.data;

		try {
			// We send an email
			await sendContactEmail(email, content);
		} catch (e) {
			console.error(e);
			error(400, 'Something went wrong.');
		}

		return message(form, {
			status: 'success',
			title: m.low_many_porpoise_dazzle(),
			description: m.away_free_crow_vent()
		});
	}
};
