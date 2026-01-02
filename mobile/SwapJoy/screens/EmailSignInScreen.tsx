import React, { useState } from 'react';
import {View, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, } from 'react-native';
import SJText from '../components/SJText';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { EmailSignInScreenProps } from '../types/navigation';
import { useLocalization } from '../localization';
import { colors } from '@navigation/MainTabNavigator.styles';
import SWInputField from '../components/SWInputField';

const EmailSignInScreen: React.FC<EmailSignInScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const { t } = useLocalization();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError(t('auth.signIn.errors.missingCredentials'));
      return;
    }

    if (!email.includes('@')) {
      setError(t('auth.signIn.errors.invalidEmail'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithEmail(email.trim(), password);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        // Navigation will be handled by AuthContext/auth state change
      }
    } catch (err: any) {
      setError(err.message || t('auth.signIn.errors.unexpected'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();
      
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        // Navigation will be handled by AuthContext/auth state change
      }
    } catch (err: any) {
      setError(err.message || t('auth.signIn.errors.googleFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSignUpPress = () => {
    navigation.navigate('EmailSignUp');
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Content */}
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <SJText style={styles.subtitle}>{t('auth.signIn.title')}</SJText>
            <SJText style={styles.description}>
              {t('auth.signIn.description')}
            </SJText>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <SJText style={styles.errorText}>{error}</SJText>
            </View>
          )}

          <View style={styles.formSection}>
            {/* Google Sign-In as primary option */}
            <TouchableOpacity
              style={[styles.googleButton, isLoading && styles.disabledButton]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="white" style={styles.googleIcon} />
                  <SJText style={styles.googleButtonText}>{t('auth.common.continueWithGoogle')}</SJText>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <SJText style={styles.dividerText}>{t('auth.common.dividerLabel')}</SJText>
              <View style={styles.dividerLine} />
            </View>

            {/* Email/Password as secondary option */}
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

            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.disabledButton]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <SJText style={styles.signInButtonText}>{t('auth.common.buttons.signInWithEmail')}</SJText>
              )}
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <SJText style={styles.signUpText}>{t('auth.common.links.noAccount')} </SJText>
              <TouchableOpacity onPress={handleSignUpPress}>
                <SJText style={styles.signUpLink}>{t('auth.common.links.signUp')}</SJText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  formSection: {
    width: '100%',
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
  signInButton: {
    backgroundColor: colors.primaryYellow,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  signInButtonText: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#F54927',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    fontSize: 14,
    color: '#666',
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryYellow
  },
});

export default EmailSignInScreen;

