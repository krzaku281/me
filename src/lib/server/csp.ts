/**
 * Content Security Policy for the prerendered pages.
 *
 * GitHub Pages cannot send response headers, so the policy goes into a
 * <meta http-equiv> tag. It only applies to what follows it, so it is placed
 * right after <meta charset>, before any script.
 *
 * Scripts: only the exact inline scripts of each page run. Their SHA-256 hashes
 * are taken from the final HTML, so editing a script needs no manual update.
 * Styles: 'unsafe-inline', because the inlined CSS and a few style attributes
 * (e.g. the light curtain strands) cannot be hashed in all browsers.
 */
import { createHash } from 'node:crypto';

/** Script tags that execute (JSON-LD is data and is not subject to script-src). */
const SCRIPT = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
const DATA_TYPE = /\btype="application\/ld\+json"/;

const hash = (code: string) =>
	`'sha256-${createHash('sha256').update(code, 'utf8').digest('base64')}'`;

/** Origin of the GoatCounter endpoint, if analytics is on (beacon or image request). */
const analytics = __GOATCOUNTER__ ? new URL(__GOATCOUNTER__).origin : '';

export function withCsp(html: string): string {
	const hashes = [...html.matchAll(SCRIPT)]
		.filter(([, attrs]) => !DATA_TYPE.test(attrs))
		.map(([, , code]) => hash(code));

	const policy = [
		"default-src 'self'",
		`script-src ${hashes.length ? [...new Set(hashes)].join(' ') : "'none'"}`,
		"style-src 'self' 'unsafe-inline'",
		`img-src 'self' data:${analytics ? ' ' + analytics : ''}`,
		`connect-src 'self'${analytics ? ' ' + analytics : ''}`,
		"object-src 'none'",
		"base-uri 'none'",
		"form-action 'none'"
	].join('; ');

	return html.replace(
		'<meta charset="utf-8" />',
		`<meta charset="utf-8" />\n\t\t<meta http-equiv="content-security-policy" content="${policy}" />`
	);
}
