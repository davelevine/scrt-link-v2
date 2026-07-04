import { type RequestHandler, text } from '@sveltejs/kit';

// Stripe billing is disabled on this instance. The subscription-webhook endpoint
// is intentionally inert — no Stripe events are received. Kept as a 410 stub so
// any lingering webhook configuration gets a clear, non-200 response.
export const POST: RequestHandler = async () => {
	return text('Billing is disabled on this instance.', { status: 410 });
};
