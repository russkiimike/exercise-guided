import { useState, useEffect } from 'react';
import i18n from '../i18n/config';

export function useLanguage() {
  const [language, setLanguage] = useState<'en' | 'zh'>(() => {
    // Get from localStorage or default to 'en'
    const saved = localStorage.getItem('language') as 'en' | 'zh' | null;
    return saved || 'en';
  });

  useEffect(() => {
    // Set initial language
    i18n.changeLanguage(language);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'zh' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return { language, toggleLanguage };
}
