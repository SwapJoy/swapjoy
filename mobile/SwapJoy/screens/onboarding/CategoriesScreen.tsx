import React, { useState, useEffect } from 'react';
import {View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, } from 'react-native';
import SJText from '../../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../hooks/useOnboarding';
import { ApiService } from '../../services/api';
import { useLocalization } from '../../localization';
import { useAuth } from '../../contexts/AuthContext';
import type { Category } from '../../types/item';

const CategoriesScreen: React.FC = () => {
  const { nextStep, previousStep, skipOnboarding, isFirstStep } = useOnboarding();
  const currentStepIndex = 4; // Categories is step 5
  const { user } = useAuth();
  const { t, language } = useLocalization();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load categories and existing favorites
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load categories
        const { data: categoriesData, error } = await ApiService.getCategories(language as any);
        if (error) {
          console.error('[CategoriesScreen] Error loading categories:', error);
        } else if (categoriesData) {
          setCategories(categoriesData);
        }

        // Load existing favorite categories
        if (user) {
          const { data: profile } = await ApiService.getProfile();
          if (profile?.favorite_categories && Array.isArray(profile.favorite_categories)) {
            setSelectedCategories(profile.favorite_categories);
          }
        }
      } catch (error) {
        console.error('[CategoriesScreen] Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, language]);

  const handleCategoryToggle = async (categoryId: string) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newSelection);
    
    // Save immediately
    setIsSaving(true);
    try {
      await ApiService.updateProfile({ favorite_categories: newSelection });
    } catch (error) {
      console.error('[CategoriesScreen] Error saving categories:', error);
      // Revert on error
      setSelectedCategories(selectedCategories);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    nextStep();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <SJText style={styles.loadingText}>
            {t('onboarding.common.loading', { defaultValue: 'Loading...' })}
          </SJText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            {!isFirstStep && (
              <TouchableOpacity onPress={previousStep} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
            )}
            <View style={styles.headerContent}>
              <SJText style={styles.stepIndicator}>Step {currentStepIndex + 1} of 6</SJText>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <SJText style={styles.title}>
              {t('onboarding.categories.title', { defaultValue: 'Choose Your Interests' })}
            </SJText>
            <SJText style={styles.description}>
              {t('onboarding.categories.description', { defaultValue: 'Select categories you\'re interested in. You can change this later.' })}
            </SJText>

            <View style={styles.categoriesContainer}>
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
                    onPress={() => handleCategoryToggle(category.id)}
                  >
                    <SJText style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                      {category.name}
                    </SJText>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#007AFF" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {isSaving && (
              <View style={styles.savingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <SJText style={styles.savingText}>
                  {t('onboarding.common.saving', { defaultValue: 'Saving...' })}
                </SJText>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipOnboarding}
          >
            <SJText style={styles.skipButtonText}>
              {t('onboarding.common.skip', { defaultValue: 'Skip' })}
            </SJText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <SJText style={styles.nextButtonText}>
              {t('onboarding.common.next', { defaultValue: 'Next' })}
            </SJText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161200',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
    marginBottom: 8,
  },
  categoryButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  categoryText: {
    fontSize: 16,
    color: '#000',
  },
  categoryTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
  checkIcon: {
    marginLeft: 8,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  savingText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#161200',
  },
});

export default CategoriesScreen;

