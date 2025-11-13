import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoLocalization from 'expo-localization';

import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
} from '../types/language';
import en from './translations/en';
import ka from './translations/ka';

type TranslationValue = string | TranslationDictionary;
type TranslationDictionary = Record<string, TranslationValue>;

type TranslationStore = Record<AppLanguage, TranslationDictionary>;

const translations: TranslationStore = {
  en,
  ka,
};

const STORAGE_KEY = '@swapjoy/language';

interface LocalizationContextValue {
  language: AppLanguage;
  availableLanguages: readonly AppLanguage[];
  isLoading: boolean;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: string, options?: TranslationOptions) => string;
  getLanguageLabel: (language: AppLanguage) => string;
}

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

const isSupportedLanguage = (value: string): value is AppLanguage =>
  SUPPORTED_LANGUAGES.includes(value as AppLanguage);

type TranslationOptions = {
  defaultValue?: string;
  [key: string]: any;
};

const resolveTranslation = (
  dictionary: TranslationDictionary,
  key: string
): TranslationValue | undefined => {
  return key
    .split('.')
    .reduce<TranslationValue | undefined>((current, segment) => {
      if (current === undefined || current === null) {
        return undefined;
      }
      if (typeof current === 'string') {
        return undefined;
      }
      return current[segment];
    }, dictionary);
};

const detectDeviceLanguage = (): AppLanguage => {
  try {
    const locales = ExpoLocalization.getLocales?.() ?? [];
    for (const locale of locales) {
      const code = (locale.languageCode ?? locale.languageTag ?? '').toLowerCase();
      if (!code) {
        continue;
      }
      const baseCode = code.split('-')[0];
      if (isSupportedLanguage(baseCode)) {
        return baseCode as AppLanguage;
      }
      if (isSupportedLanguage(code)) {
        return code as AppLanguage;
      }
    }

    const locale = (ExpoLocalization.locale ?? '').toLowerCase();
    const baseLocale = locale.split('-')[0];
    if (isSupportedLanguage(baseLocale)) {
      return baseLocale as AppLanguage;
    }
    if (isSupportedLanguage(locale)) {
      return locale as AppLanguage;
    }
  } catch (error) {
    console.warn('[Localization] Failed to detect device language', error);
  }

  return DEFAULT_LANGUAGE;
};

const applyInterpolation = (template: string, options?: TranslationOptions): string => {
  if (!options) {
    return template;
  }

  return template.replace(/\{([^}]+)\}/g, (match, rawKey) => {
    if (rawKey === 'defaultValue') {
      return match;
    }
    const value = options[rawKey];
    if (value === null || value === undefined) {
      return match;
    }
    return String(value);
  });
};

export const LocalizationProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && isSupportedLanguage(stored)) {
          if (isMountedRef.current) {
            setLanguageState(stored);
          }
          return;
        }

        const deviceLanguage = detectDeviceLanguage();
        if (isMountedRef.current) {
          setLanguageState(deviceLanguage);
        }
      } catch (error) {
        console.warn('[Localization] Failed to load persisted language', error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initializeLanguage();
  }, []);

  const persistLanguage = useCallback(async (nextLanguage: AppLanguage) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
    } catch (error) {
      console.warn('[Localization] Failed to persist language', error);
    }
  }, []);

  const changeLanguage = useCallback(
    async (nextLanguage: AppLanguage) => {
      if (!isSupportedLanguage(nextLanguage)) {
        console.warn('[Localization] Attempted to set unsupported language', nextLanguage);
        return;
      }

      setLanguageState((current) => {
        if (current === nextLanguage) {
          return current;
        }
        return nextLanguage;
      });

      await persistLanguage(nextLanguage);
    },
    [persistLanguage]
  );

  const translate = useCallback(
    (key: string, options?: TranslationOptions) => {
      const activeDictionary = translations[language];
      const fallbackDictionary = translations[DEFAULT_LANGUAGE];

      const value = resolveTranslation(activeDictionary, key);
      if (typeof value === 'string') {
        return applyInterpolation(value, options);
      }

      const fallbackValue = resolveTranslation(fallbackDictionary, key);
      if (typeof fallbackValue === 'string') {
        return applyInterpolation(fallbackValue, options);
      }

      const fallback = options?.defaultValue ?? key;
      return applyInterpolation(fallback, options);
    },
    [language]
  );

  const getLanguageLabel = useCallback(
    (lang: AppLanguage) => LANGUAGE_LABELS[lang] ?? lang,
    []
  );

  const contextValue = useMemo<LocalizationContextValue>(
    () => ({
      language,
      availableLanguages: SUPPORTED_LANGUAGES,
      isLoading,
      setLanguage: changeLanguage,
      t: translate,
      getLanguageLabel,
    }),
    [changeLanguage, getLanguageLabel, isLoading, language, translate]
  );

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextValue => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

