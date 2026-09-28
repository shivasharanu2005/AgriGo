import React, { createContext, useContext, useState, useEffect } from 'react';
import { IndianLanguage } from '../types/index.ts';
import { TRANSLATIONS, LANGUAGES } from './translations.ts';

interface LanguageContextType {
  language: IndianLanguage;
  setLanguage: (lang: IndianLanguage) => void;
  t: (key: string, defaultText?: string) => string;
  languages: typeof LANGUAGES;
  currentLanguageMeta: (typeof LANGUAGES)[0];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<IndianLanguage>(() => {
    const saved = localStorage.getItem('agrivision_lang') as IndianLanguage;
    return saved && TRANSLATIONS[saved] ? saved : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr';
  }, [language]);

  const setLanguage = (lang: IndianLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('agrivision_lang', lang);
  };

  const t = (key: string, defaultText = ''): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || defaultText || key;
  };

  const currentLanguageMeta = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES, currentLanguageMeta }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    const defaultMeta = LANGUAGES[0];
    return {
      language: 'en' as IndianLanguage,
      setLanguage: () => {},
      t: (key: string, defaultText = '') => TRANSLATIONS['en']?.[key] || defaultText || key,
      languages: LANGUAGES,
      currentLanguageMeta: defaultMeta,
    };
  }
  return context;
};
