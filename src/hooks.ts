import type { Reroute } from '@sveltejs/kit/hooks';
import { toInternalPath } from '#lib/i18n/routes.ts';

const base = __BASE_PATH__;

/** Matches no route, so SvelteKit answers with 404. */
const NOT_FOUND = '/__not-found__';

// /pl/edukacja/politechnika/ -> /pl/education/university
// Internal paths typed directly (e.g. /pl/education/university/) give 404, so each page has one URL.
export const reroute: Reroute = ({ url }) => {
	if (base && !url.pathname.startsWith(base)) return;

	const internal = toInternalPath(url.pathname.slice(base.length));
	if (internal === undefined) return;
	return base + (internal ?? NOT_FOUND);
};
