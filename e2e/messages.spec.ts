/**
 * Translations, checked from the message files (no browser). Paraglide silently falls back
 * to English when a key is missing, so a gap would otherwise go unnoticed.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { LANGUAGE_NAMES, OG_LOCALES } from '../src/lib/i18n/config.ts';
import { LOCALES } from './fixtures.ts';

type Tree = { [key: string]: string | Tree };
const flatten = (tree: Tree, prefix = ''): [string, string][] =>
	Object.entries(tree).flatMap(([key, value]) =>
		key === '$schema'
			? []
			: typeof value === 'string'
				? [[prefix + key, value]]
				: flatten(value, `${prefix}${key}.`)
	);
const load = (locale: string) =>
	new Map(flatten(JSON.parse(readFileSync(`messages/${locale}.json`, 'utf8'))));
const placeholders = (text: string) => [...text.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort();

/** Polish is the source text; every language mirrors it. */
const source = load('pl');

test('one message file per language, and every language is configured', () => {
	const files = readdirSync('messages').map((f) => f.replace(/\.json$/, ''));
	expect(files.sort()).toEqual([...LOCALES].sort());
	const settings = JSON.parse(readFileSync('project.inlang/settings.json', 'utf8'));
	expect(settings.locales).toEqual([...LOCALES]);
	expect(Object.keys(LANGUAGE_NAMES)).toEqual([...LOCALES]);
	expect(Object.keys(OG_LOCALES)).toEqual([...LOCALES]);
});

test('every language has every text, with the same placeholders', () => {
	const problems: string[] = [];
	for (const locale of LOCALES) {
		const messages = load(locale);
		for (const [key, text] of source) {
			const translated = messages.get(key);
			if (translated === undefined) problems.push(`${locale}: missing ${key}`);
			else if (!translated.trim()) problems.push(`${locale}: empty ${key}`);
			else if (placeholders(translated).join() !== placeholders(text).join()) {
				problems.push(`${locale}: placeholders differ in ${key}`);
			}
		}
		for (const key of messages.keys()) {
			if (!source.has(key)) problems.push(`${locale}: unused ${key}`);
		}
	}
	expect(problems).toEqual([]);
});
