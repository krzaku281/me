import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { minifySync } from 'vite';
import type { CoverageReportOptions } from 'monocart-coverage-reports';

export const coverageOutputDir = resolve('coverage-reports/e2e');

/**
 * V8 coverage of `yarn build:test` (NODE_V8_COVERAGE): the prerender runs the server code
 * (routes, components, i18n, Open Graph images) once for every page, and the build spec
 * checks what it produced. Only the bundled server output is kept from it.
 */
export const buildCoverageDir = resolve('coverage-reports/build');

const inlineScripts = ['site', 'redirect', 'intro'].map((name) => {
	const filePath = resolve(`src/lib/client/${name}.js`);
	const sourceFile = relative(process.cwd(), filePath).replaceAll('\\', '/');
	const { code, map } = minifySync(sourceFile, readFileSync(filePath, 'utf8'), {
		sourcemap: true
	});
	if (!map) throw new Error(`Could not create source map for ${sourceFile}.`);
	return { code: code.trim(), map };
});

const isOwnSource = (sourcePath: string) => {
	const path = sourcePath.replaceAll('\\', '/');
	return (
		path.startsWith('src/') &&
		!path.startsWith('src/lib/paraglide/') &&
		/\.(js|ts|svelte)$/.test(path)
	);
};

const coverageOptions: CoverageReportOptions = {
	outputDir: coverageOutputDir,
	reports: [['lcovonly', { file: 'lcov.info', projectRoot: process.cwd() }]],
	cleanCache: false,
	sourcePath: (filePath) => filePath.replaceAll('\\', '/'),
	onEntry: (entry) => {
		const inlineScript = inlineScripts.find(({ code }) => entry.source?.trim() === code);
		if (inlineScript) entry.sourceMap = inlineScript.map;
	},
	entryFilter: (entry) =>
		entry.url.startsWith('http://localhost:4174/') ||
		entry.url.includes('/.svelte-kit/output/server/'),
	// Own sources only: no node_modules, no generated Paraglide messages
	sourceFilter: (sourcePath) => isOwnSource(sourcePath),
	outputFilter: (entry) => isOwnSource(entry.sourcePath)
};

export default coverageOptions;
