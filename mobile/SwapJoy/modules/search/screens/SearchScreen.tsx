import React, { useLayoutEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SJText from '../../../components/SJText';
import { RootStackParamList } from '../../../types/navigation';
import { NavigationProp } from '@react-navigation/native';
import { useSearch } from '../hooks/useSearch';
import { colors } from '../../../navigation/MainTabNavigator.styles';
import { useLocalization } from '../../../localization';

interface SearchRowItem {
  id: string;
  type: 'recent' | 'category';
  label: string;
  icon?: string;
}

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput | null>(null);
  const {
    searchText,
    setSearchText,
    normalizedSearchText,
    filteredCategories,
    categoriesLoading,
    recentSearches,
    loadingRecent,
    saveRecentSearch,
    clearRecentSearches,
  } = useSearch();

  const submitQuery = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }
    await saveRecentSearch(trimmed);
    navigation.navigate('SearchResults', { query: trimmed });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });

    const timeoutId = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timeoutId);
  }, [navigation]);

  const sections = useMemo(() => {
    const computedSections: Array<{ title: string; data: SearchRowItem[] }> = [];

    const recentItems: SearchRowItem[] = recentSearches.map((item) => ({
      id: item.id,
      type: 'recent',
      label: item.query,
    }));

    if (recentItems.length > 0) {
      computedSections.push({
        title: t('search.recentSearches'),
        data: recentItems,
      });
    }

    computedSections.push({
      title: t('search.categories'),
      data: filteredCategories.map((category) => ({
        id: category.id,
        type: 'category',
        label: category.name,
        icon: category.icon || '📦',
      })),
    });

    return computedSections;
  }, [filteredCategories, recentSearches, t]);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search-outline" size={18} color="#6f6f6f" />
          <TextInput
            ref={inputRef}
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
            placeholder={t('search.searchPrompt')}
            placeholderTextColor="#7c7c7c"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={() => {
              void submitQuery(searchText);
            }}
          />
        </View>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <SJText style={styles.sectionTitle}>{section.title}</SJText>
            {section.title === t('search.recentSearches') && recentSearches.length > 0 ? (
              <TouchableOpacity onPress={() => void clearRecentSearches()}>
                <SJText style={styles.clearAll}>{t('search.clearAll')}</SJText>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        renderItem={({ item }) => {
          if (item.type === 'recent') {
            return (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.8}
                onPress={() => {
                  void submitQuery(item.label);
                }}
              >
                <Ionicons name="search-outline" size={18} color="#8e8e8e" style={{ marginRight: 12 }}/>
                <SJText style={styles.rowText}>{item.label}</SJText>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.8}
              onPress={() => {
                navigation.navigate('SearchResults', {
                  query: normalizedSearchText || undefined,
                  categoryId: item.id,
                  categoryName: item.label,
                });
              }}
            >
              <SJText style={styles.emoji}>{item.icon}</SJText>
              <SJText style={styles.rowText}>{item.label}</SJText>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          loadingRecent || categoriesLoading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={colors.primaryYellow} />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: colors.primaryDark,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  searchInputWrapper: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2b2b2b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#fff',
    fontSize: 19,
  },
  listContent: {
    paddingBottom: 28,
  },
  sectionHeader: {
    minHeight: 42,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionTitle: {
    color: '#f1f1f1',
    fontSize: 16,
    fontWeight: '700',
  },
  clearAll: {
    color: colors.border,
    fontSize: 16,
  },
  row: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
    marginRight: 12,
  },
  rowText: {
    fontSize: 18,
    color: '#fff',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2f2f2f',
    marginLeft: 16,
  },
  loaderWrap: {
    paddingVertical: 12,
  },
});

export default SearchScreen;

