import { AppLanguage } from '../types/language';
import { capitalizeWords } from './string';
import { colors } from '@navigation/MainTabNavigator.styles';

type ConditionKey = 'mint' | 'new' | 'like_new' | 'excellent' | 'good' | 'fair' | 'poor';

type ConditionStyle = {
  backgroundColor: string;
  textColor: string;
};

const CONDITION_STYLES: Record<ConditionKey, ConditionStyle & { emoji: string }> = {
  mint: { backgroundColor: '#0BDA51', textColor: colors.primaryDark, emoji: '✨' },
  new: { backgroundColor: '#50C878', textColor: colors.primaryDark, emoji: '🆕' },
  like_new: { backgroundColor: '#ADEBB3', textColor: colors.primaryDark, emoji: '🌿' },
  excellent: { backgroundColor: '#B163FF', textColor: colors.primaryDark, emoji: '⭐' },
  good: { backgroundColor: '#FBEC5D', textColor: colors.primaryDark, emoji: '👍' },
  fair: { backgroundColor: '#CCCCFF', textColor: colors.primaryDark, emoji: '⚠️' },
  poor: { backgroundColor: '#FFB5C0', textColor: colors.primaryDark, emoji: '🔧' },
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
