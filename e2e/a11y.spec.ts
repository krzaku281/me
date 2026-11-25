import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { LOCALES, expect, test, url } from './fixtures.ts';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/**
 * Every layout once in Polish, plus the scripts that change the layout or the fonts:
 * right-to-left (ar), Chinese (zh) and Thai (th). Other pages reuse the same components.
 */
const PAGES = [
	'/pl/',
	'/pl/o-mnie/',
	'/pl/edukacja/technik/',
	'/pl/edukacja/mensa/',
	'/pl/sport/klub/',
	'/pl/sport/bieganie/',
	'/pl/rozwoj/reiki/',
	'/pl/youtube/',
	'/pl/kontakt/',
	'/ar/sport/running/',
	'/zh/about/',
	'/th/growth/prana/'
];

const describe = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
	violations.flatMap((v) =>
		v.nodes.slice(0, 5).map((n) => `${v.id}: ${n.target.join(' ')} ${n.any[0]?.message ?? ''}`)
	);

/**
 * 1. Full WCAG 2.2 AA audit.
 * 2. Contrast again with every gradient background flattened to its lightest grey (#1a1a1a):
 *    axe cannot measure text over gradients and would skip it. Gradient text (the titles)
 *    is left alone and stays unmeasured.
 */
async function audit(page: Page, scope?: string) {
	const axe = () => (scope ? new AxeBuilder({ page }).include(scope) : new AxeBuilder({ page }));
	const { violations } = await axe().withTags(WCAG).analyze();
	expect(describe(violations), 'WCAG violations').toEqual([]);

	await page.evaluate(() => {
		for (const el of document.querySelectorAll<HTMLElement>('body, body *')) {
			const style = getComputedStyle(el);
			if (style.backgroundClip === 'text') continue;
			if (el === document.body || style.backgroundImage.includes('gradient')) {
				el.style.setProperty('background', '#1a1a1a', 'important');
			}
			if (style.backdropFilter !== 'none') el.style.setProperty('backdrop-filter', 'none');
		}
	});
	const contrast = await axe()
		.withRules(['color-contrast'])
		.exclude('[aria-hidden="true"]') // decorative, e.g. the big "404"
		.analyze();
	expect(describe(contrast.violations), 'contrast on the lightest background').toEqual([]);
	const unmeasured = contrast.incomplete
		.flatMap((v) => v.nodes)
		.filter((n) => !/h1/.test(n.target.join(' ')))
		.map((n) => n.target.join(' '));
	expect(unmeasured, 'text axe could not measure').toEqual([]);
}

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
	test.use({ reducedMotion: 'reduce' }); // measure after fade-ins, not during

	for (const path of PAGES) {
		test(path, async ({ page }) => {
			await page.goto(url(path));
			await audit(page);
		});
	}

	test('open menu dropdown, language menu and certificate viewer', async ({ page }) => {
		await page.goto(url('/en/growth/reiki/'));
		await page.locator('summary', { hasText: 'Education' }).focus();
		await page.keyboard.press('Enter');
		// The rest of the page was audited above; an open list covers some of it
		await audit(page, 'details[open]');
		await page.locator('details.lang > summary').click();
		await audit(page, 'details[open]');
		await page.keyboard.press('Escape');
		await page.locator('button.thumb').first().click();
		// The page behind the backdrop is inert; only the viewer counts
		await audit(page, '.viewer:popover-open');
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
