'use client';

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import ptBR from '@/locales/pt-BR.json';

// Supported languages
export type Locale = 'en' | 'es' | 'pt-BR';

// Translation type (inferred from Spanish translations)
export type Translations = typeof es;

// Translations map
const translations: Record<Locale, Translations> = {
  en,
  es,
  'pt-BR': ptBR,
};

// Context type
type I18nContextType = {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
};

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// LocalStorage key
const LOCALE_STORAGE_KEY = 'meli-trends-locale';

// Detect browser language
const detectBrowserLanguage = (): Locale => {
  if (typeof window === 'undefined') return 'es'; // SSR default

  const browserLang = navigator.language;

  // Direct match
  if (browserLang === 'en' || browserLang === 'es' || browserLang === 'pt-BR') {
    return browserLang;
  }

  // Partial match (e.g., 'en-US' -> 'en', 'pt-BR' -> 'pt-BR', 'es-MX' -> 'es')
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('pt')) return 'pt-BR';
  if (browserLang.startsWith('es')) return 'es';

  // Default to Spanish
  return 'es';
};

// Get initial locale (localStorage > browser > default)
const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'es'; // SSR default

  // Try localStorage first
  const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
  if (savedLocale && (savedLocale === 'en' || savedLocale === 'es' || savedLocale === 'pt-BR')) {
    return savedLocale;
  }

  // Fall back to browser detection
  return detectBrowserLanguage();
};

// Provider component
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Initialize with SSR-safe default (always 'es' on server, detect on client)
    if (typeof window === 'undefined') return 'es';
    return getInitialLocale();
  });

  // Memoize translations object to prevent re-creation
  const t = useMemo(() => translations[locale], [locale]);

  // Memoize setLocale function with localStorage persistence
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
  }, []);

  // Memoize context value
  const value = useMemo(
    () => ({ locale, t, setLocale }),
    [locale, t, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// Custom hook to use i18n
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
