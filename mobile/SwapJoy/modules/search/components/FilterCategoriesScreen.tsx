import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import SJText from '../../../components/SJText';
import { Category } from '../../../contexts/CategoriesContext';
import { colors } from '@navigation/MainTabNavigator.styles';

interface FilterCategoriesScreenProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const FilterCategoriesScreen: React.FC<FilterCategoriesScreenProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const rows = [{ id: 'any', name: 'Any', icon: '' }, ...categories.map((category) => ({
    id: category.id,
    name: category.name,
    icon: category.icon || '📦',
  }))];

  return (
    <FlatList
      data={rows}
      style={styles.list}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const isAny = item.id === 'any';
        const isSelected = isAny ? !selectedCategoryId : selectedCategoryId === item.id;
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.row}
            onPress={() => onSelectCategory(isAny ? null : item.id)}
          >
            <View style={styles.leftContent}>
              {!isAny ? <SJText style={styles.icon}>{item.icon}</SJText> : null}
              <SJText style={styles.label}>{item.name}</SJText>
            </View>
            <View style={[styles.radio, isSelected && styles.radioSelected]} />
          </TouchableOpacity>
        );
      }}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingBottom: 96,
  },
  row: {
    minHeight: 54,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  label: {
    fontSize: 18,
    color: colors.textColor,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#8b8b8b',
  },
  radioSelected: {
    borderColor: colors.primaryYellow,
    backgroundColor: colors.primaryYellow,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#303030',
  },
});

export default FilterCategoriesScreen;

