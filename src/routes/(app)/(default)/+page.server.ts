import { postSecret, postSecretRequest } from '$lib/server/form/actions';
import { secretFormValidator, secretRequestFormValidator } from '$lib/server/form/validators';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		secretForm: await secretFormValidator(),
		secretRequestForm: await secretRequestFormValidator()
	};
};

export const actions: Actions = {
	postSecret,
	postSecretRequest
};
