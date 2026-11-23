import { readFileSync } from 'node:fs';
import { test as base, expect, type Page } from '@playwright/test';
import { MCR } from 'monocart-coverage-reports';
import { LANGUAGE_NAMES, LOCALES, type Locale } from '../src/lib/i18n/config.ts';
import { allPaths, localizedPath, type PageId } from '../src/lib/i18n/routes.ts';
import coverageOptions from './coverage-config.ts';

/** Must match BASE_PATH / SITE_ORIGIN / GOATCOUNTER_URL in the `build:test` script. */
export const BASE = '/me';
export const ORIGIN = 'https://example.test';

export const url = (path: string) => BASE + path;
export const pagePath = (id: PageId, locale: Locale) => url(localizedPath(id, locale));

/** Every public page in every language, e.g. '/me/pl/edukacja/inzynier/'. */
export const ALL_PAGES = allPaths().map(url);
export { LANGUAGE_NAMES, LOCALES };

export const h1 = (page: Page) => page.locator('main h1');

/** A text from messages/<locale>.json by its dotted key, e.g. message('pl', 'error.back'). */
export function message(locale: Locale, key: string): string {
	const tree = JSON.parse(readFileSync(`messages/${locale}.json`, 'utf8'));
	return key.split('.').reduce((node, part) => node[part], tree);
}

/** Opens the language menu and picks a language (desktop and mobile). */
export async function chooseLanguage(page: Page, code: string) {
	const toggle = page.locator('button[popovertarget="main-nav"]');
	if (await toggle.isVisible()) await toggle.click();
	await page.locator('details.lang > summary').click();
	await page.locator(`details.lang a[data-lang="${code}"]`).click();
}

/** Page wider than the window (horizontal scrolling), in CSS pixels. */
export const overflowX = (page: Page) =>
	page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

/** Elements inside `lang` content with letter spacing, which breaks joined scripts. */
export const letterSpaced = (page: Page, lang: string) =>
	page.evaluate(
		(lang) =>
			[...document.querySelectorAll('body *')]
				.filter((el) => el.closest('[lang]')?.getAttribute('lang') === lang)
				.filter((el) => !['normal', '0px'].includes(getComputedStyle(el).letterSpacing))
				.map((el) => `${el.tagName}.${el.className}: ${getComputedStyle(el).letterSpacing}`),
		lang
	);

/**
 * Browser tests. Every test:
 * - fails on uncaught errors, console errors (including CSP violations) and broken
 *   sub-resources; a 404 of the page itself is fine, some tests expect it;
 * - skips the start page intro (2.4 s), unless it sets `intro: true`;
 * - collects JS coverage of the inline scripts in Chromium (for SonarCloud).
 */
export const test = base.extend<{
	intro: boolean;
	skipIntro: void;
	browserCoverage: void;
	consoleErrors: string[];
}>({
	intro: [false, { option: true }],
	skipIntro: [
		async ({ intro, page }, use) => {
			if (!intro) await page.addInitScript(() => sessionStorage.setItem('intro', '1'));
			await use();
		},
		{ auto: true }
	],
	browserCoverage: [
		async ({ browserName, page }, use) => {
			if (browserName !== 'chromium') {
				await use();
				return;
			}

			await page.coverage.startJSCoverage({ resetOnNavigation: false });
			try {
				await use();
			} finally {
				const coverage = await page.coverage.stopJSCoverage();
				if (coverage.length > 0) await MCR(coverageOptions).add(coverage);
			}
		},
		{ auto: true }
	],
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
