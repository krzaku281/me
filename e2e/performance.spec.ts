import { expect, test, url } from './fixtures.ts';

/** Budgets on the local test server (no network latency), with room for slow CI machines. */
const BUDGET = { lcp: 500, cls: 0.01 };

/** One page per layout; the build spec checks the HTML of every page. */
const SAMPLES = [
	'/pl/',
	'/pl/o-mnie/',
	'/pl/edukacja/mensa/',
	'/pl/sport/bieganie/',
	'/ar/growth/reiki/',
	'/zh/contact/'
];

test('pages load only HTML and images, fast and without layout shifts', async ({ page }) => {
	const extra: string[] = [];
	page.on('request', (r) => {
		const thirdParty = new URL(r.url()).host !== 'localhost:4174';
		// "ping": the analytics beacon, which the test build sends to the test server
		if (thirdParty || !['document', 'image', 'ping'].includes(r.resourceType())) {
			extra.push(`${r.resourceType()} ${r.url()}`);
		}
	});

	for (const path of SAMPLES) {
		await page.goto(url(path), { waitUntil: 'load' });
		const { lcp, cls } = await page.evaluate(
			() =>
				new Promise<{ lcp: number; cls: number }>((resolve) => {
					let lcp = 0;
					let cls = 0;
					new PerformanceObserver((list) => {
						for (const e of list.getEntries()) lcp = e.startTime;
					}).observe({ type: 'largest-contentful-paint', buffered: true });
					new PerformanceObserver((list) => {
						for (const e of list.getEntries() as unknown as { value: number }[]) cls += e.value;
					}).observe({ type: 'layout-shift', buffered: true });
					setTimeout(() => resolve({ lcp, cls }), 100);
				})
		);
		expect(lcp, `${path}: LCP`).toBeGreaterThan(0);
		expect(lcp, `${path}: LCP`).toBeLessThan(BUDGET.lcp);
		expect(cls, `${path}: CLS`).toBeLessThan(BUDGET.cls);
	}
	expect(extra, 'no scripts, styles, fonts or third parties').toEqual([]);
});

test('the first photo is AVIF, sized up front and loaded with high priority', async ({ page }) => {
	await page.goto(url('/pl/sport/bieganie/'));
	const img = page.locator('main picture img').first();
	await expect(img).toHaveAttribute('width', /\d+/);
	await expect(img).toHaveAttribute('height', /\d+/);
	await expect(img).toHaveAttribute('fetchpriority', 'high');
	await expect(img).not.toHaveAttribute('loading', 'lazy');
	expect(await img.evaluate((i: HTMLImageElement) => i.currentSrc)).toMatch(/\.avif$/);
	// Photos further down wait until they are scrolled to
	await expect(page.locator('main picture img').last()).toHaveAttribute('loading', 'lazy');
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

test('CSP blocks a script injected into the page', async ({ page, consoleErrors }) => {
	await page.goto(url('/en/'));
	const ran = await page.evaluate(() => {
		const w = window as unknown as { injected?: boolean };
		const script = document.createElement('script');
		script.textContent = 'window.injected = true';
		document.head.append(script);
		return w.injected === true;
	});
	expect(ran).toBe(false);

	// The browser reports exactly this violation; it is expected, so it is not a test error
	const isCsp = (e: string) => e.includes('Content Security Policy');
	expect(consoleErrors.filter(isCsp)).toHaveLength(1);
	consoleErrors.splice(0, consoleErrors.length, ...consoleErrors.filter((e) => !isCsp(e)));

	// The page's own scripts still run: site.js fills in the footer
	await expect(page.locator('[data-perf-short]')).not.toBeEmpty();
});
