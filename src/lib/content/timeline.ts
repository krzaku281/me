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
	technician: [
		{
			period: '2006 – 2010',
			org: 'Technikum Elektroniczne nr 1',
			title: {
				pl: 'Technik elektronik',
				en: 'Electronics technician',
				de: 'Elektroniktechniker',
				ar: 'فني إلكترونيات',
				he: 'טכנאי אלקטרוניקה',
				zh: '电子技术员',
				hi: 'इलेक्ट्रॉनिक्स तकनीशियन',
				es: 'Técnico en electrónica',
				bn: 'ইলেকট্রনিক্স টেকনিশিয়ান',
				ru: 'Техник-электроник',
				pt: 'Técnico em eletrônica',
				fr: 'Technicien en électronique',
				id: 'Teknisi elektronika',
				ur: 'الیکٹرانکس ٹیکنیشن',
				ja: '電子技術者'
			},
			text: {
				pl: 'Profil elektroniczny, pierwsze projekty z mikrokontrolerami.',
				en: 'Electronics track, first microcontroller projects.',
				de: 'Fachrichtung Elektronik, erste Projekte mit Mikrocontrollern.',
				ar: 'تخصص الإلكترونيات، أولى مشاريع المتحكمات الدقيقة.',
				he: 'מגמת אלקטרוניקה, פרויקטים ראשונים עם מיקרו-בקרים.',
				zh: '电子专业，最早的单片机项目。',
				hi: 'इलेक्ट्रॉनिक्स शाखा, माइक्रोकंट्रोलर के पहले प्रोजेक्ट।',
				es: 'Especialidad de electrónica, primeros proyectos con microcontroladores.',
				bn: 'ইলেকট্রনিক্স শাখা, মাইক্রোকন্ট্রোলার নিয়ে প্রথম প্রকল্প।',
				ru: 'Направление «электроника», первые проекты на микроконтроллерах.',
				pt: 'Curso de eletrônica, primeiros projetos com microcontroladores.',
				fr: 'Filière électronique, premiers projets avec des microcontrôleurs.',
				id: 'Jurusan elektronika, proyek mikrokontroler pertama.',
				ur: 'الیکٹرانکس کا شعبہ، مائیکروکنٹرولر کے پہلے منصوبے۔',
				ja: '電子科、初めてのマイコン工作。'
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
				zh: '职业考试和毕业考试',
				hi: 'व्यावसायिक परीक्षा और अंतिम परीक्षाएँ',
				es: 'Examen profesional y exámenes finales',
				bn: 'পেশাগত পরীক্ষা ও চূড়ান্ত পরীক্ষা',
				ru: 'Квалификационный экзамен и выпускные экзамены',
				pt: 'Exame profissional e exames finais',
				fr: 'Examen professionnel et baccalauréat',
				id: 'Ujian kejuruan dan ujian akhir',
				ur: 'پیشہ ورانہ امتحان اور حتمی امتحانات',
				ja: '技能検定と卒業試験'
			}
		}
	],
	engineer: [
		{
			period: '2010 – 2014',
			org: 'Politechnika Przykładowa',
			title: {
				pl: 'Studia inżynierskie, informatyka',
				en: 'BEng in Computer Science',
				de: 'Bachelorstudium Informatik',
				ar: 'بكالوريوس هندسة في علوم الحاسوب',
				he: 'תואר ראשון בהנדסת מחשבים',
				zh: '计算机科学工学学士',
				hi: 'कंप्यूटर विज्ञान में बी.ई.',
				es: 'Grado en Ingeniería Informática',
				bn: 'কম্পিউটার বিজ্ঞানে প্রকৌশল স্নাতক',
				ru: 'Бакалавриат по информатике',
				pt: 'Bacharelado em Engenharia de Computação',
				fr: 'Licence en informatique',
				id: 'Sarjana Teknik Informatika',
				ur: 'کمپیوٹر سائنس میں بی ای',
				ja: '情報工学の学士'
			},
			text: {
				pl: 'Specjalizacja: systemy rozproszone.',
				en: 'Specialisation: distributed systems.',
				de: 'Schwerpunkt: verteilte Systeme.',
				ar: 'التخصص: الأنظمة الموزعة.',
				he: 'התמחות: מערכות מבוזרות.',
				zh: '专业方向：分布式系统。',
				hi: 'विशेषज्ञता: वितरित प्रणालियाँ।',
				es: 'Especialización: sistemas distribuidos.',
				bn: 'বিশেষায়ণ: ডিস্ট্রিবিউটেড সিস্টেম।',
				ru: 'Специализация: распределённые системы.',
				pt: 'Especialização: sistemas distribuídos.',
				fr: 'Spécialisation : systèmes distribués.',
				id: 'Peminatan: sistem terdistribusi.',
				ur: 'تخصص: تقسیم شدہ نظام۔',
				ja: '専攻：分散システム。'
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
				zh: '在软件公司实习',
				hi: 'सॉफ़्टवेयर कंपनी में इंटर्नशिप',
				es: 'Prácticas en una empresa de software',
				bn: 'একটি সফটওয়্যার কোম্পানিতে ইন্টার্নশিপ',
				ru: 'Стажировка в компании-разработчике ПО',
				pt: 'Estágio em uma empresa de software',
				fr: 'Stage dans une entreprise de logiciels',
				id: 'Magang di perusahaan perangkat lunak',
				ur: 'سافٹ ویئر کمپنی میں انٹرن شپ',
				ja: 'ソフトウェア会社でのインターンシップ'
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
				zh: '工程学位论文答辩',
				hi: 'इंजीनियरिंग थीसिस की मौखिक परीक्षा',
				es: 'Defensa del trabajo de fin de grado',
				bn: 'প্রকৌশল থিসিসের মৌখিক পরীক্ষা',
				ru: 'Защита дипломной работы',
				pt: 'Defesa do trabalho de conclusão de curso',
				fr: 'Soutenance du mémoire d’ingénieur',
				id: 'Sidang skripsi',
				ur: 'انجینئرنگ مقالے کا دفاع',
				ja: '卒業論文の口頭審査'
			}
		}
	],
	master: [
		{
			period: '2014 – 2016',
			org: 'Politechnika Przykładowa',
			title: {
				pl: 'Studia magisterskie',
				en: "Master's studies",
				de: 'Masterstudium',
				ar: 'دراسات الماجستير',
				he: 'לימודי תואר שני',
				zh: '硕士学习',
				hi: 'स्नातकोत्तर की पढ़ाई',
				es: 'Estudios de máster',
				bn: 'স্নাতকোত্তর পড়াশোনা',
				ru: 'Обучение в магистратуре',
				pt: 'Mestrado',
				fr: 'Études de master',
				id: 'Studi magister',
				ur: 'ماسٹرز کی تعلیم',
				ja: '修士課程'
			},
			text: {
				pl: 'Praca dyplomowa o wydajności aplikacji webowych.',
				en: 'Thesis on web application performance.',
				de: 'Abschlussarbeit über die Performance von Webanwendungen.',
				ar: 'رسالة عن أداء تطبيقات الويب.',
				he: 'עבודת גמר על ביצועי יישומי ווב.',
				zh: '关于 Web 应用性能的论文。',
				hi: 'वेब एप्लिकेशन के प्रदर्शन पर शोध-प्रबंध।',
				es: 'Tesis sobre el rendimiento de aplicaciones web.',
				bn: 'ওয়েব অ্যাপ্লিকেশনের কর্মক্ষমতা নিয়ে থিসিস।',
				ru: 'Магистерская диссертация о производительности веб-приложений.',
				pt: 'Dissertação sobre o desempenho de aplicações web.',
				fr: 'Mémoire sur les performances des applications web.',
				id: 'Tesis tentang kinerja aplikasi web.',
				ur: 'ویب ایپلیکیشنز کی کارکردگی پر مقالہ۔',
				ja: 'Webアプリケーションの性能に関する修士論文。'
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
				zh: '工学硕士',
				hi: 'इंजीनियरिंग में स्नातकोत्तर उपाधि',
				es: 'Máster en Ingeniería',
				bn: 'প্রকৌশলে স্নাতকোত্তর ডিগ্রি',
				ru: 'Магистр техники и технологий',
				pt: 'Mestre em Engenharia',
				fr: 'Master en ingénierie',
				id: 'Magister Teknik',
				ur: 'انجینئرنگ میں ماسٹرز کی ڈگری',
				ja: '工学修士'
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
				zh: '门萨测试与入会',
				hi: 'मेन्सा परीक्षा और प्रवेश',
				es: 'Prueba y admisión en Mensa',
				bn: 'মেনসার পরীক্ষা ও ভর্তি',
				ru: 'Тест и вступление в Менсу',
				pt: 'Teste e admissão na Mensa',
				fr: 'Test et admission à Mensa',
				id: 'Tes dan penerimaan di Mensa',
				ur: 'مینسا کا ٹیسٹ اور داخلہ',
				ja: 'メンサの入会テストと入会'
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
				zh: '会员聚会',
				hi: 'सदस्यों का सम्मेलन',
				es: 'Encuentro de miembros',
				bn: 'সদস্যদের সম্মেলন',
				ru: 'Встреча членов',
				pt: 'Encontro de membros',
				fr: 'Rencontre des membres',
				id: 'Pertemuan anggota',
				ur: 'اراکین کا اجتماع',
				ja: '会員の集い'
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
				zh: '跟随师傅学艺',
				hi: 'उस्ताद कारीगर के पास प्रशिक्षण',
				es: 'Aprendizaje con un maestro artesano',
				bn: 'ওস্তাদ কারিগরের কাছে শিক্ষানবিশি',
				ru: 'Обучение у мастера',
				pt: 'Aprendizado com um mestre artesão',
				fr: 'Apprentissage auprès d’un maître artisan',
				id: 'Magang pada seorang perajin mahir',
				ur: 'استاد کاریگر کے پاس شاگردی',
				ja: '親方のもとでの修業'
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
				zh: '工匠资格考试',
				hi: 'कारीगर परीक्षा',
				es: 'Examen de oficial',
				bn: 'কারিগর পরীক্ষা',
				ru: 'Экзамен на звание подмастерья',
				pt: 'Exame de oficial',
				fr: 'Examen de compagnon',
				id: 'Ujian tukang ahli',
				ur: 'کاریگر کا امتحان',
				ja: '職人資格試験'
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
				zh: '灵气一级',
				hi: 'रेकी प्रथम स्तर',
				es: 'Reiki nivel I',
				bn: 'রেইকি প্রথম স্তর',
				ru: 'Рейки, первая ступень',
				pt: 'Reiki nível I',
				fr: 'Reiki niveau I',
				id: 'Reiki tingkat I',
				ur: 'ریکی پہلا درجہ',
				ja: 'レイキ 第1段階'
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
				zh: '灵气二级',
				hi: 'रेकी द्वितीय स्तर',
				es: 'Reiki nivel II',
				bn: 'রেইকি দ্বিতীয় স্তর',
				ru: 'Рейки, вторая ступень',
				pt: 'Reiki nível II',
				fr: 'Reiki niveau II',
				id: 'Reiki tingkat II',
				ur: 'ریکی دوسرا درجہ',
				ja: 'レイキ 第2段階'
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
				zh: '导师级',
				hi: 'मास्टर स्तर',
				es: 'Nivel de maestro',
				bn: 'মাস্টার স্তর',
				ru: 'Ступень мастера',
				pt: 'Nível de mestre',
				fr: 'Niveau maître',
				id: 'Tingkat master',
				ur: 'ماسٹر درجہ',
				ja: 'マスター段階'
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
				zh: '普拉纳基础课程',
				hi: 'प्राण का बुनियादी पाठ्यक्रम',
				es: 'Curso básico de prana',
				bn: 'প্রাণ বিষয়ে প্রাথমিক কোর্স',
				ru: 'Базовый курс работы с праной',
				pt: 'Curso básico de prana',
				fr: 'Cours de base sur le prana',
				id: 'Kursus dasar prana',
				ur: 'پران کا بنیادی کورس',
				ja: 'プラーナ基礎コース'
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
				zh: '高级课程',
				hi: 'उन्नत पाठ्यक्रम',
				es: 'Curso avanzado',
				bn: 'উচ্চতর কোর্স',
				ru: 'Продвинутый курс',
				pt: 'Curso avançado',
				fr: 'Cours avancé',
				id: 'Kursus lanjutan',
				ur: 'اعلیٰ درجے کا کورس',
				ja: '上級コース'
			},
			text: {
				pl: 'Regularna praktyka i warsztaty.',
				en: 'Regular practice and workshops.',
				de: 'Regelmäßige Praxis und Workshops.',
				ar: 'ممارسة منتظمة وورش عمل.',
				he: 'תרגול קבוע וסדנאות.',
				zh: '定期练习和工作坊。',
				hi: 'नियमित अभ्यास और कार्यशालाएँ।',
				es: 'Práctica regular y talleres.',
				bn: 'নিয়মিত চর্চা ও কর্মশালা।',
				ru: 'Регулярная практика и семинары.',
				pt: 'Prática regular e oficinas.',
				fr: 'Pratique régulière et ateliers.',
				id: 'Latihan rutin dan lokakarya.',
				ur: 'باقاعدہ مشق اور ورکشاپس۔',
				ja: '定期的な実践とワークショップ。'
			}
		}
	]
};

/** Distinct school names from the Education timelines, for JSON-LD. */
export function educationOrgs(): string[] {
	const ids: PageId[] = ['technician', 'engineer', 'master'];
	const orgs = ids.flatMap((id) => (TIMELINES[id] ?? []).map((e) => e.org).filter(Boolean));
	return [...new Set(orgs as string[])];
}
