import { error, type RequestHandler } from '@sveltejs/kit';

// Billing is disabled on this instance. Checkout/plan-change are unavailable —
// every account already has the top tier, so there is nothing to purchase.
const disabled = () => error(410, 'Billing is disabled on this instance.');

export const POST: RequestHandler = async () => disabled();
export const PUT: RequestHandler = async () => disabled();
