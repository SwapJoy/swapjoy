export type AppLanguage = 'en' | 'ka';

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

export const SUPPORTED_LANGUAGES: readonly AppLanguage[] = ['en', 'ka'];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: 'English',
  ka: 'ქართული',
};

