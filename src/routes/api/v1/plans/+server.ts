import { json } from '@sveltejs/kit';
import { Stripe } from 'stripe';

type PriceWithCurrencyOptions = Stripe.Price & {
	currency_options: Record<
		string,
		{
			custom_unit_amount: number | null;
			tax_behavior: Stripe.Price.TaxBehavior | null;
			unit_amount: number | null;
			unit_amount_decimal: number | null;
		}
	>;
};

// Stripe
export type Plan = {
	name: string;
	id: string;
	prices: { monthly: PriceWithCurrencyOptions; yearly: PriceWithCurrencyOptions };
	basePrices?: {
		monthly: PriceWithCurrencyOptions | undefined;
		yearly: PriceWithCurrencyOptions | undefined;
	};
};

// Billing is disabled on this instance: there is no Stripe catalog to expose.
export const GET = async () => {
	return json([] as Plan[]);
};
