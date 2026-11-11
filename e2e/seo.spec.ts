import { ALL_PAGES, ORIGIN, expect, test, url } from './fixtures.ts';

test('page meta: title, description, canonical, hreflang', async ({ page }) => {
	await page.goto(url('/pl/edukacja/mensa/'));
	await expect(page).toHaveTitle('Mensa · Marek Krzak');
	await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		`${ORIGIN}/me/pl/edukacja/mensa/`
	);
	const alternates = await page
		.locator('link[rel="alternate"][hreflang]')
		.evaluateAll((links) =>
			links.map((l) => `${l.getAttribute('hreflang')} ${l.getAttribute('href')}`)
		);
	expect(alternates).toEqual([
		`pl ${ORIGIN}/me/pl/edukacja/mensa/`,
		`en ${ORIGIN}/me/en/education/mensa/`,
		`de ${ORIGIN}/me/de/bildung/mensa/`,
		`ar ${ORIGIN}/me/ar/education/mensa/`,
		`he ${ORIGIN}/me/he/education/mensa/`,
		`zh ${ORIGIN}/me/zh/education/mensa/`,
		`hi ${ORIGIN}/me/hi/education/mensa/`,
		`es ${ORIGIN}/me/es/educacion/mensa/`,
		`bn ${ORIGIN}/me/bn/education/mensa/`,
		`ru ${ORIGIN}/me/ru/education/mensa/`,
		`pt ${ORIGIN}/me/pt/educacao/mensa/`,
		`fr ${ORIGIN}/me/fr/formation/mensa/`,
		`id ${ORIGIN}/me/id/pendidikan/mensa/`,
		`ur ${ORIGIN}/me/ur/education/mensa/`,
		`ja ${ORIGIN}/me/ja/education/mensa/`,
		`x-default ${ORIGIN}/me/en/education/mensa/`
	]);
});

test('Open Graph tags point to an existing 1200×630 PNG', async ({ page, request }) => {
	await page.goto(url('/de/entwicklung/reiki/'));
	const og = (p: string) => page.locator(`meta[property="og:${p}"]`);
	await expect(og('title')).toHaveAttribute('content', 'Reiki · Marek Krzak');
	await expect(og('locale')).toHaveAttribute('content', 'de_DE');
	const image = await og('image').getAttribute('content');
	expect(image).toBe(`${ORIGIN}/me/og/de/reiki.png`);

	const png = await (await request.get(image!.replace(ORIGIN, ''))).body();
	expect(png.subarray(1, 4).toString()).toBe('PNG');
	expect(png.readUInt32BE(16)).toBe(1200);
	expect(png.readUInt32BE(20)).toBe(630);
});

test('start page has Person structured data', async ({ page }) => {
	await page.goto(url('/en/'));
	const data = JSON.parse(
		(await page.locator('script[type="application/ld+json"]').textContent())!
	);
	expect(data).toMatchObject({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Marek Krzak'
	});
	expect(data.alumniOf.length).toBeGreaterThan(0);
	expect(data.sameAs[0]).toMatch(/^https:\/\/www\.youtube\.com\//);
});

test('sitemap lists every page with alternates; robots points to it', async ({ request }) => {
	const sitemap = await (await request.get(url('/sitemap.xml'))).text();
	const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(ORIGIN, ''));
	expect(locs.sort()).toEqual([...ALL_PAGES].sort());
	expect(sitemap).toContain('hreflang="x-default"');

	const robots = await (await request.get(url('/robots.txt'))).text();
	expect(robots).toContain(`Sitemap: ${ORIGIN}/me/sitemap.xml`);
});

test('vCard is valid and small', async ({ page, request }) => {
	await page.goto(url('/pl/kontakt/'));
	const href = await page.locator('a.vcard').getAttribute('href');
	const response = await request.get(href!);
	const body = await response.text();

	expect(response.headers()['content-type']).toContain('text/vcard');
	expect(body.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n')).toBe(true);
	expect(body.trimEnd().endsWith('END:VCARD')).toBe(true);
	expect(body).toContain('FN:Marek Krzak');
	expect(body).toContain('N:Krzak;Marek;;;');
	expect(body).toContain('PHOTO;ENCODING=b;TYPE=PNG:');
	expect(
		body.split('\r\n').every((l) => Buffer.byteLength(l) <= 75),
		'folded lines'
	).toBe(true);
	expect(body.length).toBeLessThan(4 * 1024);
});

test('icons exist and are small', async ({ page, request }) => {
	await page.goto(url('/en/'));
	const icons = await page
		.locator('link[rel="icon"], link[rel="apple-touch-icon"]')
		.evaluateAll((links) => links.map((l) => (l as HTMLLinkElement).href));
	expect(icons).toHaveLength(3);
	for (const icon of icons) {
		const response = await request.get(icon);
		expect(response.status(), icon).toBe(200);
		expect((await response.body()).length, icon).toBeLessThan(2 * 1024);
	}
});

test('404 page is served in the language of the URL', async ({ page }) => {
	for (const [path, text, lang] of [
		['/de/gibt-es-nicht/', 'Diese Seite gibt es nicht.', 'de'],
		['/pl/nie-ma/', 'Nie ma takiej strony.', 'pl'],
		['/nothing/', 'This page does not exist.', 'en'],
		['/ar/nope/', 'هذه الصفحة غير موجودة.', 'ar'],
		['/zh/nope/', '此页面不存在。', 'zh'],
		// Internal, untranslated paths are 404 too, so each page has exactly one URL
		['/pl/education/engineer/', 'Nie ma takiej strony.', 'pl']
	]) {
		const response = await page.goto(url(path));
		expect(response?.status()).toBe(404);
		await expect(page.locator('[data-nf]:not([hidden]) h1')).toHaveText(text);
		await expect(page.locator('html')).toHaveAttribute('lang', lang);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	}
});
