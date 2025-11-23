export type Locale = 'en' | 'es' | 'pt-BR';

export const locales: Locale[] = ['en', 'es', 'pt-BR'];

export const defaultLocale: Locale = 'es';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  'pt-BR': 'Português',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  'pt-BR': '🇧🇷',
};
