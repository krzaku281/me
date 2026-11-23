/**
 * Images processed at build time into AVIF/WebP at several widths.
 * Sources are made from the originals by scripts/prepare-images.js (crop, redaction,
 * 1280 px wide, no metadata): edit the photo there and rerun it rather than editing files here.
 * Widths cap at the source size.
 */
import club from './club.jpg?w=1280;960;640;400&enhanced';
import clubLogo from './club-logo.jpg?w=320;160&enhanced';
import engineerDiploma from './engineer-diploma.jpg?w=1280;960;640;400&enhanced';
import engineerDiplomaThumb from './engineer-diploma.jpg?w=800;640;400&enhanced';
import house from './house.jpg?w=1280;960;640;400&enhanced';
import marathon from './marathon.jpg?w=682;400&enhanced';
import mensaCard from './mensa-card.jpg?w=662;400&enhanced';
import podium from './podium.jpg?w=1280;960;640;400&enhanced';
import portrait from './portrait.jpg?w=480;288&enhanced';
import pranaBasic from './prana-basic.jpg?w=1280;960;640;400&enhanced';
import pranaBasicThumb from './prana-basic.jpg?w=800;640;400&enhanced';
import reiki1 from './reiki-1.jpg?w=1280;960;640;400&enhanced';
import reiki1Thumb from './reiki-1.jpg?w=800;640;400&enhanced';
import reiki2 from './reiki-2.jpg?w=1280;960;640;400&enhanced';
import reiki2Thumb from './reiki-2.jpg?w=800;640;400&enhanced';
import runningInstructor from './running-instructor.jpg?w=1280;960;640;400&enhanced';
import runningInstructorThumb from './running-instructor.jpg?w=800;640;400&enhanced';
import technicianDiploma from './technician-diploma.jpg?w=1280;960;640;400&enhanced';
import technicianDiplomaThumb from './technician-diploma.jpg?w=800;640;400&enhanced';

export const images = {
	club,
	clubLogo,
	house,
	marathon,
	mensaCard,
	podium,
	portrait
};

/**
 * Certificate scans. The thumbnail on the page gets at most 800 px: on phones with dense
 * screens a full-width thumbnail would otherwise pull the 1280 px file (up to 260 KB).
 * The enlarged view uses the full set. Equal widths produce the same file, built once.
 */
export const scans = {
	engineerDiploma: { thumb: engineerDiplomaThumb, full: engineerDiploma },
	pranaBasic: { thumb: pranaBasicThumb, full: pranaBasic },
	reiki1: { thumb: reiki1Thumb, full: reiki1 },
	reiki2: { thumb: reiki2Thumb, full: reiki2 },
	runningInstructor: { thumb: runningInstructorThumb, full: runningInstructor },
	technicianDiploma: { thumb: technicianDiplomaThumb, full: technicianDiploma }
};
