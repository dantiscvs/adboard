export const PLATFORMS = [
  { id: 'facebook',   label: 'Facebook',   color: '#1877F2', bg: '#E7F0FD' },
  { id: 'instagram',  label: 'Instagram',  color: '#E1306C', bg: '#FDE7EF' },
  { id: 'threads',    label: 'Threads',    color: '#000000', bg: '#F0F0F0' },
  { id: 'tiktok',     label: 'TikTok',     color: '#010101', bg: '#F0F0F0' },
  { id: 'youtube',    label: 'YouTube',    color: '#FF0000', bg: '#FFE7E7' },
  { id: 'snapchat',   label: 'Snapchat',   color: '#FFFC00', bg: '#FFFDE7' },
  { id: 'linkedin',   label: 'LinkedIn',   color: '#0A66C2', bg: '#E8F0FB' },
]

export const CTA_OPTIONS = [
  'Apply Now',
  'Learn More',
  'Sign Up',
  'Get Started',
  'Book Now',
  'Download',
  'Contact Us',
  'Shop Now',
]

export const JOB_TYPES = ['Full-time', 'Part-time', 'Remote', 'Hybrid', 'Contract', 'Freelance', 'Internship']

export const MIN_SPEND_PLN = 100
export const COMMISSION_RATE = 0.07
export const CURRENCY = 'PLN'

