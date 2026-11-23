/**
 * Prepares site photos from the originals in images/ into src/lib/images/,
 * ready for @sveltejs/enhanced-img (see src/lib/images/index.ts).
 *
 * Steps per photo: rotate, redact, crop, resize to WIDTH, save as JPEG without metadata
 * (no EXIF, no GPS). Redaction runs on the full-size original, before the crop and resize,
 * so nothing of a covered area survives in the output. Coordinates are pixels of the
 * original after rotation.
 *
 * Run: node scripts/prepare-images.js [name ...]   (no names = all photos)
 */
import sharp from 'sharp';

/** Largest width the site uses (see the ?w= list in src/lib/images/index.ts). */
const WIDTH = 1280;
const OUT_DIR = 'src/lib/images';

/**
 * @typedef {{ left: number, top: number, width: number, height: number }} Box
 * @typedef {Box & { fill?: string }} Redaction  Blurred, or a solid block when `fill` is set.
 * @typedef {{ gains?: number[], contrast?: number, lift?: number, brightness?: number, saturation?: number }} Tone
 *   Colour correction: per-channel RGB `gains` (white balance), then `contrast` and `lift`
 *   (a * x + b), then `brightness` and `saturation` (multipliers).
 * @typedef {{ src: string, rotate?: number, crop?: Box, redact?: Redaction[], width?: number, tone?: Tone }} Photo
 *   `width`: output width when the photo is shown small (default WIDTH).
 */

/** @type {Record<string, Photo>} Output name (without .jpg) -> how to make it. */
const PHOTOS = {
	house: {
		src: 'images/dom.jpg',
		// House number and village name on the sign next to the door
		redact: [{ left: 1140, top: 862, width: 75, height: 44 }],
		// 16:9, less sand in the foreground
		crop: { left: 0, top: 130, width: 2048, height: 1152 }
	},
	'prana-basic': {
		src: 'images/opara1.jpg',
		// Scanned sideways: the top of the certificate is on the left
		rotate: 90,
		// Just outside the gold border; drops the white margin and the scanner line below it
		crop: { left: 30, top: 37, width: 2264, height: 1574 }
	},
	// Reiki certificates: cropped just outside the black ornamental border, which drops the
	// paper margin with the scanner's white edges. Level II is printed on silver paper.
	'reiki-1': { src: 'images/reiki1.jpg', crop: { left: 72, top: 95, width: 1503, height: 2134 } },
	'reiki-2': { src: 'images/reiki2.jpg', crop: { left: 72, top: 95, width: 1503, height: 2134 } },
	club: {
		src: 'images/biegacze.jpeg',
		// 2:1 panorama of the team, head to toe, without the wall above
		crop: { left: 0, top: 500, width: 2048, height: 1024 }
	},
	// Shown at about 72 px: 320 px covers screens with up to 4x pixel density
	'club-logo': { src: 'images/gepard_logo.png', width: 320 },
	// Instructor ID booklet, scanned sideways and upside down; the scan cuts its right edge
	'running-instructor': {
		src: 'images/bieganie.jpg',
		rotate: 90,
		redact: [
			// ID number and date/place of birth: white like the paper
			{ left: 1670, top: 218, width: 470, height: 52, fill: '#ffffff' },
			{ left: 1755, top: 428, width: 290, height: 50, fill: '#ffffff' },
			// Signature, blurred because it overlaps the red stamp
			{ left: 780, top: 850, width: 410, height: 125 }
		],
		crop: { left: 550, top: 2, width: 1788, height: 1190 }
	},
	podium: { src: 'images/podium.JPG' },
	// Only 682 px wide: shown at half the column width, next to the text
	marathon: { src: 'images/maraton.png' },
	// Blurred rather than covered: the guilloche background makes a solid block stand out
	'technician-diploma': {
		src: 'images/technik.jpg',
		redact: [
			// Date of birth, PESEL, diploma number
			{ left: 185, top: 855, width: 330, height: 52 },
			{ left: 1225, top: 855, width: 230, height: 52 },
			{ left: 255, top: 1874, width: 205, height: 40 }
		],
		crop: { left: 40, top: 40, width: 1620, height: 2258 }
	},
	// Engineer's diploma booklet, scanned sideways; the scan cuts its right edge
	'engineer-diploma': {
		src: 'images/inzynier.jpg',
		rotate: 90,
		redact: [
			// Date of birth, own signature, diploma number
			{ left: 965, top: 842, width: 460, height: 76 },
			{ left: 985, top: 952, width: 380, height: 80 },
			{ left: 862, top: 1098, width: 180, height: 62 }
		],
		crop: { left: 620, top: 2, width: 1718, height: 1230 }
	},
	// Portrait for "About me": face and shoulders, shown round at 9rem. Shot under a warm bulb:
	// slightly lighter and softer, keeping the warm tone of the Teams/LinkedIn avatar.
	portrait: {
		src: 'images/marekkrzak.jpg',
		crop: { left: 760, top: 700, width: 2180, height: 2180 },
		width: 480,
		tone: { gains: [1, 1, 0.98], contrast: 0.92, lift: 10, brightness: 1.06, saturation: 1 }
	},
	// Mensa membership card, alone on a scanned page: cropped 4 px inside its edges, so no
	// white shows in the rounded corners (rounded again in CSS). Only 662 px wide.
	'mensa-card': {
		src: 'images/mensa_legitymacja.jpg',
		crop: { left: 483, top: 232, width: 662, height: 418 }
	}
};

/** A box that hides its content: pixelated, then blurred, or a solid block. */
async function cover(image, { fill, ...box }) {
	if (fill) {
		const { width, height } = box;
		return sharp({ create: { width, height, channels: 3, background: fill } })
			.png()
			.toBuffer();
	}
	const tiny = await sharp(image)
		.extract(box)
		.resize(Math.max(1, Math.round(box.width / 12)), Math.max(1, Math.round(box.height / 12)))
		.toBuffer();
	return sharp(tiny)
		.resize(box.width, box.height)
		.blur(Math.max(box.width, box.height) / 6)
		.png()
		.toBuffer();
}

async function prepare(name, { src, rotate, crop, redact = [], width = WIDTH, tone }) {
	// rotate() without an angle applies the EXIF orientation
	let image = await sharp(src).rotate(rotate).toBuffer();

	if (redact.length) {
		const layers = await Promise.all(redact.map((box) => cover(image, box)));
		image = await sharp(image)
			.composite(layers.map((input, i) => ({ input, left: redact[i].left, top: redact[i].top })))
			.toBuffer();
	}
	if (crop) image = await sharp(image).extract(crop).toBuffer();

	let output = sharp(image).resize({ width, withoutEnlargement: true });
	if (tone) {
		const { gains = [1, 1, 1], contrast = 1, lift = 0, brightness = 1, saturation = 1 } = tone;
		output = output
			.linear(
				gains.map((gain) => gain * contrast),
				[lift, lift, lift]
			)
			.modulate({ brightness, saturation })
			.sharpen({ sigma: 0.6 });
	}

	const out = `${OUT_DIR}/${name}.jpg`;
	const info = await output.jpeg({ quality: 85, mozjpeg: true }).toFile(out);
	console.log(`${out}: ${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB`);
}

const names = process.argv.slice(2);
const unknown = names.filter((name) => !(name in PHOTOS));
if (unknown.length) throw new Error(`Unknown photo(s): ${unknown.join(', ')}`);

for (const name of names.length ? names : Object.keys(PHOTOS)) {
	await prepare(name, PHOTOS[name]);
}
