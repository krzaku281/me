// enhanced-img only types imports ending in "?enhanced"; this covers "?w=...&enhanced".
declare module '*&enhanced' {
	const value: import('vite-imagetools').Picture;
	export default value;
}
