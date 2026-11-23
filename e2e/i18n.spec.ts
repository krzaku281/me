import { chooseLanguage, expect, h1, message, test, url } from './fixtures.ts';

test.describe('language detection on "/"', () => {
	// Each case is a different rule of src/lib/client/redirect.js
	for (const { name, languages, expected } of [
		{ name: 'region is ignored', languages: ['de-AT'], expected: 'de' },
		{ name: 'any Chinese goes to zh', languages: ['zh-TW'], expected: 'zh' },
		{ name: 'later preferences count', languages: ['nl-NL', 'fa-IR'], expected: 'fa' },
		{ name: 'old Indonesian code "in"', languages: ['in-ID'], expected: 'id' },
		{ name: 'unsupported falls back to en', languages: ['nl-NL', 'yi'], expected: 'en' }
	]) {
		test(`${name}: [${languages}] -> /${expected}/`, async ({ page }) => {
			await page.addInitScript((langs) => {
				Object.defineProperty(navigator, 'languages', { get: () => langs });
			}, languages);
			// Catch the redirect instead of loading the target: a 204 keeps the browser on "/",
			// which is faster and keeps the script's coverage (lost when the page is left)
			const target = new Promise<string>((resolve) => {
				void page.route(/\/me\/[a-z]{2}\//, (route) => {
					resolve(route.request().url());
					return route.fulfill({ status: 204 });
				});
			});
			await page.goto(url('/?utm_source=card'), { waitUntil: 'commit' });
			const { pathname, search } = new URL(await target);
			expect(pathname + search).toBe(url(`/${expected}/?utm_source=card`));
		});
	}
});

test.describe('manual language choice', () => {
	test.use({ locale: 'de-DE' });

	test('keeps the page, translates the URL, flips direction and is remembered', async ({
		page
	}) => {
		await page.goto(url('/de/bildung/ingenieur/'));

		// German slug -> English slug fallback, LTR -> RTL
		await chooseLanguage(page, 'ar');
		await expect(page).toHaveURL(url('/ar/education/engineer/'));
		await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
		await expect(h1(page)).toHaveText('مهندس');

		// ...and back to a translated slug, RTL -> LTR
		await chooseLanguage(page, 'pl');
		await expect(page).toHaveURL(url('/pl/edukacja/inzynier/'));
		await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
		await expect(page).toHaveTitle('Inżynier · Marek Krzak');
		expect(await page.evaluate(() => localStorage.getItem('lang'))).toBe('pl');

		// Next visit: the saved choice wins over the browser language (de).
		// Query and hash survive the redirect (e.g. campaign links on a business card).
		await page.goto(url('/?utm_source=card#x'));
		await expect(page).toHaveURL(url('/pl/?utm_source=card#x'));

		// ...but a shared link still opens in its own language
		await page.goto(url('/it/contatti/'));
		await expect(page.locator('html')).toHaveAttribute('lang', 'it');
	});
});

test('404 page is shown in the language of the URL', async ({ page }) => {
	for (const [path, lang, dir] of [
		['/de/gibt-es-nicht/', 'de', 'ltr'],
		['/nothing/', 'en', 'ltr'],
		['/fa/nope/', 'fa', 'rtl']
	] as const) {
		const response = await page.goto(url(path));
		expect(response?.status()).toBe(404);
		await expect(page.locator('[data-nf]:not([hidden]) h1')).toHaveText(
			message(lang, 'error.notFound')
		);
		await expect(page.locator('[data-nf]:not([hidden])')).toHaveCount(1);
		await expect(page.locator('html')).toHaveAttribute('lang', lang);
		await expect(page.locator('html')).toHaveAttribute('dir', dir);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	}
});
