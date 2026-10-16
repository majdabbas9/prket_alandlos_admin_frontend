export type Lang = 'en' | 'ar' | 'he';

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ar', label: 'العربية', short: 'عربي' },
  { code: 'he', label: 'עברית', short: 'עברית' },
];

const en = {
  // Meta
  'meta.title': 'Prket Alandlos — Timeless Wood Flooring',
  'meta.description':
    'Prket Alandlos crafts premium oak, walnut, herringbone and chevron wood flooring. Timeless elegance, sustainably sourced.',

  // Navbar
  'nav.home': 'Home',
  'nav.products': 'Products',
  'nav.contact': 'Contact Us',
  'nav.explore': 'Explore Collection',
  'nav.toggleMenu': 'Toggle menu',
  'nav.logoAlt': 'Prket Alandlos Logo',

  // Footer
  'footer.quickLinks': 'Quick Links',
  'footer.visitUs': 'Visit Us',
  'footer.openingHours': 'Opening Hours',
  'footer.fallbackDescription':
    'Premium wood flooring, crafted with patience. Sustainably sourced hardwoods finished by hand for floors that last generations.',
  'footer.hoursSunThu': 'Sunday — Thursday',
  'footer.hoursSunThuTime': '9:00 AM — 7:00 PM',
  'footer.hoursFriSat': 'Friday — Saturday',
  'footer.hoursFriSatTime': '10:00 AM — 9:00 PM',
  'footer.rights': '© {year} Prket Alandlos. All rights reserved.',
  'footer.tagline': 'Crafted with care for floors that tell a story.',
  'footer.instagram': 'Instagram',
  'footer.whatsapp': 'WhatsApp',

  // Home
  'home.heroImgAlt': 'Premium parquet flooring in a sunlit living room',
  'home.exploreCollection': 'Explore the Collection',
  'home.visitShowroom': 'Visit Our Showroom',
  'home.ourAddress': 'Our Address',
  'home.openingHours': 'Opening Hours',
  'home.gettingHere': 'Getting Here',
  'home.gettingHereText': 'Free on-site parking for all showroom visitors. Located in {location}.',
  'home.showroomName': 'Prket Alandlos Showroom',
  'home.googleMaps': 'Google Maps',
  'home.waze': 'Waze',
  'home.statsYears': 'Years of Craft',
  'home.statsFloors': 'Floors Installed',
  'home.statsCollections': 'Wood Collections',
  'home.statsRating': 'Average Rating',
  'home.fallbackHeroEyebrow': 'Premium Wood Flooring · Since 1994',
  'home.fallbackHeroTitle': 'Timeless Elegance\nfor Your Floors',
  'home.fallbackHeroDescription':
    'Discover handcrafted oak, walnut, herringbone and chevron parquet — sustainably sourced and finished to last a lifetime.',
  'home.fallbackHoursSunThu': 'Sunday — Thursday: 9:00 AM — 7:00 PM',
  'home.fallbackHoursFriSat': 'Friday — Saturday: 10:00 AM — 9:00 PM',
  'home.fallbackShowroomEyebrow': 'Visit Our Showroom',
  'home.fallbackShowroomTitle': 'Come feel the grain for yourself',
  'home.fallbackShowroomDescription':
    'Our showroom is a tactile library of every finish and pattern we craft. Walk on the floors, talk to our makers, and find the one that feels like home.',

  // Products
  'products.pageEyebrow': 'Our Collection',
  'products.pageTitle': 'Flooring that grounds a home',
  'products.pageDescription':
    'Explore our collections of oak, walnut, herringbone and chevron parquet. Each floor is hand-finished and backed by a 25-year structural guarantee.',
  'products.sortFeatured': 'Featured',
  'products.sortPriceAsc': 'Price: Low to High',
  'products.sortPriceDesc': 'Price: High to Low',
  'products.sortNameAsc': 'Name: A to Z',
  'products.sortLabel': 'Sort by',
  'products.filters': 'Filters',
  'products.woodType': 'Wood Type',
  'products.finish': 'Finish',
  'products.clearAllFilters': 'Clear all filters',
  'products.showingOne': 'Showing {count} product',
  'products.showingMany': 'Showing {count} products',
  'products.viewDetails': 'View Details',
  'products.thickness': 'Thickness',
  'products.plankSize': 'Plank Size',
  'products.backToCollection': 'Back to Collection',
  'products.description': 'Description',
  'products.specifications': 'Specifications',
  'products.inquire': 'Inquire About This Floor',
  'products.loadError': 'Failed to load products',
  'products.noResults': 'No floors match those filters',
  'products.noResultsHint': 'Try removing a filter to see more options.',
  'products.clearFilters': 'Clear filters',
  'products.showResults': 'Show {count} results',
  'products.perSqm': '/ m²',
  'products.closeFilters': 'Close filters',

  // Contact
  'contact.callUs': 'Call Us',
  'contact.whatsappUs': 'WhatsApp Us',
  'contact.clickToChat': 'Click to chat with us',
  'contact.visitShowroom': 'Visit the Showroom',
  'contact.fallbackHours': 'Mon — Sat, 9am to 7pm',
  'contact.storeHours': 'Store Hours',
  'contact.howToFindUs': 'How to Find Us',
  'contact.fallbackEyebrow': 'Get in Touch',
  'contact.fallbackTitle': "Let's talk about your floor",
  'contact.fallbackDescription':
    "Whether you're planning a renovation or just exploring finishes, our specialists are here to help. Reach out and we'll find the right wood for your space.",
} as const;

