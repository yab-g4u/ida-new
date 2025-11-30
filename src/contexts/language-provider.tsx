'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useMemo } from 'react';

export type Language = 'en' | 'am' | 'om';

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  getTranslation: (translations: Record<Language, string>) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

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
