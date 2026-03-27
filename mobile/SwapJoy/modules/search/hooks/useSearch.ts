import { useMemo, useState } from 'react';
import { useCategories } from '../../../hooks/useCategories';
import { useRecentSearches } from '../../../hooks/useRecentSearches';

export const useSearch = () => {
  const [searchText, setSearchText] = useState('');
  const { categories, loading: categoriesLoading } = useCategories();
  const {
    recentSearches,
    loadingRecent,
    saveRecentSearch,
    clearRecentSearches,
  } = useRecentSearches();

  const normalizedSearchText = searchText.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedSearchText) {
      return categories;
    }

    return categories.filter((category) => {
      const localizedName = String(category.name ?? '').toLowerCase();
      const englishName = String(category.title_en ?? '').toLowerCase();
      const georgianName = String(category.title_ka ?? '').toLowerCase();
      return (
        localizedName.includes(normalizedSearchText) ||
        englishName.includes(normalizedSearchText) ||
        georgianName.includes(normalizedSearchText)
      );
    });
  }, [categories, normalizedSearchText]);

  return {
    searchText,
    setSearchText,
    normalizedSearchText,
    filteredCategories,
    categoriesLoading,
    recentSearches,
    loadingRecent,
    saveRecentSearch,
    clearRecentSearches,
  };
};

