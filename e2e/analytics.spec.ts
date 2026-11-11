import type { APIRequestContext } from '@playwright/test';
import { expect, test, url } from './fixtures.ts';

// The test build points GoatCounter at e2e/server.js (/gc/count), which records hits.
type Hit = Record<string, string>;
const hitsFor = async (request: APIRequestContext, marker: string) =>
	((await (await request.get('/gc/hits')).json()) as Hit[]).filter((h) => h.q === `?run=${marker}`);

test('one page view is counted, without cookies or storage', async ({
	page,
	request,
	context
}, info) => {
	const marker = `pv-${info.project.name}-${Date.now()}`;
	await page.goto(url(`/de/kontakt/?run=${marker}`));

	await expect.poll(() => hitsFor(request, marker)).toHaveLength(1);
	const [hit] = await hitsFor(request, marker);
	expect(hit).toMatchObject({ p: '/me/de/kontakt/', t: 'Kontakt · Marek Krzak' });
	expect(Number(hit.s)).toBeGreaterThan(0);
	expect(await context.cookies()).toEqual([]);
	expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});
