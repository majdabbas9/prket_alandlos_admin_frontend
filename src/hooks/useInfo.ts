export interface Stat {
  value: string;
  label: string;
}

/** Store info for one language, as GET /api/info?lang= returns it */
export interface StoreInfo {
  lang?: string;
  showPrice: boolean;
  storeOpeningTime: string;
  email: string;
  phone: string;
  whatsappLink: string;
  location: string;
  description?: string;
  stats?: Stat[];
  showroomEyebrow?: string;
  showroomTitle?: string;
  showroomDescription?: string;
  contactEyebrow?: string;
  contactTitle?: string;
  contactDescription?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
  productsEyebrow?: string;
  productsTitle?: string;
  productsDescription?: string;
}

// AM/PM markers across the supported languages (Arabic/Hebrew meridiem terms included)
const MERIDIEM = '(?:AM|PM|am|pm|صباحًا|مساءً|לפנה״צ|אחה״צ)';

/** Same split as the public site: "Sunday — Friday 10:00 AM — 6:00 PM" → days + time */
export function parseOpeningTime(timeStr: string) {
  // Meridiem markers are optional so 24-hour formats (e.g. Hebrew "10:00 — 18:00") also parse
  const regex = new RegExp(
    `^(.*?)\\s+(\\d{1,2}:\\d{2}\\s*${MERIDIEM}?\\s*—\\s*\\d{1,2}:\\d{2}\\s*${MERIDIEM}?)$`,
    'i',
  );
  const match = timeStr.match(regex);
  if (match) {
    return {
      days: match[1].trim(),
      time: match[2].trim(),
    };
  }
  return {
    days: timeStr,
    time: '',
  };
}
