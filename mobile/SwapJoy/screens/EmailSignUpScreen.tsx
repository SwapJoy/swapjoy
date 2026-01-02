import React from 'react';
import {View, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, } from 'react-native';
import SJText from '../components/SJText';
import { Ionicons } from '@expo/vector-icons';
import { EmailSignUpScreenProps } from '../types/navigation';
import { useLocalization } from '../localization';
import { useEmailSignUp } from '../hooks/useEmailSignUp';
import { colors } from '@navigation/MainTabNavigator.styles';
import SWInputField from '../components/SWInputField';

const EmailSignUpScreen: React.FC<EmailSignUpScreenProps> = ({ navigation }) => {
  const { t } = useLocalization();
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    error,
    setError,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    signUp,
  } = useEmailSignUp();

  const handleSignUp = async () => {
    const result = await signUp();
    
    if (result.success && result.email) {
      // Navigate to email verification screen
      navigation.navigate('EmailVerification', { email: result.email });
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSignInPress = () => {
    navigation.goBack()
  };

  return (
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
            <SJText style={styles.subtitle}>{t('auth.signUp.title')}</SJText>
            <SJText style={styles.description}>
              {t('auth.signUp.description')}
            </SJText>

            {error && (
              <View style={styles.errorContainer}>
                <SJText style={styles.errorText}>{error}</SJText>
              </View>
            )}

            <SWInputField
              placeholder={t('auth.common.emailPlaceholder')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              leftButton={<Ionicons name="mail-outline" size={20} color="#666" />}
            />

            <SWInputField
              placeholder={t('auth.common.passwordPlaceholder')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              leftButton={<Ionicons name="lock-closed-outline" size={20} color="#666" />}
              rightButton={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              }
            />

            <SWInputField
              placeholder={t('auth.common.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError(null);
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              leftButton={<Ionicons name="lock-closed-outline" size={20} color="#666" />}
              rightButton={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.disabledButton]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <SJText style={styles.signUpButtonText}>{t('auth.common.buttons.signUp')}</SJText>
              )}
            </TouchableOpacity>

            <View style={styles.signInContainer}>
            <SJText style={styles.signInText}>{t('auth.common.links.haveAccount')} </SJText>
              <TouchableOpacity onPress={handleSignInPress}>
              <SJText style={styles.signInLink}>{t('auth.common.links.signIn')}</SJText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 30,
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
  },
  signUpButton: {
    backgroundColor: colors.primaryYellow,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  signUpButtonText: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signInText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    color: colors.primaryYellow,
    fontWeight: '600',
  },
});

export default EmailSignUpScreen;

