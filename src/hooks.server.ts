import type { Handle } from '@sveltejs/kit/hooks';
import { getRequestEvent } from '$app/server';
import { locales, overwriteGetLocale } from '#lib/paraglide/runtime.js';
import { DEFAULT_LOCALE, LOCALES, textDirection, toLocale } from '#lib/i18n/config.ts';

if (locales.join() !== LOCALES.join()) {
	throw new Error(
		`Locales in project.inlang/settings.json (${locales}) and src/lib/i18n/config.ts (${LOCALES}) differ`
	);
}

// During SSR/prerender the language is the [lang] segment of the current request.
overwriteGetLocale(() => {
	try {
		return toLocale(getRequestEvent().params.lang);
	} catch {
		return DEFAULT_LOCALE;
	}
});

export const handle: Handle = ({ event, resolve }) => {
	const locale = toLocale(event.params.lang);
	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('%lang%', locale).replace('%dir%', textDirection(locale))
	});
};
