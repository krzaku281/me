/**
 * Smoke test in WebKit (Safari's engine): the parts that rely on newer browser features.
 * Everything else is covered in Chromium.
 */
import { chooseLanguage, expect, h1, test, url } from './fixtures.ts';

test('pages render without errors under the CSP', async ({ page }) => {
	for (const path of ['/', '/pl/', '/fa/sport/running/', '/ja/growth/reiki/', '/de/nope/']) {
		await page.goto(url(path));
		// The 404 page holds a message per language; only the URL's one is shown
		const content = page.locator(
			'main [data-nf]:not([hidden]) h1, main:not(.error) h1, main.choose'
		);
		await expect(content.first()).toBeVisible();
	}
});

test('menu, language switch and certificate popover work', async ({ page }) => {
	await page.goto(url('/en/'));
	const sport = page.locator('summary', { hasText: 'Sport' });
	await sport.focus();
	await page.keyboard.press('Enter');
	await page.getByRole('link', { name: 'Running' }).click();
	await expect(h1(page)).toHaveText('Running');

	await chooseLanguage(page, 'de');
	await expect(page).toHaveURL(url('/de/sport/laufen/'));

	await page.goto(url('/en/growth/reiki/'));
	const viewer = page.locator('.viewer').first();
	await page.locator('button.thumb').first().click();
	await expect(viewer).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(viewer).toBeHidden();
});
