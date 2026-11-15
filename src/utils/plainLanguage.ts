import { getT } from '../i18n/translations';
import { LanguageCode, Medication, PillColor, PillShape } from '../types';

export interface PlainMedicineTags {
  purposeTag: string;
  timingTag: string;
  pillLookTag: string;
}

const COLOR_LABELS: Record<LanguageCode, Record<PillColor, string>> = {
  en: {
    white: 'White',
    yellow: 'Yellow',
    pink: 'Pink',
    blue: 'Blue',
    amber: 'Amber',
    teal: 'Teal',
    green: 'Green',
  },
  hi: {
    white: 'सफेद',
    yellow: 'पीली',
    pink: 'गुलाबी',
    blue: 'नीली',
    amber: 'सुनहरी',
    teal: 'हरी-नीली',
    green: 'हरी',
  },
  mr: {
    white: 'पांढरी',
    yellow: 'पिवळी',
    pink: 'गुलाबी',
    blue: 'निळी',
    amber: 'तांबूस',
    teal: 'हिरवट-निळी',
    green: 'हिरवी',
  },
  ta: {
    white: 'White',
    yellow: 'Yellow',
    pink: 'Pink',
    blue: 'Blue',
    amber: 'Amber',
    teal: 'Teal',
    green: 'Green',
  },
  te: {
    white: 'White',
    yellow: 'Yellow',
    pink: 'Pink',
    blue: 'Blue',
    amber: 'Amber',
    teal: 'Teal',
    green: 'Green',
  },
  bn: {
    white: 'White',
    yellow: 'Yellow',
    pink: 'Pink',
    blue: 'Blue',
    amber: 'Amber',
    teal: 'Teal',
    green: 'Green',
  },
  gu: {
    white: 'White',
    yellow: 'Yellow',
    pink: 'Pink',
    blue: 'Blue',
    amber: 'Amber',
    teal: 'Teal',
    green: 'Green',
  },
  kn: {
    white: 'White',
    yellow: 'Yellow',
    pink: 'Pink',
    blue: 'Blue',
    amber: 'Amber',
    teal: 'Teal',
    green: 'Green',
  },
};

const SHAPE_LABELS: Record<LanguageCode, Record<PillShape, string>> = {
  en: { round: 'Round pill', oval: 'Oval pill', capsule: 'Capsule' },
  hi: { round: 'गोल गोली', oval: 'लंबी गोली', capsule: 'कैप्सूल' },
  mr: { round: 'गोल गोळी', oval: 'लांबट गोळी', capsule: 'कॅप्सूल' },
  ta: { round: 'Round pill', oval: 'Oval pill', capsule: 'Capsule' },
  te: { round: 'Round pill', oval: 'Oval pill', capsule: 'Capsule' },
  bn: { round: 'Round pill', oval: 'Oval pill', capsule: 'Capsule' },
  gu: { round: 'Round pill', oval: 'Oval pill', capsule: 'Capsule' },
  kn: { round: 'Round pill', oval: 'Oval pill', capsule: 'Capsule' },
};

export function getPillLookLabel(color: PillColor, shape: PillShape, lang: LanguageCode): string {
  const cMap = COLOR_LABELS[lang] || COLOR_LABELS.en;
  const sMap = SHAPE_LABELS[lang] || SHAPE_LABELS.en;
  return `${cMap[color] || cMap.white} ${sMap[shape] || sMap.round}`;
}

export function getPlainPurposeTag(med: Pick<Medication, 'name' | 'purpose'>, lang: LanguageCode): string {
  const t = getT(lang);
  const haystack = `${med.name} ${med.purpose}`.toLowerCase();

  if (/(sugar|diabet|metformin|glim|insulin|glucose|glyc|शुगर|मधुमेह)/.test(haystack)) {
    return t.tagForSugar;
  }
  if (/(blood pressure|bp\b|hypertens|amlodip|losart|telmi|atenol|बीपी|रक्तचाप|रक्तदाब)/.test(haystack)) {
    return t.tagForBP;
  }
  if (/(heart|cholesterol|atorva|rosuva|statin|cardio|aspirin|clopi|दिल|हृदय|कोलेस्ट)/.test(haystack)) {
    return t.tagForHeart;
  }
  if (/(bone|vitamin|calcium|vit d|d3|b12|strength|energy|हड्डी|हाड|ताकत|ऊर्जा)/.test(haystack)) {
    return t.tagForBones;
  }
  if (/(stomach|acid|pantop|omep|gas|digest|पेट|पचन)/.test(haystack)) {
    return t.tagForStomach;
  }
  if (/(sleep|rest|insomn|नींद|झोप)/.test(haystack)) {
    return t.tagForSleep;
  }

  // Strip clinical jargon if falling back to custom purpose text
  const cleaned = med.purpose
    .replace(/\btype\s*2\s*diabetes\b/gi, 'sugar balance')
    .replace(/\bhypertension\b/gi, 'blood pressure')
    .replace(/\bhyperlipidemia\b/gi, 'heart care')
    .replace(/\bcardiovascular\b/gi, 'heart')
    .trim();

  if (!cleaned) return t.tagForHealth;
  return cleaned.length > 36 ? `${cleaned.slice(0, 33).trim()}...` : cleaned;
}

export function getPlainTimingTag(
  med: Pick<Medication, 'foodTiming' | 'routineCue'>,
  lang: LanguageCode
): string {
  const t = getT(lang);
  const cue = (med.routineCue || '').toLowerCase();

  if (med.foodTiming === 'with_food') {
    if (/(breakfast|नाश्त)/.test(cue)) return t.tagTakeAfterBreakfast;
    if (/(lunch|दुपार|दोपहर)/.test(cue)) return t.tagTakeAfterLunch;
    if (/(dinner|night|रात्र|रात)/.test(cue)) return t.tagTakeAfterDinner;
    return t.tagTakeAfterFood;
  }

  if (med.foodTiming === 'without_food') {
    if (/(breakfast|morning|tea|सुबह|सकाळ)/.test(cue)) return t.tagTakeBeforeBreakfast;
    return t.tagTakeBeforeFood;
  }

  if (/(bed|sleep|night|सोने|झोप|रात)/.test(cue)) {
    return t.tagTakeBeforeSleep;
  }
  return t.tagTakeAnytime;
}

export function getPlainMedicineTags(med: Medication, lang: LanguageCode): PlainMedicineTags {
  return {
    purposeTag: getPlainPurposeTag(med, lang),
    timingTag: getPlainTimingTag(med, lang),
    pillLookTag: getPillLookLabel(med.pillColor, med.pillShape, lang),
  };
}

export function getPlainConditionLabel(condition: string, lang: LanguageCode): string {
  const lower = condition.toLowerCase();
  const t = getT(lang);
  if (/(diabetes|sugar|glyc)/.test(lower)) return t.plainConditionSugar;
  if (/(hypertension|blood pressure|\bbp\b)/.test(lower)) return t.plainConditionBP;
  if (/(cholesterol|lipid|heart|cardiac|cardio)/.test(lower)) return t.plainConditionHeart;
  if (/(arthritis|joint|knee|osteo)/.test(lower)) return t.plainConditionJoints;
  return condition;
}
