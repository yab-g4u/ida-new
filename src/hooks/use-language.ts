'use client';

import { useContext } from 'react';
import { LanguageContext, type LanguageContextType } from '@/contexts/language-provider';

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
