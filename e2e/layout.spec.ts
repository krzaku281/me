import { LOCALES, type Locale } from '../src/lib/i18n/config.ts';
import { PAGE_IDS } from '../src/lib/i18n/routes.ts';
import {
	LANGUAGE_NAMES,
	expect,
	h1,
	letterSpaced,
	message,
	overflowX,
	pagePath,
	test,
	url
} from './fixtures.ts';

const fontFamily = (page: import('@playwright/test').Page) =>
	page.evaluate(() => getComputedStyle(document.body).fontFamily);

test('RTL: Arabic page is mirrored, sans-serif, without letter spacing', async ({ page }) => {
	await page.goto(url('/ar/education/engineer/'));
	await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
	await expect(h1(page)).toHaveText('مهندس');

	// Mirrored layout: brand on the right of the menu, title against the right edge
	const brand = (await page.locator('a.brand').boundingBox())!;
	const menu = (await page.locator('#main-nav').boundingBox())!;
	expect(brand.x).toBeGreaterThan(menu.x);
	const title = (await h1(page).boundingBox())!;
	const main = (await page.locator('main article').boundingBox())!;
	expect(title.x + title.width).toBeCloseTo(main.x + main.width, 0);

	expect(await fontFamily(page)).toMatch(/^system-ui/);
	// The "~/" path stays left-to-right
	expect(await page.locator('.prompt').evaluate((e) => getComputedStyle(e).direction)).toBe('ltr');
	expect(await letterSpaced(page, 'ar')).toEqual([]);
});

for (const locale of ['fa', 'ur'] as const) {
	test(`${locale}: right-to-left, without letter spacing`, async ({ page }) => {
		await page.goto(url(`/${locale}/`));
		await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
		await expect(h1(page)).toHaveText(message(locale, 'page.home.title'));
		expect(await letterSpaced(page, locale)).toEqual([]);
	});
}

// Latin stays monospace; each script gets its system font instead of a random fallback.
// Letter spacing breaks the headstroke of Devanagari and Bengali and the Thai vowel marks.
for (const { locale, font, spacing } of [
	{ locale: 'zh', font: /^ui-monospace.*PingFang SC.*Microsoft YaHei/, spacing: true },
	{ locale: 'ja', font: /^ui-monospace.*Hiragino Sans.*Yu Gothic/, spacing: true },
	{ locale: 'ko', font: /^ui-monospace.*Apple SD Gothic Neo.*Malgun Gothic/, spacing: true },
	{ locale: 'th', font: /^ui-monospace.*Thonburi.*Leelawadee UI/, spacing: false },
	{ locale: 'hi', font: /^ui-monospace.*Noto Sans Devanagari/, spacing: false },
	{ locale: 'bn', font: /^ui-monospace.*Noto Sans Bengali/, spacing: false }
] satisfies { locale: Locale; font: RegExp; spacing: boolean }[]) {
	test(`${locale}: script-specific font${spacing ? '' : ', no letter spacing'}`, async ({
		page
	}) => {
		await page.goto(url(`/${locale}/`));
		await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
		expect(await fontFamily(page)).toMatch(font);
		if (!spacing) expect(await letterSpaced(page, locale)).toEqual([]);
	});
}

test.describe('language menu', () => {
	test('lists every language in its own script; opens by click only; Escape closes', async ({
		page
	}) => {
		await page.goto(url('/en/'));
		const summary = page.locator('details.lang > summary');
		const options = page.locator('details.lang .options');

		await summary.hover();
		await page.waitForTimeout(200);
		await expect(options).toBeHidden(); // unlike menu groups, no hover

		await summary.click();
		await expect(page.locator('details.lang a span[lang]')).toHaveText(
			Object.values(LANGUAGE_NAMES)
		);
		await expect(page.locator('details.lang a[aria-current="true"]')).toHaveAttribute(
			'data-lang',
			'en'
		);
		const arabic = page.locator('details.lang span[lang="ar"]');
		await expect(arabic).toHaveAttribute('dir', 'rtl');
		// RTL snippets on an LTR page still get the sans-serif font
		expect(await arabic.evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/^system-ui/);

		// Two columns: the whole list fits on a 1280×800 screen
		const box = (await options.boundingBox())!;
		expect(box.y + box.height).toBeLessThan(800);

		await page.keyboard.press('Escape');
		await expect(options).toBeHidden();
		await expect(summary).toBeFocused();
	});

	test('on a low window the list scrolls and its last language stays reachable', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1280, height: 420 });
		await page.goto(url('/en/'));
		await page.locator('details.lang > summary').click();
		const options = page.locator('details.lang .options');
		const box = (await options.boundingBox())!;
		expect(box.y + box.height).toBeLessThanOrEqual(420);

		const last = page.locator(`details.lang a[data-lang="${LOCALES.at(-1)}"]`);
		await last.scrollIntoViewIfNeeded();
		await expect(last).toBeInViewport();
		expect(await page.evaluate(() => window.scrollY)).toBe(0); // the list scrolled, not the page
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

// German and French have the longest words; Arabic is mirrored. Phones: see mobile.spec.ts.
for (const locale of ['de', 'fr', 'ar'] as const) {
	test(`${locale}: no horizontal scrolling on any page`, async ({ page }) => {
		for (const id of PAGE_IDS) {
			await page.goto(pagePath(id, locale));
			expect(await overflowX(page), id).toBeLessThanOrEqual(0);
		}
	});
}
