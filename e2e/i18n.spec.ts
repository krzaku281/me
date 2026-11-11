import { chooseLanguage, expect, h1, test, url } from './fixtures.ts';

test.describe('language detection on "/"', () => {
	// Each case is a different rule of src/lib/client/redirect.js
	for (const { name, languages, expected } of [
		{ name: 'region is ignored', languages: ['de-AT'], expected: 'de' },
		{ name: 'any Chinese goes to zh', languages: ['zh-TW'], expected: 'zh' },
		{ name: 'later preferences count', languages: ['fr-FR', 'he-IL'], expected: 'he' },
		{ name: 'old Hebrew code "iw"', languages: ['iw'], expected: 'he' },
		{ name: 'unsupported falls back to en', languages: ['fr-FR', 'ja'], expected: 'en' }
	]) {
		test(`${name}: [${languages}] -> /${expected}/`, async ({ page }) => {
			await page.addInitScript((langs) => {
				Object.defineProperty(navigator, 'languages', { get: () => langs });
			}, languages);
			// Query and hash survive the redirect (e.g. campaign links on a business card)
			await page.goto(url('/?utm_source=card#x'));
			await expect(page).toHaveURL(url(`/${expected}/?utm_source=card#x`));
			await expect(page.locator('html')).toHaveAttribute('lang', expected);
		});
	}
});

test.describe('manual language choice', () => {
	test.use({ locale: 'de-DE' });

	test('keeps the page, translates the URL, flips direction and is remembered', async ({
		page
	}) => {
		await page.goto(url('/de/bildung/hochschule/'));

		// German slug -> English slug fallback, LTR -> RTL
		await chooseLanguage(page, 'ar');
		await expect(page).toHaveURL(url('/ar/education/university/'));
		await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
		await expect(h1(page)).toHaveText('الجامعة التقنية');

		// ...and back to a translated slug, RTL -> LTR
		await chooseLanguage(page, 'pl');
		await expect(page).toHaveURL(url('/pl/edukacja/politechnika/'));
		await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
		await expect(page).toHaveTitle('Politechnika · Marek Krzak');
		expect(await page.evaluate(() => localStorage.getItem('lang'))).toBe('pl');

		// Next visit: the saved choice wins over the browser language (de)
		await page.goto(url('/'));
		await expect(page).toHaveURL(url('/pl/'));
	});

	test('a shared link opens in its own language despite a saved choice', async ({ page }) => {
		await page.goto(url('/en/'));
		await page.evaluate(() => localStorage.setItem('lang', 'pl'));
		await page.goto(url('/de/kontakt/'));
		await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	});
});
