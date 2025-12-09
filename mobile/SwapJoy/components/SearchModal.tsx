import React, { useCallback, useEffect, useRef } from 'react';
import {View, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity} from 'react-native';
import SJText from '../components/SJText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ItemCardCollection from './ItemCardCollection';
import type { AppLanguage } from '../types/language';
import { useRecentSearches } from '../hooks/useRecentSearches';
import type { useExploreScreenState } from '../hooks/useExploreScreenState';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchStrings: ReturnType<typeof useExploreScreenState>['searchStrings'];
  strings: ReturnType<typeof useExploreScreenState>['strings'];
  t: ReturnType<typeof useExploreScreenState>['t'];
  language: string;
  searchResults: any[];
  searchLoading: boolean;
  searchError: string | null;
  hasSearchQuery: boolean;
  onClearSearch: () => void;
  onItemPress: (item: any) => void;
  renderFavoriteButton: (item: any) => React.ReactNode;
  resolveSimilarityLabel: (item: any) => string | null;
}

const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  searchQuery,
  setSearchQuery,
  searchStrings,
  strings,
  t,
  language,
  searchResults,
  searchLoading,
  searchError,
  hasSearchQuery,
  onClearSearch,
  onItemPress,
  renderFavoriteButton,
  resolveSimilarityLabel,
}) => {
  const inputRef = useRef<TextInput | null>(null);
  const { recentSearches, loadingRecent, saveRecentSearch, clearRecentSearches } = useRecentSearches();
  const insets = useSafeAreaInsets();

  const handleSubmit = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) {
        return;
      }
      await saveRecentSearch(trimmed);
      setSearchQuery(trimmed);
    },
    [saveRecentSearch, setSearchQuery]
  );

  const handleRecentPress = useCallback(
    async (query: string) => {
      await saveRecentSearch(query);
      setSearchQuery(query);
    },
    [saveRecentSearch, setSearchQuery]
  );

  const handleCancel = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      // Persist the last query even if user didn't press the Search key
      void saveRecentSearch(trimmed);
    }
    onClearSearch();
    onClose();
  }, [onClearSearch, onClose, saveRecentSearch, searchQuery]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [visible]);

  const searchResultsNode =
    hasSearchQuery || searchLoading || searchError ? (
      <View style={styles.searchResultsContainer}>
        {!searchLoading && hasSearchQuery && searchResults.length === 0 ? (
          <View style={styles.searchStatusContainer}>
            <SJText style={styles.searchStatusTitle}>{searchStrings.noResultsTitle}</SJText>
            <SJText style={styles.searchStatusSubtitle}>{searchStrings.noResultsSubtitle}</SJText>
          </View>
        ) : (
          <ItemCardCollection
            items={searchResults}
            t={t}
            language={language as AppLanguage}
            onItemPress={onItemPress}
            favoriteButtonRenderer={renderFavoriteButton}
            metaRightResolver={resolveSimilarityLabel}
            placeholderLabel={searchStrings.noImage}
            categoryFallback={strings.labels.categoryFallback}
            columnSpacing={16}
            rowSpacing={18}
            scrollEnabled
            showsVerticalScrollIndicator
            contentContainerStyle={styles.searchResultsContent}
            flatListProps={{
              removeClippedSubviews: false,
            }}
          />
        )}
        {searchError ? <SJText style={styles.searchErrorText}>{searchError}</SJText> : null}
      </View>
    ) : null;

  const showRecent = !hasSearchQuery && !searchLoading && recentSearches.length > 0;

  if (!visible) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.overlayContainer]}>
      <View style={[styles.searchModalSafeArea, { paddingTop: insets.top }]}>
        <View style={styles.searchModalHeader}>
          <View style={styles.searchModalInputWrapper}>
            <Ionicons name="search-outline" size={18} color="#64748b" />
            <TextInput
              ref={inputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchModalInput}
              placeholder={strings.hero.searchPlaceholder || searchStrings.placeholder}
              placeholderTextColor="#94a3b8"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={() => handleSubmit(searchQuery)}
            />
            {searchLoading && (
              <ActivityIndicator size="small" color="#0ea5e9" style={styles.navSearchSpinner} />
            )}
            {!!searchQuery && !searchLoading ? (
              <TouchableOpacity
                onPress={onClearSearch}
                style={styles.navSearchClearButton}
                accessibilityLabel={t('common.clear', { defaultValue: 'Clear search' })}
              >
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity style={styles.searchModalCancelButton} onPress={handleCancel}>
            <SJText style={styles.searchModalCancelText}>
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </SJText>
          </TouchableOpacity>
        </View>

        {showRecent && (
          <View style={styles.recentSearchesContainer}>
            <View style={styles.recentSearchesHeader}>
              <SJText style={styles.recentSearchesTitle}>
                {t('search.recentTitle', { defaultValue: 'Recent searches' })}
              </SJText>
              {!loadingRecent && recentSearches.length > 0 && (
                <TouchableOpacity onPress={clearRecentSearches}>
                  <SJText style={styles.recentSearchesClearText}>
                    {t('search.clearRecent', { defaultValue: 'Clear' })}
                  </SJText>
                </TouchableOpacity>
              )}
            </View>
            {loadingRecent ? (
              <ActivityIndicator size="small" color="#0ea5e9" />
            ) : (
              <View style={styles.recentSearchesList}>
                {recentSearches.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.recentSearchChip}
                    onPress={() => handleRecentPress(item.query)}
                  >
                    <Ionicons name="time-outline" size={14} color="#64748b" />
                    <SJText style={styles.recentSearchChipText}>{item.query}</SJText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {searchResultsNode}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    backgroundColor: '#f8fafc',
    zIndex: 20,
  },
  searchResultsContainer: {
    marginTop: 16,
  },
  searchResultsContent: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchStatusContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  searchStatusSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  searchErrorText: {
    marginTop: 12,
    fontSize: 13,
    color: '#b91c1c',
    textAlign: 'center',
  },
  searchModalSafeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  searchModalInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchModalInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0f172a',
  },
  searchModalCancelButton: {
    marginLeft: 12,
  },
  searchModalCancelText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  navSearchSpinner: {
    marginLeft: 6,
  },
  navSearchClearButton: {
    marginLeft: 6,
  },
  recentSearchesContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recentSearchesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  recentSearchesClearText: {
    fontSize: 13,
    color: '#64748b',
  },
  recentSearchesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  recentSearchChipText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#0f172a',
  },
});

export default SearchModal;


