import { resolve } from '$app/paths';
import { m } from '#lib/paraglide/messages.js';
import type { Locale } from './config';
import { localizedPath, type GroupId, type PageId } from './routes';

// Our paths come from the route table, not from route ids, so resolve() gets a plain pathname.
const resolvePath = resolve as (pathname: string) => ReturnType<typeof resolve>;

/** Link to a page in a language, with the base path applied. */
export function pageHref(id: PageId, locale: Locale) {
	return resolvePath(localizedPath(id, locale).slice(1));
}

export const navLabel = (id: PageId | GroupId, locale?: Locale) =>
	m[`nav.${id}`]({}, locale ? { locale } : {});

export const pageTitle = (id: PageId) => m[`page.${id}.title`]();
export const pageLead = (id: PageId) => m[`page.${id}.lead`]();
