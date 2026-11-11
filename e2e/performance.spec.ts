import { gzipSync } from 'node:zlib';
import { ALL_PAGES, BASE, expect, test, url } from './fixtures.ts';

/** Budgets. Raising one should be a conscious decision. */
const BUDGET = {
	/** gzip size of any page's HTML, including inlined CSS and script */
	htmlGzip: 9 * 1024,
	/** inline JavaScript per page (minified, uncompressed) */
	inlineJs: 4 * 1024
};

test(`every page: 200, right language, HTML under ${BUDGET.htmlGzip / 1024} KB gzip`, async ({
	request
}) => {
	for (const path of ALL_PAGES) {
		const response = await request.get(path);
		expect(response.status(), path).toBe(200);
		const html = await response.body();
		const lang = path.slice(BASE.length).split('/')[1];
		expect(html.toString(), path).toContain(`<html lang="${lang}"`);
		expect(gzipSync(html).length, path).toBeLessThan(BUDGET.htmlGzip);
	}
	for (const path of [url('/'), url('/404.html')]) {
		expect(gzipSync(await (await request.get(path)).body()).length, path).toBeLessThan(
			BUDGET.htmlGzip
		);
	}
});

test('a page loads only its HTML and images: no JS, CSS, fonts or third parties', async ({
	page
}) => {
	const extra: string[] = [];
	page.on('request', (r) => {
		const thirdParty = new URL(r.url()).host !== 'localhost:4174';
		if (thirdParty || ['script', 'stylesheet', 'font'].includes(r.resourceType())) {
			extra.push(`${r.resourceType()} ${r.url()}`);
		}
	});
	for (const path of ['/pl/', '/pl/edukacja/mensa/', '/ar/contact/', '/zh/sport/running/']) {
		await page.goto(url(path), { waitUntil: 'load' });
	}
	expect(extra).toEqual([]);
	expect(await page.content()).not.toContain('@font-face');

	const inline = await page.$$eval('script:not([type])', (s) =>
		s.map((x) => x.textContent!.length)
	);
	expect(inline).toHaveLength(1);
	expect(inline[0]).toBeLessThan(BUDGET.inlineJs);
});

test('footer shows the measured load time', async ({ page }) => {
	await page.goto(url('/pl/'));
	const perf = page.locator('[data-perf]');
	// Short form on screen, emoji hidden from screen readers
	await expect(perf.locator('[data-perf-short]')).toHaveText(/^🔥 \d+ ms · \d+\.\d KB$/);
	await expect(perf.locator('[data-perf-short]')).toHaveAttribute('aria-hidden', 'true');
	// Full translated sentence for screen readers and as the tooltip
	const full = /^Strona załadowała się w \d+ ms · \d+\.\d KB$/;
	await expect(perf.locator('[data-perf-full]')).toHaveText(full);
	await expect(perf).toHaveAttribute('title', full);
});

test('Speculation Rules prerender on hover; view transitions respect reduced motion', async ({
	page
}) => {
	await page.goto(url('/en/'));
	const rules = JSON.parse((await page.locator('script[type="speculationrules"]').textContent())!);
	expect(rules.prerender[0]).toMatchObject({ eagerness: 'moderate' });
	expect(JSON.stringify(rules)).toContain('/me/*');

	const html = await page.content();
	expect(html).toMatch(/@view-transition\s*\{\s*navigation:\s*auto/);
	expect(html).toMatch(
		/prefers-reduced-motion:\s*reduce\)\s*\{\s*@view-transition\s*\{\s*navigation:\s*none/
	);
});

test('photo is served as AVIF with fixed dimensions (no layout shift)', async ({ page }) => {
	await page.goto(url('/pl/edukacja/mensa/'));
	const img = page.locator('picture img');
	await expect(img).toHaveAttribute('width', /\d+/);
	await expect(img).toHaveAttribute('height', /\d+/);
	await expect(img).toHaveAttribute('fetchpriority', 'high');
	expect(await img.evaluate((i: HTMLImageElement) => i.currentSrc)).toMatch(/\.avif$/);
});
