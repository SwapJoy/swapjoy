import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SJText from '../SJText';
import SWInputField from '../SWInputField';
import CategoryChip from '../CategoryChip';
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
      <SWInputField
        placeholder={t('search.categories', { defaultValue: 'Search categories...' })}
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftButton={
          <Ionicons name="search" size={18} color={colors.primaryYellow} />
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.chipsContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          return (
            <CategoryChip
              key={category.id}
              name={category.name}
              selected={isSelected}
              onPress={() => onSelectCategory(category.id)}
            />
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
  scrollView: {
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
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
