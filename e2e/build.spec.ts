/**
 * Checks of the built files over HTTP, without a browser: fast enough to cover every page
 * in every language. Browser behaviour is tested in the other spec files.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { expect, test, type APIRequestContext } from '@playwright/test';
import { DEFAULT_LOCALE, OG_LOCALES, textDirection, type Locale } from '../src/lib/i18n/config.ts';
import { PAGE_IDS, localizedPath, ogImagePath, type PageId } from '../src/lib/i18n/routes.ts';
import { SITE } from '../src/lib/site.ts';
import { ALL_PAGES, BASE, LOCALES, ORIGIN, url } from './fixtures.ts';

/** Budgets. Raising one should be a conscious decision. */
const BUDGET = {
	/** gzip size of a page's HTML with inlined CSS and scripts; ~14 KB is the first round trip */
	htmlGzip: 12 * 1024,
	/** executable inline JavaScript per page, minified, uncompressed */
	inlineJs: 4 * 1024
};

type Messages = {
	site: { description: string };
	page: Record<string, { title: string; lead: string }>;
};
const messages = (locale: Locale): Messages =>
	JSON.parse(readFileSync(`messages/${locale}.json`, 'utf8'));

const decode = (text: string) =>
	text
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, '&');

/** Values of attribute `name` on `tag` elements (optionally only those matching `where`). */
const attrs = (html: string, tag: string, name: string, where = '') =>
	[...html.matchAll(new RegExp(`<${tag}\\b(?=[^>]*${where})[^>]*\\b${name}="([^"]*)"`, 'g'))].map(
		(m) => decode(m[1])
	);
const meta = (html: string, key: string) =>
	attrs(html, 'meta', 'content', `(?:name|property)="${key}"`)[0];

const SCRIPT = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
const sha256 = (code: string) => `sha256-${createHash('sha256').update(code).digest('base64')}`;

/**
 * Inline scripts are allowed by hash only: each must be listed in the page's CSP, which
 * must come before any script. JSON-LD is data and is not executed.
 */
function checkCsp(html: string, path: string) {
	const cspAt = html.indexOf('http-equiv="content-security-policy"');
	expect(cspAt, `${path}: CSP meta`).toBeGreaterThan(0);
	expect(cspAt, `${path}: CSP before scripts`).toBeLessThan(html.indexOf('<script'));
	const csp = decode(html.slice(cspAt).match(/content="([^"]*)"/)![1]);
	expect(csp, path).toContain("object-src 'none'");
	expect(csp, path).toContain("base-uri 'none'");

	const scripts = [...html.matchAll(SCRIPT)].filter(([, a]) => !/ld\+json/.test(a));
	for (const [, , code] of scripts) expect(csp, `${path}: script hash`).toContain(sha256(code));
	const js = scripts.filter(([, a]) => !/type=/.test(a)).map(([, , code]) => code.length);
	expect(Math.max(0, ...js), `${path}: inline JS size`).toBeLessThan(BUDGET.inlineJs);
}

/** Each internal URL (links, images) is fetched once per worker. */
const checked = new Map<string, number>();
async function checkUrls(request: APIRequestContext, html: string, path: string) {
	const found = [
		...attrs(html, 'a', 'href'),
		...attrs(html, 'img', 'src'),
		...attrs(html, '(?:img|source)', 'srcset').flatMap((s) =>
			s.split(',').map((c) => c.trim().split(' ')[0])
		),
		...attrs(html, 'link', 'href', 'rel="(?:icon|apple-touch-icon)"')
	];
	for (const href of found) {
		if (/^(mailto|tel):/.test(href)) continue;
		if (/^https?:/.test(href)) continue; // external: checked below for rel
		const target = new URL(href, `http://localhost${path}`);
		const key = target.pathname;
		if (!checked.has(key)) checked.set(key, (await request.get(key)).status());
		expect(checked.get(key), `${path} links to ${key}`).toBe(200);
	}
	// External links must not leak window.opener and are skipped by speculation rules
	for (const tag of html.match(/<a\b[^>]*href="https?:[^"]*"[^>]*>/g) ?? []) {
		expect(tag, path).toMatch(/rel="[^"]*\bnoopener\b[^"]*\bexternal\b/);
	}
}

const hreflangs = (id: PageId) => [
	...LOCALES.map((alt) => `${alt} ${ORIGIN}${url(localizedPath(id, alt))}`),
	`x-default ${ORIGIN}${url(localizedPath(id, DEFAULT_LOCALE))}`
];

for (const locale of LOCALES) {
	test(`${locale}: every page is valid, small, safe and fully linked`, async ({ request }) => {
		const texts = messages(locale);
		const titles = texts.page;
		for (const id of PAGE_IDS) {
			const path = url(localizedPath(id, locale));
			const response = await request.get(path);
			expect(response.status(), path).toBe(200);
			const html = await response.text();

			expect(html, path).toContain(`<html lang="${locale}" dir="${textDirection(locale)}"`);
			expect(gzipSync(html).length, `${path}: gzip size`).toBeLessThan(BUDGET.htmlGzip);
			checkCsp(html, path);

			// Title, heading, description
			const title = id === 'home' ? SITE.name : `${titles[id].title} · ${SITE.name}`;
			expect(decode(html.match(/<title>([^<]*)<\/title>/)![1]), path).toBe(title);
			const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, '');
			expect(decode(heading ?? '').trim(), path).toBe(titles[id].title);
			const lead = id === 'home' ? texts.site.description : titles[id].lead;
			expect(meta(html, 'description'), path).toBe(lead);

			// Canonical and language alternates
			expect(attrs(html, 'link', 'href', 'rel="canonical"'), path).toEqual([ORIGIN + path]);
			const alternates = [
				...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)
			].map((m) => `${m[1]} ${m[2]}`);
			expect(alternates, path).toEqual(hreflangs(id));

			// Open Graph: tags and an existing 1200×630 PNG
			expect(meta(html, 'og:title'), path).toBe(title);
			expect(meta(html, 'og:locale'), path).toBe(OG_LOCALES[locale]);
			const ogImage = `${ORIGIN}${BASE}${ogImagePath(id, locale)}`;
			expect(meta(html, 'og:image'), path).toBe(ogImage);
			const png = await (await request.get(ogImage.replace(ORIGIN, ''))).body();
			expect(png.subarray(1, 4).toString(), ogImage).toBe('PNG');
			expect([png.readUInt32BE(16), png.readUInt32BE(20)], ogImage).toEqual([1200, 630]);

			await checkUrls(request, html, path);
		}
	});
}

