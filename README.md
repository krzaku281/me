# Marek Krzak, personal website

A small business-card website in 22 languages: education, running, personal growth and the
“Dom z Bala” YouTube channel. Live at **https://krzaku281.github.io/me/**.

- Built with [SvelteKit](https://svelte.dev/docs/kit) and prerendered to plain HTML
  ([adapter-static](https://svelte.dev/docs/kit/adapter-static)), hosted on GitHub Pages.
- No JavaScript bundle and no web fonts: CSS is inlined into each page, and a few small inline
  scripts (menus, language redirect, start page intro) are optional. Everything works without them.
- Each page is about 10 KB gzip and loads in one request. Images are AVIF/WebP at several widths
  ([enhanced-img](https://svelte.dev/docs/kit/images)).
- Translations with [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs);
  translated URLs (`/pl/edukacja/inzynier/`, `/de/bildung/ingenieur/`), right-to-left
  languages (Arabic, Persian, Urdu).
- Content Security Policy with per-page script hashes, view transitions between pages,
  prerendering on hover (Speculation Rules), Open Graph image per page and language.

## Getting started

Requirements: Node (version in `.nvmrc`) and Yarn 1.

```sh
yarn install
yarn dev --open
```

## Scripts

| Command               | What it does                                       |
| --------------------- | -------------------------------------------------- |
| `yarn dev`            | Development server                                 |
| `yarn build`          | Production build into `build/`                     |
| `yarn preview`        | Serves the production build                        |
| `yarn check`          | Compiles messages, type-checks (svelte-check)      |
| `yarn lint`           | Prettier, ESLint, knip (unused files and exports)  |
| `yarn format`         | Formats all files with Prettier                    |
| `yarn test:e2e`       | Test build into `build-test/`, then Playwright     |
| `yarn test`           | `check` + `lint` + `test:e2e`                      |
| `yarn clean:branches` | Deletes local branches whose remote branch is gone |

## Project structure

```
messages/                 Texts per language (pl.json is the source text)
project.inlang/           Paraglide settings (list of languages)
scripts/prepare-images.js Crops, redacts and resizes original photos into src/lib/images/
src/
  hooks.server.ts         Language of each request, Content Security Policy
  lib/
    client/               Inline browser scripts (plain JS, minified into the HTML)
    components/           Page layout, navigation, photos, certificate gallery, intro
    content/              Small data used by several pages
    i18n/                 Languages (config.ts) and translated URLs (routes.ts)
    images/               Prepared photos and their imports (index.ts)
    server/               Build-time only: CSP, fonts for Open Graph images
    styles/app.css        Global styles and design tokens
    site.ts               Name, contact details, profile links, public origin
  routes/
    [lang=lang]/          The pages, one folder per page (internal English paths)
    og/                   Open Graph images (PNG, generated at build time)
    +page.svelte          "/": redirects to the visitor's language
    404.html/             Not found page in every language
    sitemap.xml/, robots.txt/, vcard.vcf/, favicon.*/
e2e/                      Playwright tests and the test server
```

## Common tasks

### Edit a text

Change `messages/pl.json`, then the same key in the other languages. The e2e test
`messages.spec.ts` fails when a language misses a key or a placeholder such as `{link}`.

### Add a page

1. Add the page to `SITE_MAP` in `src/lib/i18n/routes.ts` (URL slug per language, English is
   the fallback).
2. Create `src/routes/[lang=lang]/<group>/<id>/+page.svelte` using the `Page` component.
3. Add `nav.<id>`, `page.<id>.title` and `page.<id>.lead` to every file in `messages/`.

Menu, sitemap, language links and Open Graph image follow automatically.

### Add a language

Follow the steps at the top of `src/lib/i18n/config.ts`: the language code in
`project.inlang/settings.json`, a new `messages/<code>.json`, `LOCALES`, `LANGUAGE_NAMES` and
`OG_LOCALES`. For a new script, add a font for the Open Graph images in
`src/lib/server/og-fonts.ts` and, if needed, a font stack in `app.css`.

### Add a photo or a certificate

1. Put the original in `images/` (keep it out of git: originals may show personal data) and add an entry to `PHOTOS` in
   `scripts/prepare-images.js`: rotation, crop, and areas to blur (personal data such as ID
   numbers, birth dates, signatures).
2. Run `node scripts/prepare-images.js <name>`. The result goes to `src/lib/images/<name>.jpg`,
   without metadata.
3. Import it in `src/lib/images/index.ts`: in `images` for a photo, in `scans` (thumbnail and
   full size) for a certificate.

## Tests

`yarn test:e2e` builds the site with a GitHub Pages-like base path (`/me`) and runs four
Playwright projects:

| Project   | Covers                                                                                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `build`   | Every page in every language over HTTP, without a browser: status, language, size budget, CSP hashes, titles, canonical and hreflang links, Open Graph images, broken links; message files |
| `desktop` | Chromium: menus, language detection and choice, layout per script, intro, certificates, accessibility (axe, WCAG 2.2 AA), performance budgets, CSP                                         |
| `mobile`  | Pixel 7: menu, horizontal scrolling, page weight                                                                                                                                           |
| `webkit`  | Safari's engine: smoke test of menus, popover and CSP                                                                                                                                      |

WebKit needs system libraries once: `sudo npx playwright install-deps webkit`. To run a part:
`npx playwright test --project desktop e2e/navigation.spec.ts`.

The tests also collect code coverage (browser scripts and the prerender) into
`coverage-reports/e2e/lcov.info` for SonarCloud.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: dependency audit, check and lint, e2e
tests and the production build in parallel, then deployment to GitHub Pages and a SonarCloud
analysis. The workflow sets `BASE_PATH` and `SITE_ORIGIN` from the Pages settings.

Optional analytics: set `goatcounter` in `src/lib/site.ts` (or `GOATCOUNTER_URL` at build time)
to a GoatCounter endpoint. It uses no cookies.

## License

[MIT](LICENSE)
