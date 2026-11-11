import type { RequestHandler } from './$types';

export const prerender = true;
export const trailingSlash = 'never';

export const GET: RequestHandler = ({ url }) =>
	new Response(`User-agent: *\nAllow: /\n\nSitemap: ${url.origin}${__BASE_PATH__}/sitemap.xml\n`, {
		headers: { 'content-type': 'text/plain' }
	});