export type TranslationKey = keyof typeof en;

const ar: Record<TranslationKey, string> = {
  // Meta
  'meta.title': 'بركيه الأندلس — أرضيات خشبية خالدة',
  'meta.description':
    'بركيه الأندلس يصنّع أرضيات فاخرة من البلوط والجوز والمتعرّج والرَّفرف. أناقة خالدة من مصادر مستدامة.',

  // Navbar
  'nav.home': 'الرئيسية',
  'nav.products': 'المنتجات',
  'nav.contact': 'تواصلوا معنا',
  'nav.explore': 'استكشفوا المجموعة',
  'nav.toggleMenu': 'فتح/إغلاق القائمة',
  'nav.logoAlt': 'شعار بركيه الأندلس',

  // Footer
  'footer.quickLinks': 'روابط سريعة',
  'footer.visitUs': 'زورونا',
  'footer.openingHours': 'ساعات العمل',
  'footer.fallbackDescription':
    'أرضيات خشبية فاخرة مصنوعة بإتقان وصبر. أخشاب صلبة من مصادر مستدامة، مصقولة يدويًا لأرضيات تدوم لأجيال.',
  'footer.hoursSunThu': 'الأحد — الخميس',
  'footer.hoursSunThuTime': '9:00 صباحًا — 7:00 مساءً',
  'footer.hoursFriSat': 'الجمعة — السبت',
  'footer.hoursFriSatTime': '10:00 صباحًا — 9:00 مساءً',
  'footer.rights': '© {year} بركيه الأندلس. جميع الحقوق محفوظة.',
  'footer.tagline': 'صُنعت بعناية لأرضيات تروي حكاية.',
  'footer.instagram': 'إنستغرام',
  'footer.whatsapp': 'واتساب',

  // Home
  'home.heroImgAlt': 'أرضيات باركيه فاخرة في غرفة معيشة مضاءة بأشعة الشمس',
  'home.exploreCollection': 'استكشفوا المجموعة',
  'home.visitShowroom': 'زوروا صالة العرض',
  'home.ourAddress': 'عنواننا',
  'home.openingHours': 'ساعات العمل',
  'home.gettingHere': 'الوصول إلينا',
  'home.gettingHereText': 'مواقف مجانية لجميع زوّار صالة العرض. نقع في {location}.',
  'home.showroomName': 'صالة عرض بركيه الأندلس',
  'home.googleMaps': 'خرائط جوجل',
  'home.waze': 'ويز',
  'home.statsYears': 'سنوات من الحِرفة',
  'home.statsFloors': 'أرضية مُركّبة',
  'home.statsCollections': 'تشكيلات خشبية',
  'home.statsRating': 'متوسط التقييم',
  'home.fallbackHeroEyebrow': 'أرضيات خشبية فاخرة · منذ 1994',
  'home.fallbackHeroTitle': 'أناقة خالدة\nلأرضيات منزلكم',
  'home.fallbackHeroDescription':
    'اكتشفوا باركيه البلوط والجوز والمتعرّج والرَّفرف المصنوع يدويًا — من مصادر مستدامة وبلمسة نهائية تدوم مدى الحياة.',
  'home.fallbackHoursSunThu': 'الأحد — الخميس: 9:00 صباحًا — 7:00 مساءً',
  'home.fallbackHoursFriSat': 'الجمعة — السبت: 10:00 صباحًا — 9:00 مساءً',
  'home.fallbackShowroomEyebrow': 'زوروا صالة العرض',
  'home.fallbackShowroomTitle': 'تعالوا والمسوا الخشب بأنفسكم',
  'home.fallbackShowroomDescription':
    'صالة عرضنا مكتبة ملموسة لكل تشطيب ونقشة نصنعها. امشوا على الأرضيات وتحدثوا مع صُنّاعنا واعثروا على الأرضية التي تشبه البيت.',

  // Products
  'products.pageEyebrow': 'مجموعتنا',
  'products.pageTitle': 'أرضيات تُرسي جذور المنزل',
  'products.pageDescription':
    'استكشفوا تشكيلاتنا من باركيه البلوط والجوز والمتعرّج والرَّفرف. كل أرضية مصقولة يدويًا ومضمونة هيكليًا لمدة 25 عامًا.',
  'products.sortFeatured': 'المميز',
  'products.sortPriceAsc': 'السعر: من الأقل إلى الأعلى',
  'products.sortPriceDesc': 'السعر: من الأعلى إلى الأقل',
  'products.sortNameAsc': 'الاسم: من أ إلى ي',
  'products.sortLabel': 'ترتيب حسب',
  'products.filters': 'الفلاتر',
  'products.woodType': 'نوع الخشب',
  'products.finish': 'التشطيب',
  'products.clearAllFilters': 'مسح جميع الفلاتر',
  'products.showingOne': 'عرض منتج واحد',
  'products.showingMany': 'عرض {count} من المنتجات',
  'products.viewDetails': 'عرض التفاصيل',
  'products.thickness': 'السماكة',
  'products.plankSize': 'مقاس اللوح',
  'products.backToCollection': 'العودة إلى المجموعة',
  'products.description': 'الوصف',
  'products.specifications': 'المواصفات',
  'products.inquire': 'استفسروا عن هذه الأرضية',
  'products.loadError': 'تعذّر تحميل المنتجات',
  'products.noResults': 'لا توجد أرضيات تطابق هذه الفلاتر',
  'products.noResultsHint': 'جرّبوا إزالة فلتر واحد لرؤية المزيد من الخيارات.',
  'products.clearFilters': 'مسح الفلاتر',
  'products.showResults': 'عرض {count} نتيجة',
  'products.perSqm': '/ م²',
  'products.closeFilters': 'إغلاق الفلاتر',

  // Contact
  'contact.callUs': 'اتصلوا بنا',
  'contact.whatsappUs': 'راسلونا عبر واتساب',
  'contact.clickToChat': 'اضغطوا للدردشة معنا',
  'contact.visitShowroom': 'زوروا صالة العرض',
  'contact.fallbackHours': 'الاثنين — السبت، 9 صباحًا حتى 7 مساءً',
  'contact.storeHours': 'ساعات العمل',
  'contact.howToFindUs': 'كيف تجدوننا',
  'contact.fallbackEyebrow': 'تواصلوا معنا',
  'contact.fallbackTitle': 'لنتحدث عن أرضيتكم',
  'contact.fallbackDescription':
    'سواء كنتم تخططون لتجديد أو تستكشفون التشطيبات فقط، متخصصونا هنا للمساعدة. تواصلوا معنا وسنجد الخشب المناسب لمساحتكم.',
};

