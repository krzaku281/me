import { expect, test } from '@playwright/test';

test('rejects paths outside the built site', async ({ request }) => {
	const response = await request.get('http://localhost:4174/me/%5c..%5ce2e%5cserver.js');
	expect(response.status()).toBe(404);
});
