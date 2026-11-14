/**
 * Timelines shown on Education and Growth subpages.
 * SAMPLE DATA: replace the years, names and texts with your own.
 * `org` (school name) also goes into the JSON-LD "alumniOf" field for search engines.
 */
import { m } from '#lib/paraglide/messages.js';
import type { Locale } from '#lib/i18n/config.ts';
import type { PageId } from '#lib/i18n/routes.ts';

type LocalizedMessage = (locale: Locale) => string;

export interface TimelineEntry {
	/** Free text, e.g. '2014', '2010 – 2014', '10.2021'. */
	readonly period: string;
	readonly title: LocalizedMessage;
	readonly text?: LocalizedMessage;
	/** Institution name (not translated). */
	readonly org?: string;
}

export const TIMELINES: Partial<Record<PageId, readonly TimelineEntry[]>> = {
	technician: [
		{
			period: '2006 – 2010',
			org: 'Technikum Elektroniczne nr 1',
			title: (locale) => m['page.technician.timeline.school.title']({}, { locale }),
			text: (locale) => m['page.technician.timeline.school.text']({}, { locale })
		},
		{
			period: '2010',
			title: (locale) => m['page.technician.timeline.exams.title']({}, { locale })
		}
	],
	engineer: [
		{
			period: '2010 – 2014',
			org: 'Politechnika Przykładowa',
			title: (locale) => m['page.engineer.timeline.degree.title']({}, { locale }),
			text: (locale) => m['page.engineer.timeline.degree.text']({}, { locale })
		},
		{
			period: '2013',
			title: (locale) => m['page.engineer.timeline.internship.title']({}, { locale })
		},
		{
			period: '2014',
			title: (locale) => m['page.engineer.timeline.thesisDefense.title']({}, { locale })
		}
	],
	master: [
		{
			period: '2014 – 2016',
			org: 'Politechnika Przykładowa',
			title: (locale) => m['page.master.timeline.studies.title']({}, { locale }),
			text: (locale) => m['page.master.timeline.studies.text']({}, { locale })
		},
		{
			period: '2016',
			title: (locale) => m['page.master.timeline.graduation.title']({}, { locale })
		}
	],
	mensa: [
		{
			period: '2019',
			org: 'Mensa Polska',
			title: (locale) => m['page.mensa.timeline.admission.title']({}, { locale })
		},
		{
			period: '2021',
			title: (locale) => m['page.mensa.timeline.gathering.title']({}, { locale })
		}
	],
	journeyman: [
		{
			period: '2017 – 2018',
			title: (locale) => m['page.journeyman.timeline.apprenticeship.title']({}, { locale })
		},
		{
			period: '2018',
			org: 'Izba Rzemieślnicza',
			title: (locale) => m['page.journeyman.timeline.exam.title']({}, { locale })
		}
	],
	reiki: [
		{
			period: '2020',
			title: (locale) => m['page.reiki.timeline.levelOne.title']({}, { locale })
		},
		{
			period: '2021',
			title: (locale) => m['page.reiki.timeline.levelTwo.title']({}, { locale })
		},
		{
			period: '2023',
			title: (locale) => m['page.reiki.timeline.master.title']({}, { locale })
		}
	],
	prana: [
		{
			period: '2022',
			title: (locale) => m['page.prana.timeline.basicCourse.title']({}, { locale })
		},
		{
			period: '2024',
			title: (locale) => m['page.prana.timeline.advancedCourse.title']({}, { locale }),
			text: (locale) => m['page.prana.timeline.advancedCourse.text']({}, { locale })
		}
	]
};

/** Distinct school names from the Education timelines, for JSON-LD. */
export function educationOrgs(): string[] {
	const ids: PageId[] = ['technician', 'engineer', 'master'];
	const orgs = ids.flatMap((id) => (TIMELINES[id] ?? []).map((e) => e.org).filter(Boolean));
	return [...new Set(orgs as string[])];
}
