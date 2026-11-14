import { rm } from 'node:fs/promises';
import { coverageOutputDir } from './coverage-config.ts';

export default async function setupCoverage() {
	await rm(coverageOutputDir, { recursive: true, force: true });
}