test('"/" and 404.html are small and have a CSP', async ({ request }) => {
	for (const path of [url('/'), url('/404.html')]) {
		const html = await (await request.get(path)).text();
		expect(gzipSync(html).length, path).toBeLessThan(BUDGET.htmlGzip);
		checkCsp(html, path);
		await checkUrls(request, html, path);
	}
});

test('start page has Person structured data', async ({ request }) => {
	const html = await (await request.get(url('/en/'))).text();
	const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1];
	const data = JSON.parse(json);
	expect(data).toMatchObject({ '@context': 'https://schema.org', '@type': 'Person' });
	expect(data.name).toBe(SITE.name);
	expect(data.alumniOf.length).toBeGreaterThan(0);
	expect(data.memberOf).toEqual([{ '@type': 'Organization', name: 'Mensa Polska' }]);
	expect(data.sameAs).toEqual([SITE.youtube, SITE.linkedin, SITE.facebook]);
});

test('sitemap lists every page with alternates; robots points to it', async ({ request }) => {
	const sitemap = await (await request.get(url('/sitemap.xml'))).text();
	const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(ORIGIN, ''));
	expect(locs.sort()).toEqual([...ALL_PAGES].sort());
	expect(sitemap.match(/hreflang="x-default"/g)).toHaveLength(ALL_PAGES.length);

	const robots = await (await request.get(url('/robots.txt'))).text();
	expect(robots).toContain(`Sitemap: ${ORIGIN}/me/sitemap.xml`);
});

test('vCard is valid and small', async ({ request }) => {
	const response = await request.get(url('/vcard.vcf'));
	const body = await response.text();

	expect(response.headers()['content-type']).toContain('text/vcard');
	expect(body.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n')).toBe(true);
	expect(body.trimEnd().endsWith('END:VCARD')).toBe(true);
	expect(body).toContain(`FN:${SITE.name}`);
	expect(body).toContain(`N:${SITE.familyName};${SITE.givenName};;;`);
	if (SITE.phone) {
		expect(body).toContain(`TEL;TYPE=CELL:${SITE.phone}`);
	} else {
		expect(body).not.toMatch(/^TEL(?:;|:)/m);
	}
	expect(body).toContain('PHOTO;ENCODING=b;TYPE=PNG:');
	expect(
		body.split('\r\n').every((l) => Buffer.byteLength(l) <= 75),
		'folded lines'
	).toBe(true);
	expect(body.length).toBeLessThan(4 * 1024);
});

test('icons are small', async ({ request }) => {
	for (const icon of ['/favicon.svg', '/favicon.png', '/apple-touch-icon.png']) {
		const response = await request.get(url(icon));
		expect(response.status(), icon).toBe(200);
		expect((await response.body()).length, icon).toBeLessThan(2 * 1024);
	}
});

test('server: unknown paths are 404, paths outside the site are rejected', async ({ request }) => {
	expect((await request.get(url('/pl/nie-ma/'))).status()).toBe(404);
	// Internal, untranslated paths are 404 too, so each page has exactly one URL
	expect((await request.get(url('/pl/education/engineer/'))).status()).toBe(404);
	expect((await request.get(url('/pl/edukacja/magister/'))).status()).toBe(404);
	expect((await request.get(url('/en/education/master/'))).status()).toBe(404);
	expect((await request.get(url('/%5c..%5ce2e%5cserver.js'))).status()).toBe(404);
});
