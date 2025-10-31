import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import zhTranslations from './locales/zh.json';

// Get initial language from localStorage or default to 'en'
const getInitialLanguage = (): 'en' | 'zh' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language') as 'en' | 'zh' | null;
    return saved || 'en';
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      zh: {
        translation: zhTranslations
      }
    },
    lng: getInitialLanguage(), // initial language from localStorage
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
