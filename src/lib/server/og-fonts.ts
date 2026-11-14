/**
 * Fonts for Open Graph images (build time only, never sent to visitors).
 *
 * Fontsource ships each font split into subsets with unicode ranges (Noto Sans SC alone
 * has ~100). For every image we load only the subsets that cover its text.
 *
 * Satori quirks this works around:
 * - it falls back per glyph only across fonts with *different* names, so every subset
 *   gets its own name;
 * - the first font decides which font the spaces come from; with a Latin font first,
 *   spaces between Arabic/Hebrew words get lost. So the script's own font goes first.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Locale } from '#lib/i18n/config.ts';

type Family =
	| 'Fira Mono'
	| 'Noto Sans Arabic'
	| 'Noto Sans Hebrew'
	| 'Noto Sans SC'
	| 'Noto Sans JP'
	| 'Noto Sans Devanagari'
	| 'Noto Sans Bengali';

const PACKAGES: Record<Family, string> = {
	'Fira Mono': 'fira-mono',
	'Noto Sans Arabic': 'noto-sans-arabic',
	'Noto Sans Hebrew': 'noto-sans-hebrew',
	'Noto Sans SC': 'noto-sans-sc',
	'Noto Sans JP': 'noto-sans-jp',
	'Noto Sans Devanagari': 'noto-sans-devanagari',
	'Noto Sans Bengali': 'noto-sans-bengali'
};

/** Main font per language. Latin-only bits (name, URL) always use Fira Mono. */
const PRIMARY: Record<Locale, Family> = {
	pl: 'Fira Mono',
	en: 'Fira Mono',
	de: 'Fira Mono',
	ar: 'Noto Sans Arabic',
	he: 'Noto Sans Hebrew',
	zh: 'Noto Sans SC',
	hi: 'Noto Sans Devanagari',
	es: 'Fira Mono',
	bn: 'Noto Sans Bengali',
	ru: 'Fira Mono',
	pt: 'Fira Mono',
	fr: 'Fira Mono',
	id: 'Fira Mono',
	ur: 'Noto Sans Arabic',
	ja: 'Noto Sans JP'
};

interface Face {
	family: Family;
	name: string;
	file: string;
	ranges: [number, number][];
}

// Prerendering runs in the project root.
const root = (pkg: string) => resolve('node_modules/@fontsource', pkg);

function parseFaces(family: Family): Face[] {
	const pkg = PACKAGES[family];
	const css = readFileSync(resolve(root(pkg), '400.css'), 'utf8');
	const faces: Face[] = [];
	for (const [, block] of css.matchAll(/@font-face\s*{([^}]*)}/g)) {
		const file = block.match(/url\(\.\/files\/([^)]+)\.woff2\)/)?.[1];
		const range = block.match(/unicode-range:\s*([^;]+);/)?.[1];
		if (!file || !range) continue;

		faces.push({
			family,
			name: `${family} ${faces.length}`,
			// Satori reads woff, not woff2
			file: resolve(root(pkg), 'files', `${file}.woff`),
			ranges: range.split(',').map((part) => {
				const [from, to] = part.trim().replace(/^U\+/i, '').split('-');
				return [Number.parseInt(from, 16), Number.parseInt(to ?? from, 16)];
			})
		});
	}
	return faces;
}

const FACES = (Object.keys(PACKAGES) as Family[]).flatMap(parseFaces);
const cache = new Map<string, Buffer>();
const load = (file: string) => cache.get(file) ?? cache.set(file, readFileSync(file)).get(file)!;

const covers = (face: Face, cp: number) => face.ranges.some(([a, b]) => cp >= a && cp <= b);

/** Satori `fonts` option for this text, primary language font first. */
export function fontsFor(text: string, locale: Locale) {
	const codePoints = [...new Set([...text, ' '].map((c) => c.codePointAt(0)!))];
	const used = FACES.filter((face) => codePoints.some((cp) => covers(face, cp)));
	used.sort((a, b) => Number(b.family === PRIMARY[locale]) - Number(a.family === PRIMARY[locale]));

	const missing = codePoints.filter((cp) => !used.some((face) => covers(face, cp)));
	if (missing.length) {
		const chars = missing.map((cp) => String.fromCodePoint(cp)).join('');
		throw new Error(
			`No OG font covers "${chars}" (${locale}). Add one in src/lib/server/og-fonts.ts`
		);
	}

	return used.map((face) => ({
		name: face.name,
		data: load(face.file),
		weight: 400 as const,
		style: 'normal' as const
	}));
}

/** CSS font-family value listing all loaded subsets of a family. */
export function familyList(fonts: { name: string }[], family: Family) {
	return fonts
		.filter((f) => f.name.startsWith(family + ' '))
		.map((f) => `'${f.name}'`)
		.join(', ');
}

export const primaryFamily = (locale: Locale) => PRIMARY[locale];
