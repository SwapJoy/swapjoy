import { AppLanguage } from '../types/language';
import { capitalizeWords } from './string';

type ConditionKey = 'mint' | 'new' | 'like_new' | 'excellent' | 'good' | 'fair' | 'poor';

type ConditionStyle = {
  backgroundColor: string;
  textColor: string;
};

const CONDITION_STYLES: Record<ConditionKey, ConditionStyle & { emoji: string }> = {
  mint: { backgroundColor: '#0BDA51', textColor: '#fff', emoji: '✨' },
  new: { backgroundColor: '#5CE65C', textColor: '#fff', emoji: '🆕' },
  like_new: { backgroundColor: '#0BDA51', textColor: '#fff', emoji: '🌿' },
  excellent: { backgroundColor: '#B163FF', textColor: '#fff', emoji: '⭐' },
  good: { backgroundColor: '#E4C80A', textColor: '#fff', emoji: '👍' },
  fair: { backgroundColor: '#6D8196', textColor: '#fff', emoji: '⚠️' },
  poor: { backgroundColor: '#FA5053', textColor: '#fff', emoji: '🔧' },
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
  emoji: string;
}

export const getConditionPresentation = ({
  condition,
  language,
  translate,
}: ConditionPresentationOptions): ConditionPresentation | null => {
  const key = normalizeConditionKey(condition ?? undefined);

  const normalizedCondition = (condition ?? '').toString().replace(/_/g, ' ').trim();
  const defaultLabel = capitalizeWords(normalizedCondition);

  if (!key) {
    if (!normalizedCondition) {
      return null;
    }

    return {
      label: defaultLabel || translate('explore.conditions.unknown', { defaultValue: 'Unknown' }),
      backgroundColor: '#e2e8f0',
      textColor: '#0f172a',
      emoji: '❓',
    };
  }

  const label = translate(`explore.conditions.${key}`, { defaultValue: defaultLabel });
  const styling = CONDITION_STYLES[key];

  return {
    label,
    backgroundColor: styling.backgroundColor,
    textColor: styling.textColor,
    emoji: styling.emoji,
  };
};
