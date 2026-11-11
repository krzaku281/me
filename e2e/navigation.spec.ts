import { expect, h1, test, url } from './fixtures.ts';

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

	test('clicking the label of a hovered dropdown keeps it open', async ({ page }) => {
		await page.goto(url('/en/'));
		const summary = page.locator('summary', { hasText: 'Sport' });
		await summary.hover();
		await summary.click();
		await expect(page.getByRole('link', { name: 'Running' })).toBeVisible();
	});

	test('hovering another group switches; leaving closes after a short delay', async ({ page }) => {
		await page.goto(url('/en/'));
		await page.locator('summary', { hasText: 'Sport' }).hover();
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

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('pages, menu dropdowns and the language menu work', async ({ page }) => {
		await page.goto(url('/pl/sport/bieganie/'));
		await expect(h1(page)).toHaveText('Bieganie');

		await page.locator('summary', { hasText: 'Edukacja' }).click();
		await expect(page.getByRole('link', { name: 'Inżynier' })).toBeVisible();

		await page.locator('details.lang > summary').click();
		await page.locator('details.lang a[data-lang="he"]').click();
		await expect(page).toHaveURL(url('/he/sport/running/'));
	});

	test('"/" lists languages and the 404 page shows a message', async ({ page }) => {
		await page.goto(url('/'));
		await expect(page.locator('main.choose a')).toHaveText([
			'Polski',
			'English',
			'Deutsch',
			'العربية',
			'עברית',
			'中文',
			'हिन्दी',
			'Español',
			'বাংলা',
			'Русский',
			'Português',
			'Français',
			'Bahasa Indonesia',
			'اردو',
			'日本語'
		]);
		await page.goto(url('/de/nope/'));
		await expect(page.locator('main.error h1').first()).toBeVisible();
	});
});
