import sharp from 'sharp';
import { iconSvg } from '#lib/brand.ts';

export const prerender = true;
export const trailingSlash = 'never';

export async function GET() {
	const png = await sharp(Buffer.from(iconSvg({ rounded: false })))
		.resize(180, 180)
		.png({ palette: true, colours: 16, compressionLevel: 9 })
		.toBuffer();
	return new Response(new Uint8Array(png), { headers: { 'content-type': 'image/png' } });
}
