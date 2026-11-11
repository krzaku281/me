// Every page is generated as static HTML at build time.
export const prerender = true;

// No client-side app: pages are plain HTML + CSS. The only JavaScript is a small
// inline script (src/lib/client/site.js) that the site works without.
export const csr = false;

// /pl/o-mnie/ -> pl/o-mnie/index.html, which GitHub Pages serves without redirects.
export const trailingSlash = 'always';
