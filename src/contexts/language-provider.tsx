'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useMemo, useEffect } from 'react';

export type Language = 'en' | 'am' | 'om';

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  getTranslation: (translations: Record<Language, string>) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const storedLanguage = localStorage.getItem('language') as Language | null;
      if (storedLanguage && ['en', 'am', 'om'].includes(storedLanguage)) {
        setLanguageState(storedLanguage);
      }
    } catch (e) {
      console.warn('Could not read language from localStorage.');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    try {
      localStorage.setItem('language', lang);
    } catch (e) {
      console.warn('Could not save language to localStorage.');
    }
    setLanguageState(lang);
  };


  const getTranslation = (translations: Record<Language, string>): string => {
    return translations[language] || translations.en;
  };

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    getTranslation
  }), [language]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}
