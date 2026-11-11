/**
 * Language setup. Plain TS with no imports, so vite.config.ts can load it too.
 *
 * Adding a language (e.g. Arabic):
 *  1. add "ar" to `locales` in project.inlang/settings.json
 *  2. create messages/ar.json
 *  3. add it to LOCALES, LANGUAGE_NAMES and OG_LOCALES below and give it texts in
 *     src/lib/content/timeline.ts. Slugs in routes.ts are optional (English is the fallback).
 *  4. for Open Graph images in a new script, add a font in src/lib/og/fonts.ts
 * RTL languages get dir="rtl" automatically (see RTL_LANGUAGES).
 */
export const LOCALES = ['pl', 'en', 'de', 'ar', 'he', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];

/** Used when the browser language is not supported. */
export const DEFAULT_LOCALE: Locale = 'en';

/** localStorage key holding a language picked by hand. */
export const STORAGE_KEY = 'lang';

/** Native names, shown in the language menu. */
export const LANGUAGE_NAMES: Record<Locale, string> = {
	pl: 'Polski',
	en: 'English',
	de: 'Deutsch',
	ar: 'العربية',
	he: 'עברית',
	zh: '中文'
};

/** Locale codes for Open Graph (og:locale). */
export const OG_LOCALES: Record<Locale, string> = {
	pl: 'pl_PL',
	en: 'en_US',
	de: 'de_DE',
	ar: 'ar_AR',
	he: 'he_IL',
	zh: 'zh_CN'
};

const RTL_LANGUAGES = new Set(['ar', 'dv', 'fa', 'he', 'ks', 'ku', 'ps', 'sd', 'ug', 'ur', 'yi']);

export function isLocale(value: unknown): value is Locale {
	return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function toLocale(value: unknown): Locale {
	return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function textDirection(locale: string): 'ltr' | 'rtl' {
	return RTL_LANGUAGES.has(locale.split('-')[0].toLowerCase()) ? 'rtl' : 'ltr';
}