export const AD_PREVIEW_PLATFORMS = ['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'snapchat']

// Canvas formats — w/h are the actual pixel dimensions of the exported creative
export const CANVAS_FORMATS = [
  { id: 'square',    label: 'Square',    ratio: '1:1',  w: 1080, h: 1080, desc: 'Facebook · Instagram · LinkedIn',    platforms: ['facebook','instagram','linkedin'] },
  { id: 'vertical',  label: 'Vertical',  ratio: '9:16', w: 1080, h: 1920, desc: 'TikTok · Snapchat · Stories',         platforms: ['tiktok','snapchat'] },
  { id: 'landscape', label: 'Landscape', ratio: '16:9', w: 1920, h: 1080, desc: 'YouTube · Facebook Banner',           platforms: ['youtube'] },
]

// Which format each preview platform expects
export const PLATFORM_FORMAT = {
  facebook:  'square',
  instagram: 'square',
  linkedin:  'square',
  tiktok:    'vertical',
  snapchat:  'vertical',
  youtube:   'landscape',
}

// ── Targeting options ─────────────────────────────────────────────────────────
export const AGE_RANGES = [
  { id: '18-24', label: '18–24' },
  { id: '25-34', label: '25–34' },
  { id: '35-44', label: '35–44' },
  { id: '45-54', label: '45–54' },
  { id: '55+',   label: '55+' },
]

export const GENDERS = [
  { id: 'all',    label: 'All genders' },
  { id: 'male',   label: 'Male' },
  { id: 'female', label: 'Female' },
]

export const SENIORITY_LEVELS = [
  { id: 'intern',    label: 'Intern / Trainee' },
  { id: 'junior',    label: 'Junior (0–2 yrs)' },
  { id: 'mid',       label: 'Mid-level (2–5 yrs)' },
  { id: 'senior',    label: 'Senior (5+ yrs)' },
  { id: 'lead',      label: 'Lead / Principal' },
  { id: 'manager',   label: 'Manager' },
  { id: 'director',  label: 'Director+' },
]

export const JOB_INTERESTS = [
  'Technology & IT', 'Marketing & Advertising', 'Finance & Accounting',
  'Healthcare & Medical', 'Sales & Business Dev', 'Design & Creative',
  'HR & Recruitment', 'Legal & Compliance', 'Engineering & Manufacturing',
  'Customer Service', 'Education & Training', 'Operations & Logistics',
]

export const DEVICES = [
  { id: 'all',     label: 'All devices' },
  { id: 'mobile',  label: 'Mobile only' },
  { id: 'desktop', label: 'Desktop only' },
]

// ── Google Fonts ──────────────────────────────────────────────────────────────
// Free fonts loaded on demand from Google Fonts CDN
export const FONT_LIST = [
  { id: 'Inter',             label: 'Inter',              category: 'sans-serif' },
  { id: 'Roboto',            label: 'Roboto',             category: 'sans-serif' },
  { id: 'Open+Sans',         label: 'Open Sans',          category: 'sans-serif' },
  { id: 'Poppins',           label: 'Poppins',            category: 'sans-serif' },
  { id: 'Montserrat',        label: 'Montserrat',         category: 'sans-serif' },
  { id: 'Lato',              label: 'Lato',               category: 'sans-serif' },
  { id: 'Raleway',           label: 'Raleway',            category: 'sans-serif' },
  { id: 'Nunito',            label: 'Nunito',             category: 'sans-serif' },
  { id: 'Work+Sans',         label: 'Work Sans',          category: 'sans-serif' },
  { id: 'DM+Sans',           label: 'DM Sans',            category: 'sans-serif' },
  { id: 'Plus+Jakarta+Sans', label: 'Plus Jakarta Sans',  category: 'sans-serif' },
  { id: 'Space+Grotesk',     label: 'Space Grotesk',      category: 'sans-serif' },
  { id: 'Sora',              label: 'Sora',               category: 'sans-serif' },
  { id: 'Outfit',            label: 'Outfit',             category: 'sans-serif' },
  { id: 'Urbanist',          label: 'Urbanist',           category: 'sans-serif' },
  { id: 'Figtree',           label: 'Figtree',            category: 'sans-serif' },
  { id: 'Manrope',           label: 'Manrope',            category: 'sans-serif' },
  { id: 'Josefin+Sans',      label: 'Josefin Sans',       category: 'sans-serif' },
  { id: 'Playfair+Display',  label: 'Playfair Display',   category: 'serif' },
  { id: 'Merriweather',      label: 'Merriweather',       category: 'serif' },
  { id: 'Libre+Baskerville', label: 'Libre Baskerville',  category: 'serif' },
  { id: 'Cormorant+Garamond',label: 'Cormorant Garamond', category: 'serif' },
]

// ── Template i18n strings (50 languages) ──────────────────────────────────────
// Keys: hiring, openPos, tagline, lookingFor, isHiring, nowHiring, openRole, salary, location
export const TEMPLATE_I18N = {
  'English':              { hiring: "We're Hiring",        openPos: 'Open position',          tagline: 'is actively hiring',           lookingFor: 'is looking for a',   isHiring: 'is hiring',       nowHiring: 'Now hiring',        openRole: 'Open Role',           cta: 'Apply Now',           salary: 'Salary',          location: 'Location' },
  'Spanish':              { hiring: 'Estamos contratando', openPos: 'Posición abierta',        tagline: 'está contratando activamente', lookingFor: 'busca un/a',          isHiring: 'contrata',        nowHiring: 'Contratando ahora', openRole: 'Vacante',             cta: 'Aplicar ahora',       salary: 'Salario',         location: 'Ubicación' },
  'French':               { hiring: 'Nous recrutons',      openPos: 'Poste ouvert',            tagline: 'recrute activement',           lookingFor: 'recherche un(e)',     isHiring: 'recrute',         nowHiring: 'Recrutement ouvert',openRole: 'Poste disponible',    cta: 'Postuler',            salary: 'Salaire',         location: 'Localisation' },
  'German':               { hiring: 'Wir suchen dich',     openPos: 'Offene Stelle',           tagline: 'sucht aktiv',                  lookingFor: 'sucht einen/eine',   isHiring: 'sucht',           nowHiring: 'Jetzt bewerben',    openRole: 'Offene Stelle',       cta: 'Jetzt bewerben',      salary: 'Gehalt',          location: 'Standort' },
  'Portuguese':           { hiring: 'Estamos contratando', openPos: 'Vaga aberta',             tagline: 'está contratando ativamente',  lookingFor: 'procura um/uma',      isHiring: 'contrata',        nowHiring: 'Contratando agora', openRole: 'Vaga disponível',     cta: 'Candidatar-se',       salary: 'Salário',         location: 'Localização' },
  'Italian':              { hiring: 'Stiamo assumendo',    openPos: 'Posizione aperta',        tagline: 'sta assumendo attivamente',    lookingFor: 'cerca un/una',        isHiring: 'assume',          nowHiring: 'Assunzione aperta', openRole: 'Ruolo aperto',        cta: 'Candidati ora',       salary: 'Stipendio',       location: 'Sede' },
  'Polish':               { hiring: 'Rekrutujemy',         openPos: 'Otwarta oferta',          tagline: 'aktywnie rekrutuje',           lookingFor: 'szuka',               isHiring: 'rekrutuje',       nowHiring: 'Rekrutujemy teraz', openRole: 'Otwarta rola',        cta: 'Aplikuj teraz',       salary: 'Wynagrodzenie',   location: 'Lokalizacja' },
  'Dutch':                { hiring: 'Wij zoeken',          openPos: 'Vacature',                tagline: 'is actief aan het werven',     lookingFor: 'zoekt een',           isHiring: 'werft',           nowHiring: 'Nu werven',         openRole: 'Open functie',        cta: 'Nu solliciteren',     salary: 'Salaris',         location: 'Locatie' },
  'Russian':              { hiring: 'Мы нанимаем',         openPos: 'Открытая вакансия',       tagline: 'активно нанимает',             lookingFor: 'ищет',                isHiring: 'нанимает',        nowHiring: 'Открыт набор',      openRole: 'Открытая роль',       cta: 'Откликнуться',        salary: 'Зарплата',        location: 'Локация' },
  'Japanese':             { hiring: '採用中',               openPos: '募集中',                  tagline: '積極採用中',                    lookingFor: 'を募集しています',     isHiring: 'が採用中',         nowHiring: '今すぐ応募',         openRole: '募集要項',             cta: '応募する',             salary: '給与',             location: '勤務地' },
  'Korean':               { hiring: '채용 중',              openPos: '채용 공고',               tagline: '적극 채용 중',                  lookingFor: '을/를 찾고 있습니다', isHiring: '채용 중',          nowHiring: '지금 채용 중',       openRole: '공개 채용',            cta: '지금 지원하기',         salary: '급여',             location: '위치' },
  'Chinese (Simplified)': { hiring: '我们在招聘',           openPos: '招聘职位',                tagline: '正在积极招聘',                  lookingFor: '正在寻找',             isHiring: '正在招聘',         nowHiring: '立即招聘',          openRole: '开放职位',             cta: '立即申请',             salary: '薪资',             location: '地点' },
  'Chinese (Traditional)':{ hiring: '我們在招聘',           openPos: '招聘職位',                tagline: '正在積極招聘',                  lookingFor: '正在尋找',             isHiring: '正在招聘',         nowHiring: '立即招聘',          openRole: '開放職位',             cta: '立即申請',             salary: '薪資',             location: '地點' },
  'Arabic':               { hiring: 'نحن نوظف',            openPos: 'وظيفة شاغرة',            tagline: 'يوظف بنشاط',                   lookingFor: 'يبحث عن',            isHiring: 'يوظف',            nowHiring: 'توظيف الآن',        openRole: 'دور مفتوح',            cta: 'تقدم الآن',           salary: 'الراتب',          location: 'الموقع' },
  'Hindi':                { hiring: 'हम नियुक्ति कर रहे हैं', openPos: 'खुली स्थिति',         tagline: 'सक्रिय रूप से नियुक्ति',       lookingFor: 'की तलाश में है',      isHiring: 'नियुक्त कर रहा है', nowHiring: 'अभी आवेदन करें',  openRole: 'खुली भूमिका',         cta: 'अभी आवेदन करें',      salary: 'वेतन',            location: 'स्थान' },
  'Turkish':              { hiring: 'İşe alıyoruz',        openPos: 'Açık pozisyon',           tagline: 'aktif olarak işe alıyor',      lookingFor: 'arıyor',              isHiring: 'işe alıyor',      nowHiring: 'Hemen başvurun',    openRole: 'Açık rol',            cta: 'Hemen başvur',        salary: 'Maaş',            location: 'Konum' },
  'Swedish':              { hiring: 'Vi söker',            openPos: 'Ledig tjänst',            tagline: 'rekryterar aktivt',            lookingFor: 'söker en',            isHiring: 'rekryterar',      nowHiring: 'Rekryterar nu',     openRole: 'Ledig tjänst',        cta: 'Ansök nu',            salary: 'Lön',             location: 'Plats' },
  'Norwegian':            { hiring: 'Vi ansetter',         openPos: 'Ledig stilling',          tagline: 'ansetter aktivt',              lookingFor: 'søker en',            isHiring: 'ansetter',        nowHiring: 'Søk nå',            openRole: 'Ledig stilling',      cta: 'Søk nå',              salary: 'Lønn',            location: 'Sted' },
  'Danish':               { hiring: 'Vi søger',            openPos: 'Ledig stilling',          tagline: 'ansætter aktivt',              lookingFor: 'søger en',            isHiring: 'ansætter',        nowHiring: 'Ansøg nu',          openRole: 'Åben stilling',       cta: 'Ansøg nu',            salary: 'Løn',             location: 'Placering' },
  'Finnish':              { hiring: 'Rekrytoimme',         openPos: 'Avoin paikka',            tagline: 'rekrytoi aktiivisesti',        lookingFor: 'etsii',               isHiring: 'rekrytoi',        nowHiring: 'Hae nyt',           openRole: 'Avoin rooli',         cta: 'Hae nyt',             salary: 'Palkka',          location: 'Sijainti' },
  'Czech':                { hiring: 'Přijímáme',           openPos: 'Volná pozice',            tagline: 'aktivně přijímá',              lookingFor: 'hledá',               isHiring: 'přijímá',         nowHiring: 'Přihlaste se',      openRole: 'Volná role',          cta: 'Přihlásit se',        salary: 'Mzda',            location: 'Lokalita' },
  'Slovak':               { hiring: 'Prijímame',           openPos: 'Voľná pozícia',           tagline: 'aktívne prijíma',              lookingFor: 'hľadá',               isHiring: 'prijíma',         nowHiring: 'Prihláste sa',      openRole: 'Voľná rola',          cta: 'Prihlásiť sa',        salary: 'Mzda',            location: 'Lokalita' },
  'Hungarian':            { hiring: 'Felveszünk',          openPos: 'Nyitott pozíció',         tagline: 'aktívan toboroz',              lookingFor: 'keres egy',           isHiring: 'toboroz',         nowHiring: 'Jelentkezz most',   openRole: 'Nyitott szerep',      cta: 'Jelentkezés',         salary: 'Fizetés',         location: 'Helyszín' },
  'Romanian':             { hiring: 'Angajăm',             openPos: 'Poziție deschisă',        tagline: 'angajează activ',              lookingFor: 'caută un/o',          isHiring: 'angajează',       nowHiring: 'Aplică acum',       openRole: 'Rol deschis',         cta: 'Aplică acum',         salary: 'Salariu',         location: 'Locație' },
  'Ukrainian':            { hiring: 'Ми наймаємо',         openPos: 'Відкрита вакансія',       tagline: 'активно наймає',               lookingFor: 'шукає',               isHiring: 'наймає',          nowHiring: 'Подай заявку',      openRole: 'Відкрита роль',       cta: 'Подати заявку',       salary: 'Зарплата',        location: 'Локація' },
  'Greek':                { hiring: 'Προσλαμβάνουμε',      openPos: 'Ανοιχτή θέση',           tagline: 'προσλαμβάνει ενεργά',          lookingFor: 'αναζητά',             isHiring: 'προσλαμβάνει',    nowHiring: 'Κάντε αίτηση',      openRole: 'Ανοιχτή θέση',        cta: 'Κάντε αίτηση',        salary: 'Μισθός',          location: 'Τοποθεσία' },
  'Hebrew':               { hiring: 'אנחנו מגייסים',      openPos: 'משרה פתוחה',              tagline: 'מגייס באופן פעיל',             lookingFor: 'מחפש',                isHiring: 'מגייס',           nowHiring: 'הגש מועמדות',       openRole: 'תפקיד פתוח',          cta: 'הגש מועמדות',         salary: 'שכר',             location: 'מיקום' },
  'Persian':              { hiring: 'ما استخدام می‌کنیم',  openPos: 'موقعیت باز',              tagline: 'به طور فعال استخدام می‌کند',   lookingFor: 'دنبال می‌گردد',        isHiring: 'استخدام می‌کند',   nowHiring: 'همین الان درخواست دهید', openRole: 'نقش باز',        cta: 'درخواست دهید',        salary: 'حقوق',            location: 'مکان' },
  'Indonesian':           { hiring: 'Kami merekrut',       openPos: 'Posisi terbuka',          tagline: 'secara aktif merekrut',        lookingFor: 'mencari seorang',     isHiring: 'merekrut',        nowHiring: 'Lamar sekarang',    openRole: 'Peran terbuka',       cta: 'Lamar sekarang',      salary: 'Gaji',            location: 'Lokasi' },
  'Malay':                { hiring: 'Kami merekrut',       openPos: 'Jawatan kosong',          tagline: 'sedang merekrut secara aktif', lookingFor: 'mencari seorang',     isHiring: 'merekrut',        nowHiring: 'Mohon sekarang',    openRole: 'Peranan terbuka',     cta: 'Mohon sekarang',      salary: 'Gaji',            location: 'Lokasi' },
  'Vietnamese':           { hiring: 'Chúng tôi tuyển dụng',openPos: 'Vị trí mở',             tagline: 'đang tuyển dụng tích cực',     lookingFor: 'đang tìm kiếm',       isHiring: 'đang tuyển dụng', nowHiring: 'Ứng tuyển ngay',    openRole: 'Vị trí mở',           cta: 'Ứng tuyển ngay',      salary: 'Lương',           location: 'Địa điểm' },
  'Thai':                 { hiring: 'รับสมัครงาน',         openPos: 'ตำแหน่งว่าง',            tagline: 'กำลังรับสมัครอย่างแข็งขัน',   lookingFor: 'กำลังมองหา',          isHiring: 'รับสมัคร',        nowHiring: 'สมัครตอนนี้',       openRole: 'ตำแหน่งว่าง',         cta: 'สมัครตอนนี้',          salary: 'เงินเดือน',        location: 'ที่ตั้ง' },
  'Filipino':             { hiring: 'Nag-aanyaya kami',    openPos: 'Bukas na posisyon',       tagline: 'aktibong nag-aanyaya',         lookingFor: 'naghahanap ng',       isHiring: 'nag-aanyaya',     nowHiring: 'Mag-apply na',      openRole: 'Bukas na papel',      cta: 'Mag-apply na',        salary: 'Sahod',           location: 'Lokasyon' },
  'Bengali':              { hiring: 'আমরা নিয়োগ করছি',    openPos: 'খোলা পদ',                tagline: 'সক্রিয়ভাবে নিয়োগ করছে',       lookingFor: 'খুঁজছে',              isHiring: 'নিয়োগ করছে',       nowHiring: 'এখনই আবেদন করুন',  openRole: 'খোলা ভূমিকা',         cta: 'এখনই আবেদন করুন',     salary: 'বেতন',            location: 'অবস্থান' },
  'Urdu':                 { hiring: 'ہم بھرتی کر رہے ہیں', openPos: 'کھلی پوزیشن',           tagline: 'فعال طور پر بھرتی کر رہا ہے', lookingFor: 'تلاش کر رہا ہے',      isHiring: 'بھرتی کر رہا ہے',  nowHiring: 'ابھی درخواست دیں',  openRole: 'کھلا کردار',          cta: 'ابھی درخواست دیں',    salary: 'تنخواہ',          location: 'مقام' },
  'Tamil':                { hiring: 'நாங்கள் வேலையாட்கள் தேடுகிறோம்', openPos: 'வெற்றிடம்', tagline: 'தீவிரமாக ஆட்சேர்ப்பு செய்கிறது', lookingFor: 'தேடுகிறது',         isHiring: 'ஆட்சேர்ப்பு',     nowHiring: 'இப்போது விண்ணப்பிக்கவும்', openRole: 'திறந்த பதவி', cta: 'இப்போது விண்ணப்பிக்கவும்', salary: 'சம்பளம்',          location: 'இடம்' },
  'Swahili':              { hiring: 'Tunaajiri',           openPos: 'Nafasi wazi',             tagline: 'anaajiri kikamilifu',          lookingFor: 'anatafuta',           isHiring: 'anaajiri',        nowHiring: 'Omba sasa',         openRole: 'Nafasi wazi',         cta: 'Omba sasa',           salary: 'Mshahara',        location: 'Mahali' },
  'Catalan':              { hiring: 'Estem contractant',   openPos: 'Posició oberta',          tagline: 'contracta activament',         lookingFor: 'busca un/una',        isHiring: 'contracta',       nowHiring: 'Sol·licita ara',    openRole: 'Rol obert',           cta: "Sol·licita ara",      salary: 'Salari',          location: 'Ubicació' },
  'Bulgarian':            { hiring: 'Наемаме',             openPos: 'Отворена позиция',        tagline: 'активно наема',                lookingFor: 'търси',               isHiring: 'наема',           nowHiring: 'Кандидатствай',     openRole: 'Отворена роля',       cta: 'Кандидатствай',       salary: 'Заплата',         location: 'Местоположение' },
  'Croatian':             { hiring: 'Zapošljavamo',        openPos: 'Otvorena pozicija',       tagline: 'aktivno zapošljava',           lookingFor: 'traži',               isHiring: 'zapošljava',      nowHiring: 'Prijavi se',        openRole: 'Otvorena uloga',      cta: 'Prijavi se',          salary: 'Plaća',           location: 'Lokacija' },
  'Serbian':              { hiring: 'Zapošljavamo',        openPos: 'Otvorena pozicija',       tagline: 'aktivno zapošljava',           lookingFor: 'traži',               isHiring: 'zapošljava',      nowHiring: 'Prijavi se',        openRole: 'Otvorena uloga',      cta: 'Prijavi se',          salary: 'Plata',           location: 'Lokacija' },
  'Slovenian':            { hiring: 'Zaposlujemo',         openPos: 'Prosto delovno mesto',    tagline: 'aktivno zaposluje',            lookingFor: 'iščemo',              isHiring: 'zaposluje',       nowHiring: 'Prijavi se',        openRole: 'Odprta vloga',        cta: 'Prijavi se',          salary: 'Plača',           location: 'Lokacija' },
  'Lithuanian':           { hiring: 'Samdom',              openPos: 'Laisva vieta',            tagline: 'aktyviai įdarbina',            lookingFor: 'ieško',               isHiring: 'įdarbina',        nowHiring: 'Kandidatuok',       openRole: 'Laisva pozicija',     cta: 'Kandidatuoti',        salary: 'Atlyginimas',     location: 'Vieta' },
  'Latvian':              { hiring: 'Meklējam',            openPos: 'Brīva vakance',           tagline: 'aktīvi pieņem darbā',          lookingFor: 'meklē',               isHiring: 'pieņem darbā',    nowHiring: 'Pieteikties',       openRole: 'Brīva vakance',       cta: 'Pieteikties',         salary: 'Alga',            location: 'Atrašanās vieta' },
  'Estonian':             { hiring: 'Värbame',             openPos: 'Vaba koht',               tagline: 'värbab aktiivselt',            lookingFor: 'otsib',               isHiring: 'värbab',          nowHiring: 'Kandideeri',        openRole: 'Avatud roll',         cta: 'Kandideeri',          salary: 'Palk',            location: 'Asukoht' },
  'Albanian':             { hiring: 'Po punësojmë',        openPos: 'Pozicion i hapur',        tagline: 'po punëson aktivisht',         lookingFor: 'kërkon',              isHiring: 'po punëson',      nowHiring: 'Apliko tani',       openRole: 'Rol i hapur',         cta: 'Apliko tani',         salary: 'Paga',            location: 'Vendndodhja' },
  'Macedonian':           { hiring: 'Вработуваме',         openPos: 'Отворена позиција',       tagline: 'активно вработува',            lookingFor: 'бара',                isHiring: 'вработува',       nowHiring: 'Кандидирај се',     openRole: 'Отворена улога',      cta: 'Кандидирај се',       salary: 'Плата',           location: 'Локација' },
  'Icelandic':            { hiring: 'Við erum að ráða',    openPos: 'Laus staða',              tagline: 'er virkt að ráða',             lookingFor: 'er að leita að',      isHiring: 'er að ráða',      nowHiring: 'Sæktu um',          openRole: 'Opin staða',          cta: 'Sæktu um',            salary: 'Laun',            location: 'Staðsetning' },
  'Welsh':                { hiring: 'Rydym yn recriwtio',  openPos: 'Swydd wag',               tagline: "yn recriwtio'n weithredol",    lookingFor: 'yn chwilio am',       isHiring: 'yn recriwtio',    nowHiring: 'Ymgeisiwch nawr',   openRole: 'Rôl agored',          cta: 'Ymgeisiwch nawr',     salary: 'Cyflog',          location: 'Lleoliad' },
  'Irish':                { hiring: 'Táimid ag earcú',     openPos: 'Post oscailte',           tagline: 'ag earcú go gníomhach',        lookingFor: 'ag lorg',             isHiring: 'ag earcú',        nowHiring: 'Iarr anois',        openRole: 'Ról oscailte',        cta: 'Iarr anois',          salary: 'Tuarastal',       location: 'Suíomh' },
}

export const LANGUAGES = Object.keys(TEMPLATE_I18N).sort((a, b) => a.localeCompare(b))

// ── Job type translations per language ────────────────────────────────────────
const _FT = 'Full-time', _PT = 'Part-time', _RE = 'Remote', _HY = 'Hybrid', _CO = 'Contract', _FL = 'Freelance', _IN = 'Internship'
export const JOB_TYPE_I18N = {
  'English':              { [_FT]: 'Full-time',          [_PT]: 'Part-time',             [_RE]: 'Remote',       [_HY]: 'Hybrid',      [_CO]: 'Contract',     [_FL]: 'Freelance',  [_IN]: 'Internship' },
  'Polish':               { [_FT]: 'Pełny etat',         [_PT]: 'Część etatu',           [_RE]: 'Zdalnie',      [_HY]: 'Hybrydowo',   [_CO]: 'Kontrakt',     [_FL]: 'Freelance',  [_IN]: 'Staż' },
  'German':               { [_FT]: 'Vollzeit',           [_PT]: 'Teilzeit',              [_RE]: 'Remote',       [_HY]: 'Hybrid',      [_CO]: 'Vertrag',      [_FL]: 'Freelance',  [_IN]: 'Praktikum' },
  'French':               { [_FT]: 'Temps plein',        [_PT]: 'Temps partiel',         [_RE]: 'Télétravail',  [_HY]: 'Hybride',     [_CO]: 'Contrat',      [_FL]: 'Freelance',  [_IN]: 'Stage' },
  'Spanish':              { [_FT]: 'Jornada completa',   [_PT]: 'Media jornada',         [_RE]: 'Remoto',       [_HY]: 'Híbrido',     [_CO]: 'Contrato',     [_FL]: 'Freelance',  [_IN]: 'Prácticas' },
  'Italian':              { [_FT]: 'Tempo pieno',        [_PT]: 'Part-time',             [_RE]: 'Remoto',       [_HY]: 'Ibrido',      [_CO]: 'Contratto',    [_FL]: 'Freelance',  [_IN]: 'Stage' },
  'Portuguese':           { [_FT]: 'Tempo integral',     [_PT]: 'Meio período',          [_RE]: 'Remoto',       [_HY]: 'Híbrido',     [_CO]: 'Contrato',     [_FL]: 'Freelance',  [_IN]: 'Estágio' },
  'Dutch':                { [_FT]: 'Voltijd',            [_PT]: 'Deeltijd',              [_RE]: 'Remote',       [_HY]: 'Hybride',     [_CO]: 'Contract',     [_FL]: 'Freelance',  [_IN]: 'Stage' },
  'Swedish':              { [_FT]: 'Heltid',             [_PT]: 'Deltid',                [_RE]: 'Remote',       [_HY]: 'Hybrid',      [_CO]: 'Kontrakt',     [_FL]: 'Freelance',  [_IN]: 'Praktik' },
  'Norwegian':            { [_FT]: 'Heltid',             [_PT]: 'Deltid',                [_RE]: 'Remote',       [_HY]: 'Hybrid',      [_CO]: 'Kontrakt',     [_FL]: 'Freelance',  [_IN]: 'Praktikum' },
  'Danish':               { [_FT]: 'Fuldtid',            [_PT]: 'Deltid',                [_RE]: 'Remote',       [_HY]: 'Hybrid',      [_CO]: 'Kontrakt',     [_FL]: 'Freelance',  [_IN]: 'Praktik' },
  'Finnish':              { [_FT]: 'Kokopäiväinen',      [_PT]: 'Osa-aikainen',          [_RE]: 'Etätyö',       [_HY]: 'Hybridi',     [_CO]: 'Sopimus',      [_FL]: 'Freelance',  [_IN]: 'Harjoittelu' },
  'Czech':                { [_FT]: 'Plný úvazek',        [_PT]: 'Částečný úvazek',       [_RE]: 'Remote',       [_HY]: 'Hybrid',      [_CO]: 'Smlouva',      [_FL]: 'Freelance',  [_IN]: 'Stáž' },
  'Slovak':               { [_FT]: 'Plný úväzok',        [_PT]: 'Čiastočný úväzok',      [_RE]: 'Remote',       [_HY]: 'Hybrid',      [_CO]: 'Zmluva',       [_FL]: 'Freelance',  [_IN]: 'Stáž' },
  'Hungarian':            { [_FT]: 'Teljes munkaidő',    [_PT]: 'Részmunkaidő',          [_RE]: 'Remote',       [_HY]: 'Hibrid',      [_CO]: 'Szerződéses',  [_FL]: 'Freelance',  [_IN]: 'Gyakornoki' },
  'Romanian':             { [_FT]: 'Program întreg',     [_PT]: 'Program parțial',       [_RE]: 'Remote',       [_HY]: 'Hibrid',      [_CO]: 'Contract',     [_FL]: 'Freelance',  [_IN]: 'Internship' },
  'Russian':              { [_FT]: 'Полная занятость',   [_PT]: 'Частичная занятость',   [_RE]: 'Удалённо',     [_HY]: 'Гибридный',   [_CO]: 'Контракт',     [_FL]: 'Фриланс',    [_IN]: 'Стажировка' },
  'Ukrainian':            { [_FT]: 'Повна зайнятість',   [_PT]: 'Часткова зайнятість',   [_RE]: 'Дистанційно',  [_HY]: 'Гібридний',   [_CO]: 'Контракт',     [_FL]: 'Фріланс',    [_IN]: 'Стажування' },
  'Turkish':              { [_FT]: 'Tam zamanlı',        [_PT]: 'Yarı zamanlı',          [_RE]: 'Uzaktan',      [_HY]: 'Hibrit',      [_CO]: 'Sözleşmeli',   [_FL]: 'Freelance',  [_IN]: 'Staj' },
  'Greek':                { [_FT]: 'Πλήρης απασχόληση',  [_PT]: 'Μερική απασχόληση',     [_RE]: 'Εξ αποστάσεως',[_HY]: 'Υβριδικό',    [_CO]: 'Σύμβαση',      [_FL]: 'Ελεύθερος',  [_IN]: 'Πρακτική' },
  'Japanese':             { [_FT]: '正社員',              [_PT]: 'パート',                 [_RE]: 'リモート',      [_HY]: 'ハイブリッド',  [_CO]: '契約社員',      [_FL]: 'フリーランス', [_IN]: 'インターン' },
  'Korean':               { [_FT]: '정규직',              [_PT]: '파트타임',               [_RE]: '원격',          [_HY]: '하이브리드',    [_CO]: '계약직',        [_FL]: '프리랜서',    [_IN]: '인턴' },
  'Chinese (Simplified)': { [_FT]: '全职',                [_PT]: '兼职',                   [_RE]: '远程',          [_HY]: '混合',          [_CO]: '合同制',        [_FL]: '自由职业',    [_IN]: '实习' },
  'Chinese (Traditional)':{ [_FT]: '全職',                [_PT]: '兼職',                   [_RE]: '遠端',          [_HY]: '混合',          [_CO]: '合約制',        [_FL]: '自由工作者',  [_IN]: '實習' },
  'Arabic':               { [_FT]: 'دوام كامل',           [_PT]: 'دوام جزئي',             [_RE]: 'عن بعد',        [_HY]: 'هجين',          [_CO]: 'عقد',           [_FL]: 'عمل حر',      [_IN]: 'تدريب' },
  'Hindi':                { [_FT]: 'पूर्णकालिक',         [_PT]: 'अंशकालिक',              [_RE]: 'दूरस्थ',        [_HY]: 'हाइब्रिड',      [_CO]: 'अनुबंध',        [_FL]: 'फ्रीलांस',    [_IN]: 'इंटर्नशिप' },
  'Indonesian':           { [_FT]: 'Penuh waktu',        [_PT]: 'Paruh waktu',           [_RE]: 'Remote',       [_HY]: 'Hybrid',      [_CO]: 'Kontrak',      [_FL]: 'Freelance',  [_IN]: 'Magang' },
  'Vietnamese':           { [_FT]: 'Toàn thời gian',     [_PT]: 'Bán thời gian',         [_RE]: 'Từ xa',        [_HY]: 'Kết hợp',     [_CO]: 'Hợp đồng',     [_FL]: 'Freelance',  [_IN]: 'Thực tập' },
  'Croatian':             { [_FT]: 'Puno radno vrijeme', [_PT]: 'Dio radnog vremena',    [_RE]: 'Remote',       [_HY]: 'Hibridno',    [_CO]: 'Ugovor',       [_FL]: 'Freelance',  [_IN]: 'Stažiranje' },
  'Bulgarian':            { [_FT]: 'Пълно работно време',[_PT]: 'Непълно работно время', [_RE]: 'Дистанционно', [_HY]: 'Хибридно',    [_CO]: 'Договор',      [_FL]: 'Фриланс',    [_IN]: 'Стаж' },
}

// ── Export sizes ──────────────────────────────────────────────────────────────
export const EXPORT_SIZES = [
  { id: 'sq',        label: 'Square',         w: 1080, h: 1080, desc: 'Instagram, Facebook, LinkedIn' },
  { id: 'linkedin',  label: 'LinkedIn Banner', w: 1200, h: 628,  desc: 'LinkedIn Single Image Ad' },
  { id: 'banner',    label: 'Wide Banner',     w: 1920, h: 1080, desc: 'YouTube / Desktop banner' },
  { id: 'story',     label: 'Story / Reel',    w: 1080, h: 1920, desc: 'Instagram & TikTok Stories' },
  { id: 'email',     label: 'Email Header',    w: 600,  h: 200,  desc: 'Newsletter banner' },
  { id: 'leaderboard',label: 'Leaderboard',   w: 728,  h: 90,   desc: 'Web ad (728×90)' },
  { id: 'custom',    label: 'Custom…',         w: null, h: null, desc: 'Enter custom dimensions' },
]

// ── Platform copy character limits ────────────────────────────────────────────
// "visible" = chars shown before "See more" / truncation in feed
export const PLATFORM_COPY_LIMITS = {
  facebook:  { primaryText: 125, headline: 40, description: 27 },
  instagram: { primaryText: 125 },
  linkedin:  { primaryText: 150, headline: 70 },
  tiktok:    { primaryText: 100 },
  youtube:   { headline: 90, description: 70 },
  snapchat:  { primaryText: 80, headline: 34 },
}

// Per-platform targeting capabilities
export const PLATFORM_TARGETING = {
  facebook:  ['age', 'gender', 'location', 'interests', 'seniority', 'device'],
  instagram: ['age', 'gender', 'location', 'interests', 'device'],
  threads:   ['age', 'gender', 'location'],
  tiktok:    ['age', 'gender', 'location', 'interests', 'device'],
  youtube:   ['age', 'gender', 'location', 'interests', 'device'],
  snapchat:  ['age', 'gender', 'location', 'device'],
  linkedin:  ['age', 'gender', 'location', 'interests', 'seniority', 'device'],
}
