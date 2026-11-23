import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { MCR } from 'monocart-coverage-reports';
import coverageOptions, { buildCoverageDir, coverageOutputDir } from './coverage-config.ts';

export default async function generateCoverage() {
	const mcr = MCR(coverageOptions);
	if (existsSync(buildCoverageDir)) await mcr.addFromDir(buildCoverageDir);
	await mcr.generate();
	const reportPath = resolve(coverageOutputDir, 'lcov.info');
	const report = (await readFile(reportPath, 'utf8')).replace(
		/^SF:(.+)$/gm,
		(_, sourcePath: string) => `SF:${sourcePath.replaceAll('\\', '/')}`
	);
	await writeFile(reportPath, report);
	if (!/^SF:src\/lib\/client\//m.test(report)) {
		throw new Error('E2E coverage report has no covered client source files.');
	}
}
