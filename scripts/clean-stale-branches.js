import { execFileSync } from 'node:child_process';

function runGit(args, stdio = ['ignore', 'pipe', 'inherit']) {
	return execFileSync('git', args, { encoding: 'utf8', stdio });
}

console.log('Pruning deleted remote branches from origin...');
runGit(['fetch', '--prune', 'origin'], 'inherit');

const currentBranch = runGit(['branch', '--show-current']).trim();
const branchRefs = runGit([
	'for-each-ref',
	'--format=%(refname:short)%09%(upstream:remotename)%09%(upstream:track)',
	'refs/heads'
]);
const staleBranches = branchRefs
	.split(/\r?\n/)
	.filter(Boolean)
	.flatMap((line) => {
		const [name, remote, tracking] = line.split('\t');
		return remote === 'origin' && tracking === '[gone]' ? [name] : [];
	});

if (staleBranches.length === 0) {
	console.log('No stale local branches tracking origin were found.');
} else {
	const mergedBranches = new Set(
		runGit(['branch', '--format=%(refname:short)', '--merged', 'HEAD'])
			.split(/\r?\n/)
			.filter(Boolean)
	);
	let removedCount = 0;

	for (const branch of staleBranches) {
		if (branch === currentBranch) {
			console.log(`Keeping ${branch}: it is currently checked out.`);
			continue;
		}

		if (!mergedBranches.has(branch)) {
			console.log(`Keeping ${branch}: it is not merged into ${currentBranch || 'HEAD'}.`);
			continue;
		}

		console.log(`Deleting ${branch}...`);
		runGit(['branch', '-d', '--', branch], 'inherit');
		removedCount += 1;
	}

	console.log(`Removed ${removedCount} stale local branch(es).`);
}
