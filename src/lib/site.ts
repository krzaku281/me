/**
 * Personal data used across the site.
 * Plain TS with no imports, so vite.config.ts can load it too.
 */
export const SITE = {
	name: 'Marek Krzak',
	givenName: 'Marek',
	familyName: 'Krzak',
	email: 'krzakmarek88@gmail.com',
	/** Optional, e.g. '+48 600 000 000'. Empty = not shown in the vCard. */
	phone: '' as string,
	linkedin: 'https://www.linkedin.com/in/marekkrzak/',
	youtube: 'https://www.youtube.com/@marekkrzak',
	facebook: 'https://www.facebook.com/marekkrzak88',

	/**
	 * Public origin, used for absolute URLs (canonical, sitemap, Open Graph).
	 * The GitHub Actions build overrides it with SITE_ORIGIN.
	 */
	origin: 'https://krzaku281.github.io',

	/**
	 * GoatCounter endpoint, e.g. 'https://YOURCODE.goatcounter.com/count'.
	 * Empty = analytics off. No cookies, so no consent banner is needed.
	 * Can be overridden at build time with GOATCOUNTER_URL.
	 */
	goatcounter: ''
} as const;