const he: Record<TranslationKey, string> = {
  // Meta
  'meta.title': 'פרקט אלנדלוס — ריצוף עץ על-זמני',
  'meta.description':
    'פרקט אלנדלוס מייצר ריצוף פרימיום מעץ אלון, אגוז, אדרה ושברון. אלגנטיות נצחית ממקורות בני-קיימא.',

  // Navbar
  'nav.home': 'בית',
  'nav.products': 'מוצרים',
  'nav.contact': 'צרו קשר',
  'nav.explore': 'גלו את הקולקציה',
  'nav.toggleMenu': 'פתיחת תפריט',
  'nav.logoAlt': 'לוגו פרקט אלנדלוס',

  // Footer
  'footer.quickLinks': 'קישורים מהירים',
  'footer.visitUs': 'בקרו אצלנו',
  'footer.openingHours': 'שעות פתיחה',
  'footer.fallbackDescription':
    'ריצוף עץ פרימיום, עשוי בסבלנות. עצים קשים ממקורות בני-קיימא בגימור ידני לרצפות שמחזיקות דורות.',
  'footer.hoursSunThu': 'ראשון — חמישי',
  'footer.hoursSunThuTime': '9:00 — 19:00',
  'footer.hoursFriSat': 'שישי — שבת',
  'footer.hoursFriSatTime': '10:00 — 21:00',
  'footer.rights': '© {year} פרקט אלנדלוס. כל הזכויות שמורות.',
  'footer.tagline': 'עשוי באהבה לרצפות שמספרות סיפור.',
  'footer.instagram': 'אינסטגרם',
  'footer.whatsapp': 'וואטסאפ',

  // Home
  'home.heroImgAlt': 'ריצוף פרקט פרימיום בסלון מואר',
  'home.exploreCollection': 'גלו את הקולקציה',
  'home.visitShowroom': 'בקרו באולם התצוגה',
  'home.ourAddress': 'הכתובת שלנו',
  'home.openingHours': 'שעות פתיחה',
  'home.gettingHere': 'איך מגיעים',
  'home.gettingHereText': 'חניה חינם באתר לכל מבקרי אולם התצוגה. ממוקמים ב-{location}.',
  'home.showroomName': 'אולם התצוגה פרקט אלנדלוס',
  'home.googleMaps': 'גוגל מפות',
  'home.waze': 'וויז',
  'home.statsYears': 'שנות ניסיון',
  'home.statsFloors': 'רצפות שהותקנו',
  'home.statsCollections': 'קולקציות עץ',
  'home.statsRating': 'דירוג ממוצע',
  'home.fallbackHeroEyebrow': 'ריצוף עץ פרימיום · מאז 1994',
  'home.fallbackHeroTitle': 'אלגנטיות נצחית\nלרצפות שלכם',
  'home.fallbackHeroDescription':
    'גלו פרקט אלון, אגוז, אדרה ושברון בעבודת יד — ממקורות בני-קיימא ובגימור שמחזיק חיים שלמים.',
  'home.fallbackHoursSunThu': 'ראשון — חמישי: 9:00 — 19:00',
  'home.fallbackHoursFriSat': 'שישי — שבת: 10:00 — 21:00',
  'home.fallbackShowroomEyebrow': 'בקרו באולם התצוגה',
  'home.fallbackShowroomTitle': 'בואו להרגיש את העץ בעצמכם',
  'home.fallbackShowroomDescription':
    'אולם התצוגה שלנו הוא ספרייה חושית של כל גימור ודוגמה שאנחנו יוצרים. צעדו על הרצפות, דברו עם בעלי המלאכה שלנו ומצאו את זו שמרגישה כמו בית.',

  // Products
  'products.pageEyebrow': 'הקולקציה שלנו',
  'products.pageTitle': 'ריצוף שמעגן את הבית',
  'products.pageDescription':
    'גלו את קולקציות פרקט האלון, האגוז, האדרה והשברון שלנו. כל רצפה בגימור ידני ועם אחריות מבנית ל-25 שנה.',
  'products.sortFeatured': 'מומלצים',
  'products.sortPriceAsc': 'מחיר: מהנמוך לגבוה',
  'products.sortPriceDesc': 'מחיר: מהגבוה לנמוך',
  'products.sortNameAsc': 'שם: א׳ עד ת׳',
  'products.sortLabel': 'מיון לפי',
  'products.filters': 'סינון',
  'products.woodType': 'סוג עץ',
  'products.finish': 'גימור',
  'products.clearAllFilters': 'נקו את כל הסינונים',
  'products.showingOne': 'מציג מוצר אחד',
  'products.showingMany': 'מציג {count} מוצרים',
  'products.viewDetails': 'לפרטים נוספים',
  'products.thickness': 'עובי',
  'products.plankSize': 'גודל לוח',
  'products.backToCollection': 'חזרה לקולקציה',
  'products.description': 'תיאור',
  'products.specifications': 'מפרט טכני',
  'products.inquire': 'לברור על הרצפה הזו',
  'products.loadError': 'טעינת המוצרים נכשלה',
  'products.noResults': 'אין רצפות שמתאימות לסינון',
  'products.noResultsHint': 'נסו להסיר סינון אחד כדי לראות אפשרויות נוספות.',
  'products.clearFilters': 'נקו סינון',
  'products.showResults': 'הצג {count} תוצאות',
  'products.perSqm': '/ מ"ר',
  'products.closeFilters': 'סגירת סינון',

  // Contact
  'contact.callUs': 'התקשרו אלינו',
  'contact.whatsappUs': 'דברו איתנו בוואטסאפ',
  'contact.clickToChat': 'לחצו כדי לשוחח איתנו',
  'contact.visitShowroom': 'בקרו באולם התצוגה',
  'contact.fallbackHours': 'שני — שבת, 9:00 עד 19:00',
  'contact.storeHours': 'שעות פעילות',
  'contact.howToFindUs': 'איך להגיע אלינו',
  'contact.fallbackEyebrow': 'צרו קשר',
  'contact.fallbackTitle': 'בואו נדבר על הרצפה שלכם',
  'contact.fallbackDescription':
    'בין אם אתם מתכננים שיפוץ או רק בודקים גימורים, המומחים שלנו כאן כדי לעזור. צרו קשר ונמצא את העץ הנכון לחלל שלכם.',
};

export const translations: Record<Lang, Record<TranslationKey, string>> = { en, ar, he };

/**
 * Translate a key into the given language, replacing {param} placeholders.
 * Falls back to English when a key is missing.
 */
export function translate(
  lang: Lang,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  let str = (translations[lang] && translations[lang][key]) || translations.en[key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}
