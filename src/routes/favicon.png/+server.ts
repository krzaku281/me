import sharp from 'sharp';
import { ICON_SIZE, faviconSvg } from '#lib/brand.ts';

export const prerender = true;
export const trailingSlash = 'never';

// Fallback for browsers without SVG favicons (e.g. older Safari). Rendered 1:1 from the
// 32-unit pixel grid, so it is pixel-exact.
export async function GET() {
	const png = await sharp(Buffer.from(faviconSvg()), { density: 72 })
		.resize(ICON_SIZE, ICON_SIZE)
		.png({ palette: true, colours: 8, compressionLevel: 9 })
		.toBuffer();
	return new Response(new Uint8Array(png), { headers: { 'content-type': 'image/png' } });
}
