import { error } from '@sveltejs/kit';
import satori from 'satori';
import sharp from 'sharp';
import { LOGO_PATH, LOGO_SIZE } from '#lib/brand.ts';
import { navLabel, pageLead, pageTitle } from '#lib/i18n/index.ts';
import { textDirection, toLocale } from '#lib/i18n/config.ts';
import { NAVIGATION, isPageId, localizedPath } from '#lib/i18n/routes.ts';
import { m } from '#lib/paraglide/messages.js';
import { familyList, fontsFor, primaryFamily } from '#lib/server/og-fonts.ts';
import { SITE } from '#lib/site.ts';
import type { RequestHandler } from './$types';

export const prerender = true;
export const trailingSlash = 'never';

const WIDTH = 1200;
const HEIGHT = 630;

/** Minimal element helper for satori (it takes React-like objects). */
type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
	type,
	props: { style, children: children.length === 1 ? children[0] : children }
});

export const GET: RequestHandler = async ({ params, url }) => {
	if (!isPageId(params.id)) error(404);
	const id = params.id;
	const locale = toLocale(params.lang);

	const group = NAVIGATION.find((item) => item.kind === 'group' && item.children.includes(id));
	const isHome = id === 'home';
	const title = isHome ? SITE.name : pageTitle(id);
	const lead = isHome ? m['site.description']() : pageLead(id);
	const eyebrow = isHome ? '~/start' : group ? navLabel(group.id) : '';
	const address = `${url.host}${__BASE_PATH__}${localizedPath(id, locale)}`;

	const fonts = fontsFor([SITE.name, title, lead, eyebrow, address, locale].join(' '), locale);
	const main = familyList(fonts, primaryFamily(locale));
	const latin = familyList(fonts, 'Fira Mono');
	const rtl = textDirection(locale) === 'rtl';
	// Letter spacing is for Latin caps; it breaks Arabic and looks odd in Hebrew and Chinese.
	const latinScript = primaryFamily(locale) === 'Fira Mono';
	const tracking = (px: number) => (latinScript ? px : 0);
	// Latin-only strings (the "~/start" path, the name) keep the Latin font and LTR order
	const latinText = {
		fontFamily: latin,
		direction: 'ltr' as const,
		display: 'flex',
		width: '100%',
		justifyContent: rtl ? 'flex-end' : 'flex-start'
	};

	const logo: Node = {
		type: 'svg',
		props: {
			width: 56,
			height: 56,
			viewBox: `0 0 ${LOGO_SIZE} ${LOGO_SIZE}`,
			children: { type: 'path', props: { d: LOGO_PATH, fill: '#c8c8c8' } }
		}
	};

	const tree = el(
		'div',
		{
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			// satori defaults to content-box: without this the padding pushes content off the image
			boxSizing: 'border-box',
			width: '100%',
			height: '100%',
			padding: '72px 80px',
			direction: rtl ? 'rtl' : 'ltr',
			fontFamily: `${main}, ${latin}`,
			color: '#ececec',
			backgroundColor: '#0a0a0a',
			backgroundImage: 'radial-gradient(circle at 50% -20%, #2a2a2a 0%, #0c0c0c 55%, #070707 100%)'
		},
		el(
			'div',
			{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
			el(
				'div',
				{ display: 'flex', alignItems: 'center', gap: 24 },
				logo,
				el(
					'div',
					{ fontSize: 28, color: '#9a9a9a', letterSpacing: 1, fontFamily: latin },
					isHome ? '' : SITE.name
				)
			),
			el(
				'div',
				{
					display: 'flex',
					padding: '6px 18px',
					border: '1px solid #3a3a3a',
					borderRadius: 999,
					fontSize: 22,
					color: '#9a9a9a',
					letterSpacing: 4,
					fontFamily: latin
				},
				locale.toUpperCase()
			)
		),
		el(
			'div',
			{ display: 'flex', flexDirection: 'column', gap: 24 },
			el(
				'div',
				{
					fontSize: 24,
					color: '#868686',
					letterSpacing: isHome ? 6 : tracking(6),
					textTransform: 'uppercase',
					...(isHome ? latinText : {})
				},
				eyebrow
			),
			el(
				'div',
				{
					fontSize: title.length > 18 ? 84 : 112,
					lineHeight: 1.05,
					letterSpacing: isHome ? -3 : tracking(-3),
					...(isHome ? latinText : {}),
					backgroundImage: 'linear-gradient(180deg, #f2f2f2 30%, #8a8a8a 110%)',
					backgroundClip: 'text',
					color: 'transparent'
				},
				title
			),
			el('div', { fontSize: 32, color: '#9a9a9a', maxWidth: 900 }, lead)
		),
		el(
			'div',
			{
				display: 'flex',
				paddingTop: 28,
				borderTop: '1px solid #262626',
				fontSize: 22,
				color: '#868686',
				fontFamily: latin,
				// The URL is Latin even on RTL pages
				direction: 'ltr',
				justifyContent: rtl ? 'flex-end' : 'flex-start'
			},
			address
		)
	);

	const svg = await satori(tree as never, { width: WIDTH, height: HEIGHT, fonts });
	const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
	return new Response(new Uint8Array(png), { headers: { 'content-type': 'image/png' } });
};
