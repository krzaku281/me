import { expect, h1, test, url } from './fixtures.ts';

test('RTL: Arabic page is mirrored, sans-serif, without letter spacing', async ({ page }) => {
	await page.goto(url('/ar/education/university/'));
	await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
	await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
	await expect(h1(page)).toHaveText('الجامعة التقنية');

	// Mirrored layout: brand on the right of the menu, timeline along the right edge
	const brand = (await page.locator('a.brand').boundingBox())!;
	const menu = (await page.locator('#main-nav').boundingBox())!;
	expect(brand.x).toBeGreaterThan(menu.x);
	const item = (await page.locator('.timeline li').first().boundingBox())!;
	const main = (await page.locator('main').boundingBox())!;
	expect(item.x + item.width).toBeGreaterThan(main.x + main.width * 0.9);

	expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toMatch(
		/^system-ui/
	);
	// The "~/" path stays left-to-right
	expect(await page.locator('.prompt').evaluate((e) => getComputedStyle(e).direction)).toBe('ltr');

	// Letter spacing would break the joined Arabic letters apart
	const spaced = await page.evaluate(() =>
		[...document.querySelectorAll('body *')]
			.filter((el) => el.closest('[lang]')?.getAttribute('lang') === 'ar')
			.filter((el) => !['normal', '0px'].includes(getComputedStyle(el).letterSpacing))
			.map((el) => `${el.tagName}.${el.className}: ${getComputedStyle(el).letterSpacing}`)
	);
	expect(spaced).toEqual([]);
});

test('RTL: Hebrew is right-to-left too', async ({ page }) => {
	await page.goto(url('/he/'));
	await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
	await expect(h1(page)).toHaveText('התחלה');
});

test('Chinese text gets a Chinese sans-serif after the monospace fonts', async ({ page }) => {
	await page.goto(url('/zh/'));
	await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
	expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toMatch(
		/^ui-monospace.*PingFang SC.*Microsoft YaHei/
	);
});

test.describe('language menu', () => {
	test('lists every language in its own script, direction and font', async ({ page }) => {
		await page.goto(url('/en/'));
		await page.locator('details.lang > summary').click();
		const names = page.locator('details.lang a span[lang]');
		await expect(names).toHaveText(['Polski', 'English', 'Deutsch', 'العربية', 'עברית', '中文']);
		await expect(page.locator('details.lang a[aria-current="true"]')).toHaveAttribute(
			'data-lang',
			'en'
		);
		const arabic = page.locator('details.lang span[lang="ar"]');
		await expect(arabic).toHaveAttribute('dir', 'rtl');
		// RTL snippets on an LTR page still get the sans-serif font
		expect(await arabic.evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/^system-ui/);
	});

	test('opens by click only, closes with Escape', async ({ page }) => {
		await page.goto(url('/en/'));
		const summary = page.locator('details.lang > summary');
		const first = page.locator('details.lang a').first();

		await summary.hover();
		await page.waitForTimeout(200);
		await expect(first).toBeHidden(); // unlike menu groups, no hover

		await summary.click();
		await expect(first).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(first).toBeHidden();
		await expect(summary).toBeFocused();
	});

	test('shares one "open" slot with the menu groups', async ({ page }) => {
		await page.goto(url('/en/'));
		await page.locator('summary', { hasText: 'Sport' }).focus();
		await page.keyboard.press('Enter');
		await page.locator('details.lang > summary').click();
		await expect(page.getByRole('link', { name: 'Running' })).toBeHidden();
		await expect(page.locator('details.lang a').first()).toBeVisible();
	});
});
