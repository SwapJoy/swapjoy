import { AppLanguage } from '../types/language';
import { capitalizeWords } from './string';

type ConditionKey = 'mint' | 'like_new' | 'excellent' | 'good' | 'fair' | 'poor';

type ConditionStyle = {
  backgroundColor: string;
  textColor: string;
};

const CONDITION_STYLES: Record<ConditionKey, ConditionStyle> = {
  mint: { backgroundColor: '#dcfce7', textColor: '#047857' },
  like_new: { backgroundColor: '#dbeafe', textColor: '#1d4ed8' },
  excellent: { backgroundColor: '#e0f2fe', textColor: '#0369a1' },
  good: { backgroundColor: '#f0f9ff', textColor: '#0c4a6e' },
  fair: { backgroundColor: '#fef3c7', textColor: '#b45309' },
  poor: { backgroundColor: '#fee2e2', textColor: '#b91c1c' },
};

const normalizeConditionKey = (condition?: string): ConditionKey | null => {
  if (!condition) {
    return null;
  }

  const normalized = condition.trim().toLowerCase().replace(/\s+/g, '_');

  if (normalized in CONDITION_STYLES) {
    return normalized as ConditionKey;
  }

  return null;
};

export interface ConditionPresentationOptions {
  condition?: string | null;
  language: AppLanguage;
  translate: (key: string, options?: { defaultValue?: string }) => string;
}

export interface ConditionPresentation {
  label: string;
  backgroundColor: string;
  textColor: string;
}

export const getConditionPresentation = ({
  condition,
  language,
  translate,
}: ConditionPresentationOptions): ConditionPresentation | null => {
  const key = normalizeConditionKey(condition ?? undefined);

  if (!key) {
    return null;
  }

  const defaultLabel = capitalizeWords((condition ?? '').replace(/_/g, ' ').trim());
  const label = translate(`explore.conditions.${key}`, { defaultValue: defaultLabel });

  const styling = CONDITION_STYLES[key];

  return {
    label,
    backgroundColor: styling.backgroundColor,
    textColor: styling.textColor,
  };
};
