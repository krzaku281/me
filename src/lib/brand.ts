/**
 * Site mark "Ręce Boga", vectorised from the original rece.png (no longer in the repo).
 * Plain TS with no imports.
 *
 * Two drawings of the same symbol:
 * - LOGO_PATH: traced from the PNG (viewBox 317), for large sizes: apple-touch-icon,
 *   vCard photo, Open Graph images.
 * - ICON_PATH: redrawn on a 32×32 pixel grid with 2-unit strokes, so edges land on whole
 *   pixels at 16, 32 and 48 px. Used for the favicon and the header mark (16 CSS px,
 *   i.e. 32 device px on HiDPI screens).
 */
export const LOGO_SIZE = 317;

export const LOGO_PATH =
	'M78 0h21v38h-21zM113 0h21v38h-21zM148 0h21v38h-21zM183 0h21v38h-21zM218 0h21v38h-21zM78 38h161v21h-161zM148 59h21v89h-21zM0 78h59v21h-59zM259 78h58v21h-58zM38 99h21v14h-21zM259 99h21v14h-21zM0 113h59v21h-59zM259 113h58v21h-58zM38 134h21v14h-21zM259 134h21v14h-21zM0 148h317v21h-317zM38 169h21v14h-21zM148 169h21v90h-21zM259 169h21v14h-21zM0 183h59v21h-59zM259 183h58v21h-58zM38 204h21v14h-21zM259 204h21v14h-21zM0 218h59v21h-59zM259 218h58v21h-58zM78 259h161v21h-161zM78 280h21v37h-21zM113 280h21v37h-21zM148 280h21v37h-21zM183 280h21v37h-21zM218 280h21v37h-21z';

export const ICON_SIZE = 32;

/** One arm (five fingers, palm, forearm), rotated four times around the centre. */
function iconPath() {
	type Rect = [x: number, y: number, w: number, h: number];
	const arm: Rect[] = [
		...[9, 12, 15, 18, 21].map((x): Rect => [x, 2, 2, 3]),
		[9, 5, 14, 2],
		[15, 7, 2, 8]
	];
	const rotate = ([x, y, w, h]: Rect): Rect => [ICON_SIZE - (y + h), x, h, w];
	const rects: Rect[] = [[15, 15, 2, 2]];
	let current = arm;
	for (let i = 0; i < 4; i++) {
		rects.push(...current);
		current = current.map(rotate);
	}
	return rects.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h-${w}z`).join('');
}

export const ICON_PATH = iconPath();

/** Favicon: pixel-grid mark on a dark rounded tile (~0.5 KB). */
export function faviconSvg() {
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" shape-rendering="crispEdges">` +
		`<rect width="${ICON_SIZE}" height="${ICON_SIZE}" rx="6" fill="#1a1a1a"/>` +
		`<path fill="#e4e4e4" d="${ICON_PATH}"/></svg>`
	);
}

/**
 * Large square icon: traced mark on a dark gradient tile.
 * @param rounded false for apple-touch-icon (iOS rounds the corners itself)
 */
export function iconSvg({ rounded = true }: { rounded?: boolean } = {}) {
	const pad = 70;
	const box = LOGO_SIZE + pad * 2;
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}">` +
		`<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
		`<stop offset="0" stop-color="#262626"/><stop offset="1" stop-color="#0c0c0c"/></linearGradient></defs>` +
		`<rect width="${box}" height="${box}" rx="${rounded ? 96 : 0}" fill="url(#g)"/>` +
		`<path transform="translate(${pad} ${pad})" fill="#e4e4e4" d="${LOGO_PATH}"/></svg>`
	);
}
