// Static server for the e2e tests. Behaves like GitHub Pages for a project site:
// - the site lives under BASE (/me), files come from build-test/
// - a directory without a trailing slash gets a 301, a directory serves its index.html
// - unknown paths get 404 with the site's 404.html
// - text files are gzip-compressed, like on GitHub Pages
// It also fakes the GoatCounter endpoint: GET /gc/count records a hit, GET /gc/hits lists them.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';

const PORT = Number(process.env.PORT ?? 4174);
const BASE = '/me';
const ROOT = join(import.meta.dirname, '..', 'build-test');

/** @type {Record<string, string>} */
const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.woff2': 'font/woff2',
	'.avif': 'image/avif',
	'.webp': 'image/webp',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.xml': 'application/xml',
	'.txt': 'text/plain; charset=utf-8',
	'.vcf': 'text/vcard; charset=utf-8'
};

/** @type {Record<string, string>[]} */
const hits = [];

createServer((req, res) => {
	const url = new URL(req.url ?? '/', 'http://localhost');

	if (url.pathname === '/gc/count') {
		hits.push(Object.fromEntries(url.searchParams));
		res.writeHead(204).end();
		return;
	}
	if (url.pathname === '/gc/hits') {
		res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(hits));
		return;
	}

	/** @param {number} status @param {string} file */
	const send = (status, file) => {
		const type = TYPES[extname(file)] ?? 'application/octet-stream';
		let body = readFileSync(file);
		/** @type {Record<string, string>} */
		const headers = { 'content-type': type };
		if (/text|xml|svg|vcard/.test(type) && /gzip/.test(String(req.headers['accept-encoding']))) {
			body = gzipSync(body);
			headers['content-encoding'] = 'gzip';
		}
		res.writeHead(status, headers).end(body);
	};
	const notFound = () => send(404, join(ROOT, '404.html'));

	if (url.pathname !== BASE && !url.pathname.startsWith(BASE + '/')) return notFound();

	const relative = normalize(decodeURIComponent(url.pathname.slice(BASE.length)) || '/');
	if (relative.startsWith('..')) return notFound();
	let file = join(ROOT, relative);

	if (existsSync(file) && statSync(file).isDirectory()) {
		if (!url.pathname.endsWith('/')) {
			res.writeHead(301, { location: url.pathname + '/' + url.search }).end();
			return;
		}
		file = join(file, 'index.html');
	}
	if (!existsSync(file)) return notFound();

	send(200, file);
}).listen(PORT, () => console.log(`e2e server: http://localhost:${PORT}${BASE}/`));
