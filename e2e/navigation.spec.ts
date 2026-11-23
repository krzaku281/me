import { test as baseTest } from '@playwright/test';
import { LANGUAGE_NAMES, expect, h1, test, url } from './fixtures.ts';

test.describe('desktop menu', () => {
	// Regression: the dropdown used to close while the mouse crossed the gap to the list.
	// Playwright's default move jumps in one step, so move in small steps, diagonally to the
	// far end of the widest item, like a person does.
	test('mouse can travel from a group to an item and click it', async ({ page }) => {
		await page.goto(url('/en/'));
		const summary = page.locator('summary', { hasText: 'Education' });
		const link = page.locator('.sub a', { hasText: 'Technician' });

		const from = (await summary.boundingBox())!;
		await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
		await expect(link).toBeVisible();

		const to = (await link.boundingBox())!;
		await page.mouse.move(to.x + to.width - 8, to.y + to.height / 2, { steps: 25 });
		await expect(link).toBeVisible();
		await page.mouse.down();
		await page.mouse.up();

		await expect(page).toHaveURL(url('/en/education/technician/'));
		await expect(h1(page)).toHaveText('Technician');
		// On the new page the current item and its group are marked
		await expect(page.locator('.sub a[aria-current="page"]')).toHaveText('Technician');
		await expect(page.locator('summary.active')).toContainText('Education');
	});

	test('hover: clicking the label keeps it open, another group switches, leaving closes', async ({
		page
	}) => {
		await page.goto(url('/en/'));
		const sport = page.locator('summary', { hasText: 'Sport' });
		await sport.hover();
		await sport.click();
		await expect(page.getByRole('link', { name: 'Running' })).toBeVisible();

		const growth = (await page.locator('summary', { hasText: 'Growth' }).boundingBox())!;
		await page.mouse.move(growth.x + growth.width / 2, growth.y + growth.height / 2, { steps: 10 });
		await expect(page.getByRole('link', { name: 'Reiki' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Running' })).toBeHidden();

		await page.mouse.move(640, 500, { steps: 10 });
		await expect(page.getByRole('link', { name: 'Reiki' })).toBeHidden();
	});

	test('keyboard: Enter opens, Escape closes and returns focus; outside click closes', async ({
		page
	}) => {
		await page.goto(url('/en/'));
		const summary = page.locator('summary', { hasText: 'Sport' });
		const running = page.getByRole('link', { name: 'Running' });

		await summary.focus();
		await page.keyboard.press('Enter');
		await expect(running).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(running).toBeHidden();
		await expect(summary).toBeFocused();

		await page.keyboard.press('Enter');
		await expect(running).toBeVisible();
		await page.locator('main').click();
		await expect(running).toBeHidden();
	});
});

test.describe('certificates', () => {
	test('thumbnail opens the full scan, Escape and × close it', async ({ page }) => {
		await page.goto(url('/en/growth/reiki/'));
		const thumbs = page.locator('button.thumb');
		await expect(thumbs).toHaveCount(2);
		const viewer = page.locator('.viewer').first();
		const full = viewer.locator('img');

		// The full-size scan is not downloaded before it is opened
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		expect(await full.evaluate((i: HTMLImageElement) => i.currentSrc)).toBe('');

		await thumbs.first().click();
		await expect(viewer).toBeVisible();
		await expect(full).toHaveAttribute('alt', /Reiki Usui Shiki Ryoho/);
		await expect.poll(() => full.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBe(1280);
		await page.keyboard.press('Escape');
		await expect(viewer).toBeHidden();

		await thumbs.first().click();
		await viewer.getByRole('button').click();
		await expect(viewer).toBeHidden();
	});
});

baseTest.describe('without JavaScript', () => {
	baseTest.use({ javaScriptEnabled: false });

	baseTest('pages, menu dropdowns and the language menu work', async ({ page }) => {
		await page.goto(url('/pl/sport/bieganie/'));
		await expect(h1(page)).toHaveText('Bieganie');

		await page.locator('summary', { hasText: 'Edukacja' }).click();
		await expect(page.getByRole('link', { name: 'Inżynier' })).toBeVisible();

		await page.locator('details.lang > summary').click();
		await page.locator('details.lang a[data-lang="fa"]').click();
		await expect(page).toHaveURL(url('/fa/sport/running/'));
	});

	baseTest('"/" lists every language and the 404 page shows a message', async ({ page }) => {
		await page.goto(url('/'));
		await expect(page.locator('main.choose a')).toHaveText(Object.values(LANGUAGE_NAMES));
		await page.goto(url('/de/nope/'));
		await expect(page.locator('main.error h1').first()).toBeVisible();
	});
});
