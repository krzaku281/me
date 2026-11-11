import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { LOCALES, SAMPLE_PAGES, expect, test, url } from './fixtures.ts';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

const describe = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
	violations.flatMap((v) =>
		v.nodes.slice(0, 5).map((n) => `${v.id}: ${n.target.join(' ')} ${n.any[0]?.message ?? ''}`)
	);

/**
 * 1. Full WCAG 2.2 AA audit.
 * 2. Contrast again with every background flattened to the lightest grey the page uses:
 *    axe cannot measure text over gradients and would skip it.
 */
async function audit(page: Page) {
	const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
	expect(describe(violations), 'WCAG violations').toEqual([]);

	await page.addStyleTag({
		content: `body, .bar, .vcard, .cta, .sub, .options, footer { background: #1a1a1a !important; backdrop-filter: none !important; }`
	});
	const contrast = await new AxeBuilder({ page })
		.withRules(['color-contrast'])
		.exclude('[aria-hidden="true"]') // decorative, e.g. the big "404"
		.analyze();
	expect(describe(contrast.violations), 'contrast on the lightest background').toEqual([]);
	// Gradient headings stay "incomplete"; anything else unmeasured is a gap in this test
	const unmeasured = contrast.incomplete
		.flatMap((v) => v.nodes)
		.filter((n) => !/h1/.test(n.target.join(' ')))
		.map((n) => n.target.join(' '));
	expect(unmeasured, 'text axe could not measure').toEqual([]);
}

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
	test.use({ reducedMotion: 'reduce' }); // measure after fade-ins, not during

	for (const path of SAMPLE_PAGES) {
		test(path, async ({ page }) => {
			await page.goto(path);
			await audit(page);
		});
	}

	test('open menu dropdown and language menu', async ({ page }) => {
		await page.goto(url('/en/'));
		await page.locator('summary', { hasText: 'Education' }).focus();
		await page.keyboard.press('Enter');
		await audit(page);
		await page.locator('details.lang > summary').click();
		await audit(page);
	});

	test('404 page and the language list on "/"', async ({ page }) => {
		await page.goto(url('/pl/nie-ma/'));
		await audit(page);

		// "/" redirects at once; audit what visitors without JavaScript see.
		// (axe itself needs JavaScript, so strip the redirect instead of disabling JS.)
		await page.route(url('/'), async (route) => {
			const html = await (await route.fetch()).text();
			await route.fulfill({
				contentType: 'text/html',
				body: html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
			});
		});
		await page.goto(url('/'));
		await expect(page.locator('main.choose a')).toHaveCount(LOCALES.length);
		await audit(page);
	});
});

test('keyboard: skip link is the first stop and jumps to the content', async ({ page }) => {
	await page.goto(url('/en/about/'));
	await page.keyboard.press('Tab');
	const skip = page.locator('a.skip');
	await expect(skip).toBeFocused();
	await expect(skip).toBeInViewport();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/#main$/);
});
