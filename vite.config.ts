import { readFileSync } from 'node:fs';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { enhancedImages } from '@sveltejs/enhanced-img';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, minifySync, type Plugin } from 'vite';
import { allPaths, ogImagePaths } from './src/lib/i18n/routes.ts';
import { SITE } from './src/lib/site.ts';

// GitHub Pages serves project sites from /<repo>. The workflow passes it in BASE_PATH.
const base = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
if (base && !base.startsWith('/')) throw new Error(`BASE_PATH must start with "/": ${base}`);

// Public origin for absolute URLs (canonical, hreflang, sitemap, Open Graph).
const origin = (process.env.SITE_ORIGIN || SITE.origin).replace(/\/$/, '');

const goatcounter = process.env.GOATCOUNTER_URL ?? SITE.goatcounter;

/**
 * `import code from './file.js?script'` gives the minified source as a string,
 * ready to inline in a <script> tag. The site ships no other JavaScript.
 */
function inlineScripts(): Plugin {
	return {
		name: 'inline-scripts',
		enforce: 'pre',
		load(id) {
			const [file, query] = id.split('?');
			if (query !== 'script') return;
			this.addWatchFile(file);
			const { code, errors } = minifySync(file, readFileSync(file, 'utf8'), {});
			if (errors.length) throw new Error(`${file}: ${errors.map((e) => e.message).join('\n')}`);
			if (code.includes('</script')) throw new Error(`${file} must not contain "</script"`);
			return `export default ${JSON.stringify(code.trim())};`;
		}
	};
}

export default defineConfig({
	define: {
		__BASE_PATH__: JSON.stringify(base),
		__GOATCOUNTER__: JSON.stringify(goatcounter)
	},
	plugins: [
		inlineScripts(),
		enhancedImages(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
				experimental: { async: true }
			},
			// BUILD_DIR lets the e2e tests build into a separate folder (see package.json).
			adapter: adapter({
				pages: process.env.BUILD_DIR || 'build',
				assets: process.env.BUILD_DIR || 'build'
			}),
			// Absolute asset paths: 404.html is served at any URL depth by GitHub Pages.
			paths: { base: base as '' | `/${string}`, origin, relative: false },
			// Put all CSS straight into the HTML: no render-blocking stylesheet request.
			inlineStyleThreshold: Infinity,
			prerender: {
				entries: [
					'/',
					'/404.html',
					'/sitemap.xml',
					'/robots.txt',
					'/vcard.vcf',
					'/favicon.svg',
					'/favicon.png',
					'/apple-touch-icon.png',
					...allPaths(),
					...ogImagePaths()
				],
				handleHttpError: 'fail'
			},
			experimental: { remoteFunctions: true, forkPreloads: true }
		}),

		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true,
			// The locale comes from the URL; src/hooks.server.ts provides getLocale() itself.
			strategy: ['baseLocale']
		})
	]
});
