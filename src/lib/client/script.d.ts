// `import code from './file.js?script'`: minified inline source, see inlineScripts() in vite.config.ts.
declare module '*?script' {
	const code: string;
	export default code;
}
