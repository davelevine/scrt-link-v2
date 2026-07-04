import { createEmail, emailList } from 'svelte-email-tailwind/preview';

export async function load() {
	// return the list of email components
	return { previewData: emailList() };
}

export const actions = {
	// Template preview only. The send-test action is omitted — this instance uses
	// Lettermint (see $lib/server/resend.ts) rather than the library's Resend sender.
	...createEmail
};
