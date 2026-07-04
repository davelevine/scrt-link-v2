import { PUBLIC_PRODUCTION_URL } from '$env/static/public';

export const isOriginalHostname = (hostname: string) => {
	// The app's own hosts: localhost, the production domain, and any Vercel
	// deployment/preview URL (*.vercel.app).
	return (
		hostname === 'localhost' ||
		hostname === PUBLIC_PRODUCTION_URL ||
		hostname === `www.${PUBLIC_PRODUCTION_URL}` ||
		hostname.endsWith('.vercel.app')
	);
};
