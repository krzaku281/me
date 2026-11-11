import { DEFAULT_LOCALE, LOCALES } from '#lib/i18n/config.ts';
import { PAGE_IDS, localizedPath } from '#lib/i18n/routes.ts';
import type { RequestHandler } from './$types';

export const prerender = true;
export const trailingSlash = 'never';

export const GET: RequestHandler = ({ url }) => {
	const abs = (path: string) => `${url.origin}${__BASE_PATH__}${path}`;

	const entries = PAGE_IDS.flatMap((id) => {
		const alternates = [
			...LOCALES.map(
				(alt) =>
					`<xhtml:link rel="alternate" hreflang="${alt}" href="${abs(localizedPath(id, alt))}"/>`
			),
			`<xhtml:link rel="alternate" hreflang="x-default" href="${abs(localizedPath(id, DEFAULT_LOCALE))}"/>`
		].join('');
		return LOCALES.map(
			(locale) => `<url><loc>${abs(localizedPath(id, locale))}</loc>${alternates}</url>`
		);
	});

	const xml =
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
		entries.join('\n') +
		'\n</urlset>\n';

	return new Response(xml, { headers: { 'content-type': 'application/xml' } });
};
