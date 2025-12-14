import React, { useState, useEffect } from 'react';
import {View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, } from 'react-native';
import SJText from '../../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../hooks/useOnboarding';
import { ApiService } from '../../services/api';
import { useLocalization } from '../../localization';
import { useAuth } from '../../contexts/AuthContext';

const NameScreen: React.FC = () => {
  const { nextStep, previousStep, skipOnboarding, isFirstStep, isLastStep, currentStepIndex, totalSteps, completeOnboarding } = useOnboarding();
  const { user } = useAuth();
  const { t } = useLocalization();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing names if available
  useEffect(() => {
    const loadNames = async () => {
      if (user) {
        try {
          const { data: profile } = await ApiService.getProfile();
          if (profile) {
            if (profile.first_name) setFirstName(profile.first_name);
            if (profile.last_name) setLastName(profile.last_name);
          }
        } catch (error) {
          console.error('[NameScreen] Error loading names:', error);
        }
      }
    };
    loadNames();
  }, [user]);

  // Auto-save when names change
  useEffect(() => {
    if (firstName.trim() || lastName.trim()) {
      const saveTimeout = setTimeout(async () => {
        setIsSaving(true);
        try {
          await ApiService.updateProfile({
            first_name: firstName.trim() || undefined,
            last_name: lastName.trim() || undefined,
          });
        } catch (error) {
          console.error('[NameScreen] Error saving names:', error);
        } finally {
          setIsSaving(false);
        }
      }, 500);

      return () => clearTimeout(saveTimeout);
    }
  }, [firstName, lastName]);

  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding();
    } else {
      nextStep();
    }
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            {!isFirstStep && (
              <TouchableOpacity onPress={previousStep} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
            )}
            <View style={styles.headerContent}>
              <SJText style={styles.stepIndicator}>Step {currentStepIndex + 1} of {totalSteps}</SJText>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <SJText style={styles.title}>
              {t('onboarding.name.title', { defaultValue: 'Tell Us Your Name' })}
            </SJText>
            <SJText style={styles.description}>
              {t('onboarding.name.description', { defaultValue: 'Help others recognize you with your first and last name.' })}
            </SJText>

            <View style={styles.inputGroup}>
              <SJText style={styles.label}>
                {t('onboarding.name.firstName', { defaultValue: 'First Name' })}
              </SJText>
              <TextInput
                style={styles.input}
                placeholder={t('onboarding.name.firstNamePlaceholder', { defaultValue: 'Enter your first name' })}
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <SJText style={styles.label}>
                {t('onboarding.name.lastName', { defaultValue: 'Last Name' })}
              </SJText>
              <TextInput
                style={styles.input}
                placeholder={t('onboarding.name.lastNamePlaceholder', { defaultValue: 'Enter your last name' })}
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                maxLength={100}
              />
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
              {isLastStep 
                ? t('onboarding.common.getStarted', { defaultValue: 'Get started' })
                : t('onboarding.common.next', { defaultValue: 'Next' })
              }
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
    backgroundColor: '#fff',
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
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#F8F8F8',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
    color: '#fff',
  },
});

export default NameScreen;

