import { defineConfig, devices } from '@playwright/test';

// The site is built into build-test/ with a GitHub Pages-like base path first
// (`yarn test:e2e` does it), then served by e2e/server.js.
export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: 'http://localhost:4174',
		trace: 'retain-on-failure'
	},
	webServer: {
		command: 'node e2e/server.js',
		url: 'http://localhost:4174/me/',
		reuseExistingServer: !process.env.CI
	},
	projects: [
		{
			name: 'desktop',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
			testIgnore: /mobile\.spec\.ts/
		},
		{ name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\.spec\.ts/ }
	]
});
