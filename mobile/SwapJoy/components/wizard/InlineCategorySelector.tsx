import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import SJText from '../SJText';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '../../hooks/useCategories';
import { colors } from '@navigation/MainTabNavigator.styles';

interface InlineCategorySelectorProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const InlineCategorySelector: React.FC<InlineCategorySelectorProps> = ({
  selectedCategoryId,
  onSelectCategory,
  t,
}) => {
  const { categories, loading } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }
    const query = searchQuery.toLowerCase().trim();
    return categories.filter((cat) => cat.name.toLowerCase().includes(query));
  }, [categories, searchQuery]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <SJText style={styles.loadingText}>
          {t('common.loading', { defaultValue: 'Loading...' })}
        </SJText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('search.categories', { defaultValue: 'Search categories...' })}
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.chipsContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              onPress={() => onSelectCategory(category.id)}
            >
              {category.icon && <SJText style={styles.categoryIcon}>{category.icon}</SJText>}
              <SJText style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                {category.name}
              </SJText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#0ea5e9',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#0f172a',
  },
  categoryChipTextSelected: {
    color: '#0ea5e9',
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
});

export default InlineCategorySelector;
