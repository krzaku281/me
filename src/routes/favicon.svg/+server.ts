import { faviconSvg } from '#lib/brand.ts';

export const prerender = true;
export const trailingSlash = 'never';

export function GET() {
	return new Response(faviconSvg(), { headers: { 'content-type': 'image/svg+xml' } });
}
