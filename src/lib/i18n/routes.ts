/**
 * Site map with translated URL slugs. Single source of truth for menu, links,
 * language switching, prerendering and the `reroute` hook.
 *
 * Every page lives in src/routes/[lang=lang]/<internal path>/+page.svelte,
 * where the internal path is built from `id`s (e.g. education/university).
 * Public URLs use the slugs of the given language: /pl/edukacja/politechnika/.
 * Plain TS with no SvelteKit imports, so vite.config.ts can load it.
 */
import { LOCALES, isLocale, type Locale } from './config.ts';

/** URL slug per language. Languages without one (ar, he, zh) use the English slug. */
type Slugs = Readonly<{ en: string } & Partial<Record<Locale, string>>>;

interface PageDef {
	readonly id: string;
	readonly slug: Slugs;
}

/** Menu-only grouping: has no page of its own, only children. */
interface GroupDef {
	readonly id: string;
	readonly slug: Slugs;
	readonly children: readonly PageDef[];
}

const same = (slug: string): Slugs => ({ en: slug });
const slugFor = (slug: Slugs, locale: Locale) => slug[locale] ?? slug.en;
const allLocales = (fn: (l: Locale) => string) =>
	Object.fromEntries(LOCALES.map((l) => [l, fn(l)])) as Record<Locale, string>;

export const SITE_MAP = [
	{ id: 'about', slug: { pl: 'o-mnie', en: 'about', de: 'ueber-mich' } },
	{
		id: 'education',
		slug: { pl: 'edukacja', en: 'education', de: 'bildung' },
		children: [
			{ id: 'university', slug: { pl: 'politechnika', en: 'university', de: 'hochschule' } },
			{ id: 'masters', slug: { pl: 'magisterium', en: 'masters', de: 'master' } },
			{ id: 'technical', slug: { pl: 'technikum', en: 'technical-school', de: 'technikum' } },
			{ id: 'mensa', slug: same('mensa') }
		]
	},
	{
		id: 'sport',
		slug: same('sport'),
		children: [
			{ id: 'club', slug: { pl: 'klub', en: 'club', de: 'verein' } },
			{ id: 'running', slug: { pl: 'bieganie', en: 'running', de: 'laufen' } }
		]
	},
	{
		id: 'growth',
		slug: { pl: 'rozwoj', en: 'growth', de: 'entwicklung' },
		children: [
			{ id: 'journeyman', slug: { pl: 'czeladnik', en: 'journeyman', de: 'geselle' } },
			{ id: 'reiki', slug: same('reiki') },
			{ id: 'prana', slug: same('prana') }
		]
	},
	{ id: 'youtube', slug: same('youtube') },
	{ id: 'contact', slug: { pl: 'kontakt', en: 'contact', de: 'kontakt' } }
] as const satisfies readonly (PageDef | GroupDef)[];

type Entry = (typeof SITE_MAP)[number];
type Leaf<T> = T extends { children: readonly (infer C)[] }
	? Leaf<C>
	: T extends { id: infer I }
		? I
		: never;

export type PageId = 'home' | Leaf<Entry>;
export type GroupId = Extract<Entry, { children: unknown }>['id'];
export type NavItem =
	{ kind: 'page'; id: PageId } | { kind: 'group'; id: GroupId; children: PageId[] };

export interface PageRoute {
	id: PageId;
	/** Route path built from ids, without locale: 'education/university' ('' for home). */
	internal: string;
	/** Translated path, without locale: 'edukacja/politechnika' ('' for home). */
	localized: Readonly<Record<Locale, string>>;
}

const PAGES: PageRoute[] = [{ id: 'home', internal: '', localized: allLocales(() => '') }];
const NAV: NavItem[] = [];

for (const entry of SITE_MAP as readonly (PageDef | GroupDef)[]) {
	if ('children' in entry) {
		for (const child of entry.children) {
			PAGES.push({
				id: child.id as PageId,
				internal: `${entry.id}/${child.id}`,
				localized: allLocales((l) => `${slugFor(entry.slug, l)}/${slugFor(child.slug, l)}`)
			});
		}
		NAV.push({
			kind: 'group',
			id: entry.id as GroupId,
			children: entry.children.map((c) => c.id as PageId)
		});
	} else {
		PAGES.push({
			id: entry.id as PageId,
			internal: entry.id,
			localized: allLocales((l) => slugFor(entry.slug, l))
		});
		NAV.push({ kind: 'page', id: entry.id as PageId });
	}
}

const byId = new Map(PAGES.map((p) => [p.id, p]));
const byInternal = new Map(PAGES.map((p) => [p.internal, p]));
const byLocalized = Object.fromEntries(
	LOCALES.map((l) => [l, new Map(PAGES.map((p) => [p.localized[l], p]))])
) as Record<Locale, Map<string, PageRoute>>;

export const NAVIGATION: readonly NavItem[] = NAV;

/** Public path (without base) of a page in a language, e.g. '/pl/edukacja/politechnika/'. */
export function localizedPath(id: PageId, locale: Locale): `/${string}` {
	const path = byId.get(id)!.localized[locale];
	return `/${locale}/${path ? path + '/' : ''}`;
}

/** Every public page path in every language, for prerendering. */
export function allPaths(): `/${string}`[] {
	return LOCALES.flatMap((l) => PAGES.map((p) => localizedPath(p.id, l)));
}

export const PAGE_IDS: readonly PageId[] = PAGES.map((p) => p.id);

export function isPageId(value: string): value is PageId {
	return byId.has(value as PageId);
}

/** Open Graph image of a page (without base), e.g. '/og/pl/mensa.png'. */
export function ogImagePath(id: PageId, locale: Locale): `/${string}` {
	return `/og/${locale}/${id}.png`;
}

export function ogImagePaths(): `/${string}`[] {
	return LOCALES.flatMap((l) => PAGES.map((p) => ogImagePath(p.id, l)));
}

/**
 * Maps a public path (without base) to the internal route path.
 * - `undefined`: not a language path, let SvelteKit handle it as is
 * - `null`: language path without such a page (404)
 */
export function toInternalPath(pathname: string): string | null | undefined {
	const [locale, ...rest] = pathname.split('/').filter(Boolean);
	if (!isLocale(locale)) return undefined;

	const page = byLocalized[locale].get(rest.join('/'));
	if (!page) return null;
	return `/${locale}${page.internal ? '/' + page.internal : ''}`;
}

/** Page id for a SvelteKit route id such as '/[lang=lang]/education/university'. */
export function pageIdFromRouteId(routeId: string | null): PageId | null {
	const match = routeId?.match(/^\/\[lang=lang\](?:\/(.*))?$/);
	if (!match) return null;
	return byInternal.get(match[1] ?? '')?.id ?? null;
}

/** Language from the first path segment (without base), if supported. */
export function localeFromPath(pathname: string): Locale | undefined {
	const first = pathname.split('/').find(Boolean);
	return isLocale(first) ? first : undefined;
}
