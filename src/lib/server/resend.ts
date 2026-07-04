import { EMAIL_FROM, LETTERMINT_TOKEN } from '$env/static/private';

import { appName, emailNoReply } from '../data/app';

// Transactional email is sent via Lettermint (https://lettermint.co).
// The `from` address MUST use a domain verified in your Lettermint project —
// set `EMAIL_FROM` (e.g. `Acme <no-reply@acme.com>`). Falls back to the app
// defaults only for local development.
const fromAddress = EMAIL_FROM || `${appName} <${emailNoReply}>`;

const LETTERMINT_ENDPOINT = 'https://api.lettermint.co/v1/send';

type SendEmailOptions = {
	to: string | string[];
	subject: string;
	html: string;
	cc?: string | string[];
	bcc?: string | string[];
	replyTo?: string | string[];
};

const toArray = (value?: string | string[]): string[] | undefined =>
	value === undefined ? undefined : Array.isArray(value) ? value : [value];

/**
 * Sends a transactional email through Lettermint's REST API. Non-throwing:
 * failures are logged (mirrors the previous provider's behavior) so callers in
 * auth/secret flows are never broken by a transient email error.
 */
const sendTransactionalEmail = async ({
	to,
	subject,
	html,
	cc,
	bcc,
	replyTo
}: SendEmailOptions) => {
	if (!LETTERMINT_TOKEN) {
		console.error('[email] LETTERMINT_TOKEN is not set — email not sent.');
		return;
	}

	try {
		const response = await fetch(LETTERMINT_ENDPOINT, {
			method: 'POST',
			headers: {
				'x-lettermint-token': LETTERMINT_TOKEN,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: fromAddress,
				to: toArray(to),
				subject,
				html,
				...(cc ? { cc: toArray(cc) } : {}),
				...(bcc ? { bcc: toArray(bcc) } : {}),
				...(replyTo ? { reply_to: toArray(replyTo) } : {})
			})
		});

		// Lettermint returns 202 on success.
		if (!response.ok) {
			const body = await response.text().catch(() => '');
			console.error(`[email] Lettermint send failed: ${response.status} ${body}`);
		}
	} catch (error) {
		console.error({ error });
	}
};

export default sendTransactionalEmail;
