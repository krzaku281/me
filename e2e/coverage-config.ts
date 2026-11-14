import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { minifySync } from 'vite';
import type { CoverageReportOptions } from 'monocart-coverage-reports';

export const coverageOutputDir = resolve('coverage-reports/e2e');

const inlineScripts = ['site', 'redirect'].map((name) => {
	const filePath = resolve(`src/lib/client/${name}.js`);
	const sourceFile = relative(process.cwd(), filePath).replaceAll('\\', '/');
	const { code, map } = minifySync(sourceFile, readFileSync(filePath, 'utf8'), {
		sourcemap: true
	});
	if (!map) throw new Error(`Could not create source map for ${sourceFile}.`);
	return { code: code.trim(), map };
});

const coverageOptions: CoverageReportOptions = {
	outputDir: coverageOutputDir,
	reports: [['lcovonly', { file: 'lcov.info', projectRoot: process.cwd() }]],
	cleanCache: false,
	sourcePath: (filePath) => filePath.replaceAll('\\', '/'),
	onEntry: (entry) => {
		const inlineScript = inlineScripts.find(({ code }) => entry.source?.trim() === code);
		if (inlineScript) entry.sourceMap = inlineScript.map;
	},
	sourceFilter: (sourcePath) => {
		const normalized = sourcePath.replaceAll('\\', '/');
		return normalized.startsWith('src/');
	},
	outputFilter: (entry) => {
		return entry.sourcePath.replaceAll('\\', '/').startsWith('src/lib/client/');
	}
};

export default coverageOptions;
