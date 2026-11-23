import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
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
			const sourceFile = relative(process.cwd(), file).replaceAll('\\', '/');
			const { code, errors } = minifySync(sourceFile, readFileSync(file, 'utf8'), {});
			if (errors.length) throw new Error(`${file}: ${errors.map((e) => e.message).join('\n')}`);
			if (code.includes('</script')) throw new Error(`${file} must not contain "</script"`);
			// Empty map: this module is a string, not the script itself. Coverage of the script
			// comes from the browser (e2e/coverage-config.ts), not from this wrapper.
			return { code: `export default ${JSON.stringify(code.trim())};`, map: { mappings: '' } };
		}
	};
}

export default defineConfig({
	// Source maps let the e2e coverage map the prerendered server code back to src/
	// (see e2e/coverage-config.ts). Test builds only: the site does not ship them.
	build: { sourcemap: process.env.COVERAGE === '1' },
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
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
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
			}
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
