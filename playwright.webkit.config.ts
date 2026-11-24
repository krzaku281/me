import { defineConfig } from '@playwright/test';
import config from './playwright.config.ts';

export default defineConfig({
	...config,
	globalSetup: undefined,
	globalTeardown: undefined
});
