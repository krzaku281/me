/**
 * Timelines shown on Education and Growth subpages.
 * SAMPLE DATA: replace the years, names and texts with your own.
 * `org` (school name) also goes into the JSON-LD "alumniOf" field for search engines.
 */
import type { Locale } from '#lib/i18n/config.ts';
import type { PageId } from '#lib/i18n/routes.ts';

type Text = Readonly<Record<Locale, string>>;

export interface TimelineEntry {
	/** Free text, e.g. '2014', '2010 – 2014', '10.2021'. */
	readonly period: string;
	readonly title: Text;
	readonly text?: Text;
	/** Institution name (not translated). */
	readonly org?: string;
}

export const TIMELINES: Partial<Record<PageId, readonly TimelineEntry[]>> = {
	technical: [
		{
			period: '2006 – 2010',
			org: 'Technikum Elektroniczne nr 1',
			title: {
				pl: 'Technik elektronik',
				en: 'Electronics technician',
				de: 'Elektroniktechniker',
				ar: 'فني إلكترونيات',
				he: 'טכנאי אלקטרוניקה',
				zh: '电子技术员'
			},
			text: {
				pl: 'Profil elektroniczny, pierwsze projekty z mikrokontrolerami.',
				en: 'Electronics track, first microcontroller projects.',
				de: 'Fachrichtung Elektronik, erste Projekte mit Mikrocontrollern.',
				ar: 'تخصص الإلكترونيات، أولى مشاريع المتحكمات الدقيقة.',
				he: 'מגמת אלקטרוניקה, פרויקטים ראשונים עם מיקרו-בקרים.',
				zh: '电子专业，最早的单片机项目。'
			}
		},
		{
			period: '2010',
			title: {
				pl: 'Egzamin zawodowy i matura',
				en: 'Vocational exam and final exams',
				de: 'Berufsprüfung und Abitur',
				ar: 'الامتحان المهني وامتحانات التخرج',
				he: 'בחינת מקצוע ובחינות בגרות',
				zh: '职业考试和毕业考试'
			}
		}
	],
	university: [
		{
			period: '2010 – 2014',
			org: 'Politechnika Przykładowa',
			title: {
				pl: 'Studia inżynierskie, informatyka',
				en: 'BEng in Computer Science',
				de: 'Bachelorstudium Informatik',
				ar: 'بكالوريوس هندسة في علوم الحاسوب',
				he: 'תואר ראשון בהנדסת מחשבים',
				zh: '计算机科学工学学士'
			},
			text: {
				pl: 'Specjalizacja: systemy rozproszone.',
				en: 'Specialisation: distributed systems.',
				de: 'Schwerpunkt: verteilte Systeme.',
				ar: 'التخصص: الأنظمة الموزعة.',
				he: 'התמחות: מערכות מבוזרות.',
				zh: '专业方向：分布式系统。'
			}
		},
		{
			period: '2013',
			title: {
				pl: 'Praktyki w firmie programistycznej',
				en: 'Internship at a software company',
				de: 'Praktikum in einem Softwareunternehmen',
				ar: 'تدريب في شركة برمجيات',
				he: 'התמחות בחברת תוכנה',
				zh: '在软件公司实习'
			}
		},
		{
			period: '2014',
			title: {
				pl: 'Obrona pracy inżynierskiej',
				en: 'Engineering thesis defence',
				de: 'Verteidigung der Bachelorarbeit',
				ar: 'مناقشة مشروع التخرج الهندسي',
				he: 'הגנה על עבודת הגמר ההנדסית',
				zh: '工程学位论文答辩'
			}
		}
	],
	masters: [
		{
			period: '2014 – 2016',
			org: 'Politechnika Przykładowa',
			title: {
				pl: 'Studia magisterskie',
				en: "Master's studies",
				de: 'Masterstudium',
				ar: 'دراسات الماجستير',
				he: 'לימודי תואר שני',
				zh: '硕士学习'
			},
			text: {
				pl: 'Praca dyplomowa o wydajności aplikacji webowych.',
				en: 'Thesis on web application performance.',
				de: 'Abschlussarbeit über die Performance von Webanwendungen.',
				ar: 'رسالة عن أداء تطبيقات الويب.',
				he: 'עבודת גמר על ביצועי יישומי ווב.',
				zh: '关于 Web 应用性能的论文。'
			}
		},
		{
			period: '2016',
			title: {
				pl: 'Tytuł magistra inżyniera',
				en: 'MSc in Engineering',
				de: 'Master of Science',
				ar: 'ماجستير في الهندسة',
				he: 'תואר שני בהנדסה',
				zh: '工学硕士'
			}
		}
	],
	mensa: [
		{
			period: '2019',
			org: 'Mensa Polska',
			title: {
				pl: 'Test i przyjęcie do Mensy',
				en: 'Test and admission to Mensa',
				de: 'Test und Aufnahme in Mensa',
				ar: 'الاختبار والقبول في منسا',
				he: 'מבחן וקבלה למנסה',
				zh: '门萨测试与入会'
			}
		},
		{
			period: '2021',
			title: {
				pl: 'Udział w zjeździe członków',
				en: 'Members’ gathering',
				de: 'Teilnahme am Mitgliedertreffen',
				ar: 'لقاء الأعضاء',
				he: 'מפגש חברים',
				zh: '会员聚会'
			}
		}
	],
	journeyman: [
		{
			period: '2017 – 2018',
			title: {
				pl: 'Nauka zawodu u mistrza',
				en: 'Apprenticeship with a master craftsman',
				de: 'Ausbildung bei einem Meister',
				ar: 'التدرّب لدى معلّم حِرفي',
				he: 'התלמדות אצל אומן מוסמך',
				zh: '跟随师傅学艺'
			}
		},
		{
			period: '2018',
			org: 'Izba Rzemieślnicza',
			title: {
				pl: 'Egzamin czeladniczy',
				en: 'Journeyman’s examination',
				de: 'Gesellenprüfung',
				ar: 'امتحان الحِرفي',
				he: 'בחינת בעל מלאכה',
				zh: '工匠资格考试'
			}
		}
	],
	reiki: [
		{
			period: '2020',
			title: {
				pl: 'I stopień reiki',
				en: 'Reiki level I',
				de: 'Reiki 1. Grad',
				ar: 'ريكي المستوى الأول',
				he: 'רייקי דרגה א׳',
				zh: '灵气一级'
			}
		},
		{
			period: '2021',
			title: {
				pl: 'II stopień reiki',
				en: 'Reiki level II',
				de: 'Reiki 2. Grad',
				ar: 'ريكي المستوى الثاني',
				he: 'רייקי דרגה ב׳',
				zh: '灵气二级'
			}
		},
		{
			period: '2023',
			title: {
				pl: 'Stopień mistrzowski',
				en: 'Master level',
				de: 'Meistergrad',
				ar: 'مستوى المعلّم',
				he: 'דרגת מאסטר',
				zh: '导师级'
			}
		}
	],
	prana: [
		{
			period: '2022',
			title: {
				pl: 'Kurs podstawowy pracy z praną',
				en: 'Basic prana course',
				de: 'Grundkurs Prana',
				ar: 'دورة أساسية في البرانا',
				he: 'קורס בסיסי בפראנה',
				zh: '普拉纳基础课程'
			}
		},
		{
			period: '2024',
			title: {
				pl: 'Kurs zaawansowany',
				en: 'Advanced course',
				de: 'Fortgeschrittenenkurs',
				ar: 'دورة متقدمة',
				he: 'קורס מתקדם',
				zh: '高级课程'
			},
			text: {
				pl: 'Regularna praktyka i warsztaty.',
				en: 'Regular practice and workshops.',
				de: 'Regelmäßige Praxis und Workshops.',
				ar: 'ممارسة منتظمة وورش عمل.',
				he: 'תרגול קבוע וסדנאות.',
				zh: '定期练习和工作坊。'
			}
		}
	]
};

/** Distinct school names from the Education timelines, for JSON-LD. */
export function educationOrgs(): string[] {
	const ids: PageId[] = ['technical', 'university', 'masters'];
	const orgs = ids.flatMap((id) => (TIMELINES[id] ?? []).map((e) => e.org).filter(Boolean));
	return [...new Set(orgs as string[])];
}
