import { AppLanguage } from '../types/language';

const cleanValue = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const resolveFromCategoryObject = (category: any, language: AppLanguage): string | undefined => {
  if (!category || typeof category !== 'object') {
    return undefined;
  }

  const fallbackLanguage: AppLanguage = language === 'ka' ? 'en' : 'ka';

  return (
    cleanValue(category[`title_${language}`]) ||
    cleanValue(category[`name_${language}`]) ||
    cleanValue(category.title) ||
    cleanValue(category.name) ||
    cleanValue(category[`title_${fallbackLanguage}`]) ||
    cleanValue(category[`name_${fallbackLanguage}`])
  );
};

const resolveFromMixedValue = (value: any, language: AppLanguage): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return undefined;
    }

    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return resolveFromMixedValue(parsed, language);
      } catch {
        // fall through to plain string handling
      }
    }

    if (trimmed.includes(',')) {
      const segments = trimmed.split(',').map((segment) => segment.trim()).filter(Boolean);
      if (segments.length > 0) {
        return segments[0];
      }
    }

    return trimmed;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const resolved = resolveFromMixedValue(entry, language);
      if (resolved) {
        return resolved;
      }
    }
    return undefined;
  }

  return resolveFromCategoryObject(value, language);
};

export const resolveCategoryName = (item: any, language: AppLanguage): string | undefined => {
  if (!item) {
    return undefined;
  }

  const candidates: Array<string | undefined> = [];

  candidates.push(resolveFromMixedValue(item.category, language));
  candidates.push(resolveFromMixedValue(item.primary_category, language));
  candidates.push(resolveFromMixedValue(item.main_category, language));
  candidates.push(resolveFromMixedValue(item.categories, language));
  candidates.push(resolveFromMixedValue(item.category_details, language));
  candidates.push(resolveFromMixedValue(item.category_info, language));

  candidates.push(cleanValue(item[`category_title_${language}`]));
  candidates.push(cleanValue(item[`category_name_${language}`]));
  candidates.push(cleanValue(item[`category_${language}`]));
  candidates.push(cleanValue(item.category_title_en));
  candidates.push(cleanValue(item.category_title_ka));
  candidates.push(cleanValue(item.category_name_en));
  candidates.push(cleanValue(item.category_name_ka));
  candidates.push(cleanValue(item.category_label_en));
  candidates.push(cleanValue(item.category_label_ka));

  candidates.push(cleanValue(item.category_title));
  candidates.push(cleanValue(item.category_name));
  candidates.push(cleanValue(item.category_label));
  candidates.push(cleanValue(item.category));

  for (const candidate of candidates) {
    if (candidate) {
      return candidate;
    }
  }

  return undefined;
};
