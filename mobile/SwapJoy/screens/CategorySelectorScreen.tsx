import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryTreeNode } from '../hooks/useCategories';
import { useCategorySelector } from '../hooks/useCategorySelector';
import { useLocalization } from '../localization';
import { CategorySelectorScreenProps } from '../types/navigation';
import { UserService } from '../services/userService';

interface CategorySelectorScreenParams {
  multiselect?: boolean;
  selectedCategories?: string[];
  updateProfile?: boolean;
}

const CategorySelectorScreen: React.FC<CategorySelectorScreenProps> = ({ route, navigation }) => {
  const { t } = useLocalization();
  const params = (route.params as CategorySelectorScreenParams) || {};
  const multiselect = params.multiselect ?? true;
  const initialSelected = params.selectedCategories || [];
  const updateProfile = params.updateProfile ?? true;

  const {
    rootCategories,
    selectedCategoryIds,
    loading,
    toggleCategory,
    getCategoryChildren,
    isCategorySelected,
    isCategoryExpanded,
    isCategoryLeaf,
    hasSelectedDescendants,
    getSelectedDescendantsCount,
    selectedCount,
  } = useCategorySelector({
    multiselect,
    initialSelected,
  });

  const handleDone = useCallback(async () => {
    if (updateProfile) {
      try {
        const payload = selectedCategoryIds.length > 0 ? selectedCategoryIds : null;
        const { error } = await UserService.updateProfile({
          favorite_categories: payload,
        });
        if (error) {
          throw new Error(error.message || 'Failed to update categories');
        }
      } catch (error: any) {
        console.error('[CategorySelector] Error updating profile:', error);
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          error?.message ||
            t('settings.profile.favoriteCategoriesErrorMessage', {
              defaultValue: 'Could not update favorite categories. Please try again.',
            })
        );
        return;
      }
    }
    navigation.goBack();
  }, [selectedCategoryIds, updateProfile, navigation, t]);

  const renderCategoryItem = useCallback(
    (category: CategoryTreeNode, level: number = 0): React.ReactNode => {
      const isLeaf = isCategoryLeaf(category.id);
      const isSelected = isCategorySelected(category.id);
      const isExpanded = isCategoryExpanded(category.id);
      const hasSelectedChildren = hasSelectedDescendants(category.id);
      const children = getCategoryChildren(category.id);
      const isRoot = level === 0;

      return (
        <View key={category.id}>
          <TouchableOpacity
            style={[
              styles.categoryItem,
              { paddingLeft: 20 + level * 20 },
              isSelected && styles.categoryItemSelected,
              isRoot && hasSelectedChildren && !isSelected && styles.categoryItemHasSelectedChildren,
            ]}
            onPress={() => toggleCategory(category)}
            activeOpacity={0.7}
          >
            <View style={styles.categoryItemLeft}>
              {!isLeaf && (
                <View style={styles.expandIcon}>
                  <Ionicons
                    name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                    size={16}
                    color={isExpanded ? '#2563eb' : '#9ca3af'}
                  />
                </View>
              )}
              <Text
                style={[
                  styles.categoryName,
                  isSelected && styles.categoryNameSelected,
                  isRoot && hasSelectedChildren && !isSelected && styles.categoryNameHasSelectedChildren,
                ]}
                numberOfLines={1}
              >
                {category.name}
              </Text>
            </View>
            {isLeaf && (
              <View style={styles.checkboxWrapper}>
                {isSelected ? (
                  <View style={styles.checkboxChecked}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                ) : (
                  <View style={styles.checkboxUnchecked} />
                )}
              </View>
            )}
            {!isLeaf && (
              <View style={styles.categoryItemRight}>
                {hasSelectedChildren && !isSelected && (
                  <View style={styles.selectionBadge}>
                    <Text style={styles.selectionBadgeText}>
                      {getSelectedDescendantsCount(category.id)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
          {!isLeaf && isExpanded && children.length > 0 && (
            <View style={styles.childrenWrapper}>
              {children.map((child) => renderCategoryItem(child, level + 1))}
            </View>
          )}
        </View>
      );
    },
    [
      isCategorySelected,
      isCategoryExpanded,
      isCategoryLeaf,
      hasSelectedDescendants,
      getSelectedDescendantsCount,
      getCategoryChildren,
      toggleCategory,
    ]
  );

  return (
    <View style={styles.container}>
  
      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : rootCategories.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="list-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyText}>
            {t('common.empty', { defaultValue: 'No categories available' })}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {rootCategories.map((category) => renderCategoryItem(category))}
        </ScrollView>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        {multiselect && selectedCount > 0 && (
          <Text style={styles.footerText}>
            {selectedCount}{' '}
            {selectedCount === 1
              ? t('common.selected', { defaultValue: 'selected' })
              : t('common.selectedPlural', { defaultValue: 'selected' })}
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.doneButton,
            selectedCount > 0 && styles.doneButtonActive,
            selectedCount === 0 && styles.doneButtonDisabled,
          ]}
          onPress={handleDone}
          activeOpacity={0.8}
          disabled={selectedCount === 0 && !multiselect}
        >
          <Text
            style={[
              styles.doneButtonText,
              selectedCount === 0 && styles.doneButtonTextDisabled,
            ]}
          >
            {t('common.done', { defaultValue: 'Done' })}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingRight: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  categoryItemSelected: {
    backgroundColor: '#eff6ff',
  },
  categoryItemHasSelectedChildren: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  expandIcon: {
    width: 20,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
  categoryNameSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  categoryNameHasSelectedChildren: {
    color: '#1e40af',
    fontWeight: '600',
  },
  checkboxWrapper: {
    marginLeft: 12,
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  selectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  childCount: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
    minWidth: 24,
    textAlign: 'right',
  },
  childrenWrapper: {
    backgroundColor: '#f9fafb',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  footerText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  doneButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    minWidth: 90,
    alignItems: 'center',
  },
  doneButtonActive: {
    backgroundColor: '#2563eb',
  },
  doneButtonDisabled: {
    opacity: 0.5,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  doneButtonTextDisabled: {
    color: '#9ca3af',
  },
});

export default CategorySelectorScreen;
