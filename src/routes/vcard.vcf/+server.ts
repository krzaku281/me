import sharp from 'sharp';
import { iconSvg } from '#lib/brand.ts';
import { DEFAULT_LOCALE } from '#lib/i18n/config.ts';
import { localizedPath } from '#lib/i18n/routes.ts';
import { SITE } from '#lib/site.ts';
import type { RequestHandler } from './$types';

export const prerender = true;
export const trailingSlash = 'never';

/** Escape a vCard text value (RFC 6350 §3.4). */
const text = (value: string) => value.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n');

/** Fold lines longer than 75 bytes (RFC 6350 §3.2). */
function fold(line: string) {
	const out: string[] = [];
	let current = '';
	for (const char of line) {
		if (Buffer.byteLength(current + char) > (out.length ? 74 : 75)) {
			out.push(current);
			current = '';
		}
		current += char;
	}
	out.push(current);
	return out.join('\r\n ');
}

// vCard 3.0: best supported by iOS, Android and desktop address books.
export const GET: RequestHandler = async ({ url }) => {
	const photo = await sharp(Buffer.from(iconSvg({ rounded: false })))
		.resize(256, 256)
		// Flat greys: a 16-colour PNG is ~1 KB, a JPEG of the same image ~5 KB
		.png({ palette: true, colours: 16, compressionLevel: 9 })
		.toBuffer();

	const lines = [
		'BEGIN:VCARD',
		'VERSION:3.0',
		`N:${text(SITE.familyName)};${text(SITE.givenName)};;;`,
		`FN:${text(SITE.name)}`,
		`EMAIL;TYPE=INTERNET:${SITE.email}`,
		...(SITE.phone ? [`TEL;TYPE=CELL:${SITE.phone}`] : []),
		`URL:${url.origin}${__BASE_PATH__}${localizedPath('home', DEFAULT_LOCALE)}`,
		`X-SOCIALPROFILE;TYPE=youtube:${SITE.youtube}`,
		`PHOTO;ENCODING=b;TYPE=PNG:${photo.toString('base64')}`,
		'END:VCARD'
	];

	return new Response(lines.map(fold).join('\r\n') + '\r\n', {
		headers: { 'content-type': 'text/vcard; charset=utf-8' }
	});
};
