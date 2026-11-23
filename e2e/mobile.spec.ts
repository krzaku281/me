import { PAGE_IDS } from '../src/lib/i18n/routes.ts';
import { LOCALES, chooseLanguage, expect, h1, overflowX, pagePath, test, url } from './fixtures.ts';

/** Budget: everything a phone downloads on a page, scrolled to the end. */
const PAGE_WEIGHT = 200 * 1024;

test('menu: open, Escape, groups, navigate, switch language', async ({ page }) => {
	await page.goto(url('/en/'));
	const menu = page.locator('#main-nav');
	const toggle = page.locator('button[popovertarget="main-nav"]');

	await expect(menu).toBeHidden();
	await toggle.click();
	await expect(menu).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(menu).toBeHidden();

	await toggle.click();
	await expect(menu.getByRole('link', { name: 'Running' })).toBeHidden();
	await menu.locator('summary', { hasText: 'Sport' }).click();
	await menu.getByRole('link', { name: 'Running' }).click();

	await expect(page).toHaveURL(url('/en/sport/running/'));
	await expect(h1(page)).toHaveText('Running');
	await expect(menu).toBeHidden();

	// The last language of the long list is reachable in the scrolling panel
	await chooseLanguage(page, LOCALES.at(-1)!);
	await expect(page).toHaveURL(url(`/${LOCALES.at(-1)}/sport/running/`));
});

for (const locale of ['pl', 'de'] as const) {
	test(`${locale}: no horizontal scrolling on any page`, async ({ page }) => {
		for (const id of PAGE_IDS) {
			await page.goto(pagePath(id, locale));
			expect(await overflowX(page), id).toBeLessThanOrEqual(0);
		}
	});
}

test(`every page weighs under ${PAGE_WEIGHT / 1024} KB on a phone`, async ({ page }) => {
	const cdp = await page.context().newCDPSession(page);
	await cdp.send('Network.enable');
	let bytes = 0;
	cdp.on('Network.loadingFinished', (e) => (bytes += e.encodedDataLength));

	for (const id of PAGE_IDS) {
		bytes = 0;
		await page.goto(pagePath(id, 'pl'));
		// Scroll in steps so lazy images load as they would for a reader
		await page.evaluate(async () => {
			for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) {
				scrollTo(0, y);
				await new Promise((r) => setTimeout(r, 50));
			}
		});
		await page.waitForLoadState('networkidle');
		expect(bytes, id).toBeLessThan(PAGE_WEIGHT);
	}
});
