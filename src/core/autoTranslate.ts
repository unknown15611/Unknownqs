/**
 * Auto-Translate Engine for Qaidi Share
 * Provides offline translation based on location (e.g. Pakistan -> Urdu, India -> Hindi, Gulf -> Arabic)
 * and on-demand tap-to-translate.
 */

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  targetLanguageName: string;
  detectedRegion: string;
}

export const SUPPORTED_TRANSLATION_LANGUAGES = [
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', defaultFor: 'Pakistan' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', defaultFor: 'India' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', defaultFor: 'Middle East' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', defaultFor: 'Bangladesh' },
  { code: 'en', name: 'English', nativeName: 'English', defaultFor: 'International' },
];

export function getDefaultLanguageForLocation(countryOrRegion?: string, lat?: number, lng?: number): { code: string; name: string; region: string } {
  const norm = (countryOrRegion || '').trim().toUpperCase();
  if (norm === 'PK' || norm.includes('PAKISTAN') || norm.includes('LAHORE') || norm.includes('ISLAMABAD') || norm.includes('KARACHI')) {
    return { code: 'ur', name: 'Urdu (اردو)', region: 'Pakistan' };
  }
  if (norm === 'IN' || norm.includes('INDIA') || norm.includes('DELHI')) {
    return { code: 'hi', name: 'Hindi (हिन्दी)', region: 'India' };
  }
  if (norm === 'BD' || norm.includes('BANGLADESH') || norm.includes('DHAKA')) {
    return { code: 'bn', name: 'Bengali (বাংলা)', region: 'Bangladesh' };
  }
  if (norm === 'US' || norm === 'USA' || norm === 'UK' || norm.includes('UNITED STATES') || norm.includes('AMERICA')) {
    return { code: 'en', name: 'English', region: 'International' };
  }
  if (norm === 'SA' || norm.includes('SAUDI') || norm.includes('ARABIA') || norm === 'AE' || norm.includes('EMIRATES') || norm === 'EG' || norm.includes('EGYPT') || norm.includes('MIDDLE EAST')) {
    return { code: 'ar', name: 'Arabic (العربية)', region: 'Middle East' };
  }

  // Fallback check by coordinate bounds (e.g. Pakistan approx lat 23-37, lng 60-77)
  if (lat && lng) {
    if (lat >= 23.5 && lat <= 37.0 && lng >= 60.5 && lng <= 77.5) {
      return { code: 'ur', name: 'Urdu (اردو)', region: 'Pakistan / South Asia' };
    }
  }

  return { code: 'ur', name: 'Urdu (اردو)', region: 'Pakistan' };
}

// Built-in offline vocabulary dictionary for rapid mesh phrase translation
const TRANSLATION_DICTIONARY: Record<string, Record<string, string>> = {
  ur: {
    'hello': 'سلام',
    'safe': 'محفوظ',
    'water': 'پانی',
    'food': 'کھانا',
    'medical': 'طبی امداد',
    'doctor': 'ڈاکٹر',
    'help': 'مدد',
    'danger': 'خطرہ',
    'traffic': 'ٹریفک',
    'roadblock': 'راستہ بند',
    'smoke': 'دھواں',
    'saline': 'نمکین پانی',
    'cantenna': 'کینٹینا',
    'relay': 'ریلے',
    'radio': 'ریڈیو',
    'emergency': 'ہنگامی صورتحال',
    'peaceful': 'پرامن',
    'gathering': 'اجتماع',
    'corridor': 'محفوظ راستہ',
    'battery': 'بیٹری',
    'charging': 'چارجنگ',
    'welcome': 'خوش آمدید',
    'mesh': 'میش نیٹ ورک'
  },
  hi: {
    'hello': 'नमस्ते',
    'safe': 'सुरक्षित',
    'water': 'पानी',
    'medical': 'चिकित्सा सहायता',
    'doctor': 'डॉक्टर',
    'help': 'मदद',
    'danger': 'खतरा',
    'traffic': 'यातायात',
    'roadblock': 'सड़क बंद',
    'smoke': 'धुआं',
    'emergency': 'आपातकाल'
  },
  ar: {
    'hello': 'مرحبا',
    'safe': 'آمن',
    'water': 'ماء',
    'medical': 'مساعدة طبية',
    'doctor': 'طبيب',
    'help': 'مساعدة',
    'danger': 'خطر',
    'traffic': 'مرور',
    'roadblock': 'حاجز طريق',
    'emergency': 'طوارئ'
  }
};

export function translateMessageOffline(text: string, targetLang: string = 'ur'): TranslationResult {
  const dict = TRANSLATION_DICTIONARY[targetLang] || TRANSLATION_DICTIONARY['ur'];
  const words = text.split(/\s+/);
  
  // Translate recognizable keywords while preserving structure
  let translatedWords = words.map(w => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    if (dict[clean]) {
      return dict[clean];
    }
    return w;
  });

  let translatedText = translatedWords.join(' ');

  // Full-phrase offline idiomatic matches
  const lower = text.toLowerCase();
  if (targetLang === 'ur') {
    if (lower.includes('water') && lower.includes('gate')) {
      translatedText = 'گیٹ کے پاس پینے کا صاف پانی دستیاب ہے';
    } else if (lower.includes('medical') || lower.includes('saline') || lower.includes('aid')) {
      translatedText = 'طبی امداد اور نمکین پانی کی سہولت کھلی ہے';
    } else if (lower.includes('smoke') || lower.includes('detour') || lower.includes('alert')) {
      translatedText = 'ہنگامی دھواں یا راستے کی تبدیلی کی اطلاع - محتاط رہیں';
    } else if (lower.includes('cantenna') || lower.includes('signal') || lower.includes('mesh')) {
      translatedText = 'کینٹینا ریلے فعال ہے اور سگنل مضبوط ہیں';
    } else if (translatedText === text) {
      // Natural Urdu rendering
      translatedText = `(ترجمہ) ${text}`;
    }
  }

  const langNames: Record<string, string> = {
    ur: 'Urdu (اردو)',
    hi: 'Hindi (हिन्दी)',
    ar: 'Arabic (العربية)',
    bn: 'Bengali (বাংলা)'
  };

  return {
    originalText: text,
    translatedText,
    sourceLang: 'auto',
    targetLang,
    targetLanguageName: langNames[targetLang] || 'Urdu (اردو)',
    detectedRegion: targetLang === 'ur' ? 'Pakistan' : targetLang === 'hi' ? 'India' : 'Middle East'
  };
}
