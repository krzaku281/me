import { test as base, expect, type Page } from '@playwright/test';
import { LOCALES, type Locale } from '../src/lib/i18n/config.ts';
import { allPaths, localizedPath, type PageId } from '../src/lib/i18n/routes.ts';

/** Must match BASE_PATH / SITE_ORIGIN in the `build:test` script. */
export const BASE = '/me';
export const ORIGIN = 'https://example.test';

export const url = (path: string) => BASE + path;
export const pagePath = (id: PageId, locale: Locale) => url(localizedPath(id, locale));

/** Every public page in every language, e.g. '/me/pl/edukacja/politechnika/'. */
export const ALL_PAGES = allPaths().map(url);
export { LOCALES };

/**
 * One page of each layout (start, placeholder, timeline, photo + timeline, YouTube, contact)
 * in one language per kind of script: Latin (pl), right-to-left (ar), Chinese (zh).
 * Other languages render the same templates with different text.
 */
export const SAMPLE_PAGES = (['pl', 'ar', 'zh'] as const).flatMap((locale) =>
	(['home', 'about', 'university', 'mensa', 'youtube', 'contact'] as const).map((id) =>
		pagePath(id, locale)
	)
);

export const h1 = (page: Page) => page.locator('main h1');

/** Opens the language menu and picks a language (desktop and mobile). */
export async function chooseLanguage(page: Page, code: string) {
	const toggle = page.locator('button[popovertarget="main-nav"]');
	if (await toggle.isVisible()) await toggle.click();
	await page.locator('details.lang > summary').click();
	await page.locator(`details.lang a[data-lang="${code}"]`).click();
}

/**
 * Fails the test on uncaught errors, console errors and broken sub-resources
 * (images, fonts...). A 404 of the page itself is fine: some tests expect it.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
	consoleErrors: [
		async ({ page }, use) => {
			const errors: string[] = [];
			page.on('pageerror', (e) => errors.push(e.message));
			page.on('console', (m) => {
				if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) {
					errors.push(m.text());
				}
			});
			page.on('response', (r) => {
				if (r.status() >= 400 && r.request().resourceType() !== 'document') {
					errors.push(`${r.status()} ${r.url()}`);
				}
			});
			await use(errors);
			expect(errors, 'console errors').toEqual([]);
		},
		{ auto: true }
	]
});

export { expect };
