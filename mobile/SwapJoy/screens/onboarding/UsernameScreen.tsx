import React, { useState, useEffect, useCallback } from 'react';
import {View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, } from 'react-native';
import { colors } from '@navigation/MainTabNavigator.styles';
import SJText from '../../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../hooks/useOnboarding';
import { ApiService } from '../../services/api';
import { useLocalization } from '../../localization';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from '../../contexts/ProfileContext';
import SWInputField from '@components/SWInputField';
import { useNavigation } from '@react-navigation/native';

const UsernameScreen: React.FC = () => {
  const { nextStep, previousStep, skipOnboarding, isFirstStep, currentStepIndex, totalSteps } = useOnboarding();
  const { user, isAuthenticated, signOut } = useAuth();
  const navigation = useNavigation<any>();
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
          const { data: profile, error } = await ApiService.getProfile();
          
          // Check for auth errors (403, 401, etc.)
          if (error) {
            const errorMessage = error.message || String(error) || '';
            const errorStatus = (error as any)?.status || (error as any)?.code;
            const isAuthError = 
              errorStatus === 403 || 
              errorStatus === 401 ||
              errorMessage.includes('Not authenticated') || 
              errorMessage.includes('Forbidden') ||
              errorMessage.includes('403') ||
              errorMessage.includes('unauthorized') ||
              errorMessage.includes('session') ||
              errorMessage.includes('jwt') ||
              errorMessage.includes('token');
            
            if (isAuthError) {
              console.log('[UsernameScreen] Auth error detected when loading profile, signing out');
              await signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
              return;
            }
          }
          
          const typedProfile = profile as UserProfile | null;
          if (typedProfile?.username) {
            // User already has username, pre-fill it
            setUsername(typedProfile.username);
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
          // Still generate a suggestion even if profile load fails (non-auth errors)
          const suggestedUsername = user.email 
            ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')
            : `user_${user.id.substring(0, 8)}`;
          setUsername(suggestedUsername);
          handleUsernameChange(suggestedUsername);
        }
      }
    };
    loadOrGenerateUsername();
  }, [user, handleUsernameChange, signOut, navigation]);

  // Redirect to unauthenticated flow if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('[UsernameScreen] User not authenticated, redirecting to MainTabs');
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  }, [isAuthenticated, user, navigation]);

  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  const handleNext = async () => {
    if (!isValid || !username.trim() || isSaving) {
      return;
    }

    const trimmed = username.trim();
    setIsSaving(true);
    setError(null);

    try {
      const { error: saveError } = await ApiService.updateProfile({ username: trimmed });
      
      if (saveError) {
        console.error('[UsernameScreen] Error saving username:', saveError);
        
        // Check for auth errors (403, 401, etc.)
        const errorMessage = saveError.message || String(saveError) || '';
        const errorStatus = (saveError as any)?.status || (saveError as any)?.code;
        const isAuthError = 
          errorStatus === 403 || 
          errorStatus === 401 ||
          errorMessage.includes('Not authenticated') || 
          errorMessage.includes('Forbidden') ||
          errorMessage.includes('403') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('session') ||
          errorMessage.includes('jwt') ||
          errorMessage.includes('token');
        
        if (isAuthError) {
          console.log('[UsernameScreen] Auth error detected when saving username, signing out');
          await signOut();
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
          return;
        }
        
        setError(t('onboarding.username.errors.saveFailed', { defaultValue: 'Failed to save username. Please try again.' }));
        setIsSaving(false);
        return;
      }

      // Successfully saved, proceed to next step
      setIsSaving(false);
      nextStep();
    } catch (saveError) {
      console.error('[UsernameScreen] Error saving username:', saveError);
      
      // Check for auth errors in catch block too
      const errorMessage = (saveError as any)?.message || String(saveError) || '';
      const isAuthError = 
        errorMessage.includes('Not authenticated') || 
        errorMessage.includes('Forbidden') ||
        errorMessage.includes('403') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('session') ||
        errorMessage.includes('jwt') ||
        errorMessage.includes('token');
      
      if (isAuthError) {
        console.log('[UsernameScreen] Auth error detected in catch block, signing out');
        await signOut();
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
        return;
      }
      
      setError(t('onboarding.username.errors.saveFailed', { defaultValue: 'Failed to save username. Please try again.' }));
      setIsSaving(false);
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
          {/* Content */}
          <View style={styles.content}>
            <SJText style={styles.title}>
              {t('onboarding.username.title', { defaultValue: 'Choose Your Username' })}
            </SJText>
            <SJText style={styles.description}>
              {t('onboarding.username.description', { defaultValue: 'Pick a unique username that others will see when you swap items.' })}
            </SJText>

            <SWInputField
              placeholder={t('onboarding.username.placeholder', { defaultValue: 'username' })}
              value={username}
              onChangeText={handleUsernameChange}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={50}
              rightButton={
                isChecking ? (
                  <ActivityIndicator size="small" color={colors.primaryYellow} />
                ) : isValid && !isChecking ? (
                  <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                ) : undefined
              }
            />

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                <SJText style={styles.errorText}>{error}</SJText>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, (!isValid || isChecking || isSaving) && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!isValid || isChecking || isSaving}
          >
            {isSaving ? (
              <View style={styles.nextButtonContent}>
                <ActivityIndicator size="small" color={colors.primaryDark} style={styles.nextButtonLoader} />
                <SJText style={styles.nextButtonText}>
                  {t('onboarding.common.saving', { defaultValue: 'Saving...' })}
                </SJText>
              </View>
            ) : (
              <SJText style={[styles.nextButtonText, (!isValid || isChecking) && styles.nextButtonTextDisabled]}>
                {t('onboarding.common.next', { defaultValue: 'Next' })}
              </SJText>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
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
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
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
  },
  nextButton: {
    backgroundColor: colors.primaryYellow,
    borderRadius: 30,
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
    color: colors.primaryDark,
  },
  nextButtonTextDisabled: {
    color: '#8E8E93',
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonLoader: {
    marginRight: 8,
  },
});

export default UsernameScreen;

