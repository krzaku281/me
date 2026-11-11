import { chooseLanguage, expect, h1, test, url } from './fixtures.ts';

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

	await chooseLanguage(page, 'de');
	await expect(page).toHaveURL(url('/de/sport/laufen/'));
});

test('no horizontal scrolling on any page type', async ({ page }) => {
	for (const path of [
		'/pl/',
		'/pl/edukacja/mensa/',
		'/pl/edukacja/inzynier/',
		'/pl/kontakt/',
		'/ar/education/engineer/'
	]) {
		await page.goto(url(path));
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		);
		expect(overflow, path).toBeLessThanOrEqual(0);
	}
});
