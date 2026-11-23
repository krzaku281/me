import { expect, test, url } from './fixtures.ts';

const curtain = '.curtain';

test.describe('start page intro', () => {
	test.use({ intro: true });

	test('plays once per session, then leaves a few icicles', async ({ page }) => {
		await page.goto(url('/en/'));
		await expect(page.locator('html')).toHaveAttribute('data-intro', '');
		await expect(page.locator(curtain)).toBeVisible();
		// Never blocks clicks, even while it plays
		await expect(page.locator(curtain)).toHaveCSS('pointer-events', 'none');
		await expect(page.locator(curtain)).toBeHidden({ timeout: 4000 });
		expect(await page.locator('.icicles > *').count()).toBeGreaterThan(0);

		// Same session (another tab or coming back): no replay
		await page.goto(url('/pl/'));
		await expect(page.locator('html')).not.toHaveAttribute('data-intro');
		await expect(page.locator(curtain)).toBeHidden();
	});

	test.describe('with reduced motion', () => {
		test.use({ reducedMotion: 'reduce' });

		test('does not play', async ({ page }) => {
			await page.goto(url('/en/'));
			await expect(page.locator('html')).not.toHaveAttribute('data-intro');
			await expect(page.locator(curtain)).toBeHidden();
		});
	});
});
