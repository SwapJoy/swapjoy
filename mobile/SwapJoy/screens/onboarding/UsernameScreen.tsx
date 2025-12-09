import React, { useState, useEffect, useCallback } from 'react';
import {View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, } from 'react-native';
import SJText from '../../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../hooks/useOnboarding';
import { ApiService } from '../../services/api';
import { useLocalization } from '../../localization';
import { useAuth } from '../../contexts/AuthContext';

const UsernameScreen: React.FC = () => {
  const { nextStep, previousStep, skipOnboarding, isFirstStep } = useOnboarding();
  const currentStepIndex = 0; // Username is step 1
  const { user } = useAuth();
  const { t } = useLocalization();
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const checkTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const validateUsername = useCallback(async (value: string) => {
    const trimmed = value.trim();
    
    // Clear previous timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // Basic validation
    if (trimmed.length === 0) {
      setIsValid(false);
      setError(null);
      return;
    }

    if (trimmed.length < 3) {
      setIsValid(false);
      setError(t('onboarding.username.errors.tooShort', { defaultValue: 'Username must be at least 3 characters' }));
      return;
    }

    if (trimmed.length > 50) {
      setIsValid(false);
      setError(t('onboarding.username.errors.tooLong', { defaultValue: 'Username must be less than 50 characters' }));
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setIsValid(false);
      setError(t('onboarding.username.errors.invalidChars', { defaultValue: 'Username can only contain letters, numbers, and underscores' }));
      return;
    }

    // Debounce API call
    checkTimeoutRef.current = setTimeout(async () => {
      setIsChecking(true);
      setError(null);
      
      try {
        const { available, error: checkError } = await ApiService.checkUsernameAvailability(trimmed);
        
        if (checkError) {
          setIsValid(false);
          setError(t('onboarding.username.errors.checkFailed', { defaultValue: 'Unable to check username availability' }));
        } else if (available) {
          setIsValid(true);
          setError(null);
          
          // Auto-save when valid
          try {
            setIsSaving(true);
            const { error: saveError } = await ApiService.updateProfile({ username: trimmed });
            if (saveError) {
              console.error('[UsernameScreen] Error saving username:', saveError);
            }
          } catch (saveError) {
            console.error('[UsernameScreen] Error saving username:', saveError);
          } finally {
            setIsSaving(false);
          }
        } else {
          setIsValid(false);
          setError(t('onboarding.username.errors.taken', { defaultValue: 'This username is already taken' }));
        }
      } catch (err) {
        setIsValid(false);
        setError(t('onboarding.username.errors.checkFailed', { defaultValue: 'Unable to check username availability' }));
      } finally {
        setIsChecking(false);
      }
    }, 500);
  }, [t]);

  const handleUsernameChange = useCallback((value: string) => {
    setUsername(value);
    setIsValid(false);
    validateUsername(value);
  }, [validateUsername]);

  // Generate and pre-fill suggested username if user doesn't have one
  useEffect(() => {
    const loadOrGenerateUsername = async () => {
      if (user) {
        try {
          const { data: profile } = await ApiService.getProfile();
          if (profile?.username) {
            // User already has username, pre-fill it
            setUsername(profile.username);
            setIsValid(true);
          } else {
            // Generate a suggested username based on email or user ID
            let suggestedUsername = '';
            if (user.email) {
              // Use email prefix as suggestion
              suggestedUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
              // Ensure it's at least 3 characters
              if (suggestedUsername.length < 3) {
                suggestedUsername = `user_${suggestedUsername}`;
              }
            } else {
              // Generate from user ID
              suggestedUsername = `user_${user.id.substring(0, 8)}`;
            }
            setUsername(suggestedUsername);
            // Trigger validation for the suggested username
            handleUsernameChange(suggestedUsername);
          }
        } catch (error) {
          console.error('[UsernameScreen] Error loading profile:', error);
          // Still generate a suggestion even if profile load fails
          const suggestedUsername = user.email 
            ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')
            : `user_${user.id.substring(0, 8)}`;
          setUsername(suggestedUsername);
          handleUsernameChange(suggestedUsername);
        }
      }
    };
    loadOrGenerateUsername();
  }, [user, handleUsernameChange]);

  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  const handleNext = () => {
    if (isValid && username.trim()) {
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
              <SJText style={styles.stepIndicator}>Step {currentStepIndex + 1} of 6</SJText>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <SJText style={styles.title}>
              {t('onboarding.username.title', { defaultValue: 'Choose Your Username' })}
            </SJText>
            <SJText style={styles.description}>
              {t('onboarding.username.description', { defaultValue: 'Pick a unique username that others will see when you swap items.' })}
            </SJText>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder={t('onboarding.username.placeholder', { defaultValue: 'username' })}
                placeholderTextColor="#999"
                value={username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={50}
              />
              {isChecking && (
                <ActivityIndicator size="small" color="#007AFF" style={styles.checkingIndicator} />
              )}
              {isValid && !isChecking && (
                <Ionicons name="checkmark-circle" size={24} color="#34C759" style={styles.validIndicator} />
              )}
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                <SJText style={styles.errorText}>{error}</SJText>
              </View>
            )}

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
            style={[styles.nextButton, (!isValid || isChecking) && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!isValid || isChecking}
          >
            <SJText style={[styles.nextButtonText, (!isValid || isChecking) && styles.nextButtonTextDisabled]}>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 14,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  checkingIndicator: {
    marginLeft: 8,
  },
  validIndicator: {
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 6,
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  nextButtonTextDisabled: {
    color: '#8E8E93',
  },
});

export default UsernameScreen;

