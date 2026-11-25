import { appendFileSync, readFileSync } from 'node:fs';

const records = readFileSync('yarn-audit.json', 'utf8')
	.split(/\r?\n/)
	.filter(Boolean)
	.map((line) => JSON.parse(line));
const summary = records.find((record) => record.type === 'auditSummary')?.data;

if (!summary?.vulnerabilities) {
	throw new Error('yarn audit did not return a vulnerability summary.');
}

const severityExitCodes = { info: 1, low: 2, moderate: 4, high: 8, critical: 16 };
const { vulnerabilities } = summary;
const severities = Object.keys(severityExitCodes);
const count = (severity) => vulnerabilities[severity] ?? 0;
const dependencies = summary.totalDependencies;

if (!Number.isInteger(dependencies)) {
	throw new Error('yarn audit did not return a dependency count.');
}

const expectedExitCode = Object.entries(severityExitCodes).reduce(
	(code, [severity, bit]) => code + (count(severity) > 0 ? bit : 0),
	0
);

if (Number(process.argv[2]) !== expectedExitCode) {
	throw new Error('yarn audit failed unexpectedly or returned an inconsistent summary.');
}

const totalVulnerabilities = severities.reduce((total, severity) => total + count(severity), 0);
const blockingFindings = count('high') + count('critical');
const lines = [
	'## Dependency vulnerability audit',
	'',
	'| Severity | Findings |',
	'| --- | ---: |',
	...severities.map((severity) => `| ${severity} | ${count(severity)} |`),
	`| **Total** | **${totalVulnerabilities}** |`,
	'',
	`Audited ${dependencies} dependencies.`,
	'INFO, LOW, and MODERATE findings are accepted; HIGH and CRITICAL findings block the workflow.',
	blockingFindings > 0
		? `**Blocked:** ${blockingFindings} HIGH or CRITICAL finding(s). See the dependency-audit-report artifact for details.`
		: totalVulnerabilities > 0
			? 'Passed: no HIGH or CRITICAL findings. See the `dependency-audit-report` artifact for details.'
			: 'Passed: no vulnerabilities found.'
];

appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
process.exitCode = blockingFindings > 0 ? 1 : 0;
