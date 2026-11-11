/**
 * Personal data used across the site. Replace the placeholders.
 * Plain TS with no imports, so vite.config.ts can load it too.
 */
export const SITE = {
	name: 'Marek Krzak',
	givenName: 'Marek',
	familyName: 'Krzak',
	email: 'kontakt@example.com',
	/** Optional, e.g. '+48 600 000 000'. Empty = not shown in the vCard. */
	phone: '' as string,
	youtube: 'https://www.youtube.com/@your-channel',

	/**
	 * Public origin, used for absolute URLs (canonical, sitemap, Open Graph).
	 * The GitHub Actions build overrides it with SITE_ORIGIN.
	 */
	origin: 'https://marekkrzak.github.io',

	/**
	 * GoatCounter endpoint, e.g. 'https://YOURCODE.goatcounter.com/count'.
	 * Empty = analytics off. No cookies, so no consent banner is needed.
	 * Can be overridden at build time with GOATCOUNTER_URL.
	 */
	goatcounter: ''
} as const;
