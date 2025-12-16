import React, { useState, useEffect } from 'react';
import {View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, } from 'react-native';
import SJText from '../../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../hooks/useOnboarding';
import { ApiService } from '../../services/api';
import { useLocalization } from '../../localization';
import { useAuth } from '../../contexts/AuthContext';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const GenderScreen: React.FC = () => {
  const { nextStep, previousStep, skipOnboarding, isFirstStep } = useOnboarding();
  const currentStepIndex = 3; // Gender is step 4
  const { user } = useAuth();
  const { t } = useLocalization();
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing gender if available
  useEffect(() => {
    const loadGender = async () => {
      if (user) {
        try {
          const { data: profile } = await ApiService.getProfile();
          if (profile?.gender) {
            setSelectedGender(profile.gender);
          }
        } catch (error) {
          console.error('[GenderScreen] Error loading gender:', error);
        }
      }
    };
    loadGender();
  }, [user]);

  const handleGenderSelect = async (gender: string) => {
    setSelectedGender(gender);
    
    // Save immediately
    setIsSaving(true);
    try {
      await ApiService.updateProfile({ gender });
    } catch (error) {
      console.error('[GenderScreen] Error saving gender:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    nextStep();
  };

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
              {t('onboarding.gender.title', { defaultValue: 'What\'s Your Gender?' })}
            </SJText>
            <SJText style={styles.description}>
              {t('onboarding.gender.description', { defaultValue: 'This helps us personalize your experience.' })}
            </SJText>

            <View style={styles.optionsContainer}>
              {GENDER_OPTIONS.map((option) => {
                const isSelected = selectedGender === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                    onPress={() => handleGenderSelect(option.value)}
                  >
                    <View style={styles.optionContent}>
                      <SJText style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {t(`onboarding.gender.options.${option.value}`, { defaultValue: option.label })}
                      </SJText>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
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
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8F8F8',
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
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

export default GenderScreen;

