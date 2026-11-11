/**
 * Images processed at build time into AVIF/WebP at several widths.
 * To swap a photo, replace the file and keep the name (or change the import).
 * Widths cap at the source size; the source is 1280 px wide.
 */
import mensa from './mensa.jpg?w=1280;960;640;400&enhanced';

export const images = { mensa };
