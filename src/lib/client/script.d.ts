// `import code from './file.js?script'`: minified source as a string, see inlineScripts() in vite.config.ts.
declare module '*?script' {
	const code: string;
	export default code;
}
