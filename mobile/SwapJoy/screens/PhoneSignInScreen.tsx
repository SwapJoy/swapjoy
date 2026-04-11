import React, { useState } from 'react';
import {View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, } from 'react-native';
import { colors } from '@navigation/MainTabNavigator.styles';
import SJText from '../components/SJText';
import { Ionicons } from '@expo/vector-icons';
import { usePhoneSignIn } from '../hooks/usePhoneSignIn';
import { useAuth } from '../contexts/AuthContext';
import { PhoneSignInScreenProps } from '../types/navigation';
import { useLocalization } from '../localization';

const PhoneSignInScreen: React.FC<PhoneSignInScreenProps> = ({ navigation }) => {
  const { t } = useLocalization();
  const [phone, setPhone] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { isLoading, handleSendOTP, formatPhoneNumber } = usePhoneSignIn();
  const { signInWithGoogle } = useAuth();

  const handleSendOTPPress = async () => {
    const { success } = await handleSendOTP({ phone });
    
    if (success) {
      const formattedPhone = formatPhoneNumber(phone);
      navigation.navigate('OTPVerification', { phone: formattedPhone });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      console.log('[UI] Google button pressed, calling signInWithGoogle()');
      const result = await signInWithGoogle();
      if (result.error) {
        // Error handling is done in the context
        console.error('Google sign-in error:', result.error);
      }
      // Navigation will be handled by AuthContext/auth state change
    } catch (err: any) {
      console.error('Google sign-in error:', err);
    } finally {
      console.log('[UI] Google sign-in flow finished');
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignInPress = () => {
    navigation.navigate('EmailSignIn');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <SJText style={styles.backButtonText}>{`← ${t('navigation.back')}`}</SJText>
          </TouchableOpacity>
          <SJText style={styles.title}>{t('navigation.signIn')}</SJText>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <SJText style={styles.subtitle}>{t('auth.phone.enterPhoneTitle')}</SJText>
          <SJText style={styles.description}>
            {t('auth.phone.enterPhoneDescription')}
          </SJText>

          <View style={styles.inputContainer}>
            <SJText style={styles.countryCode}>+1</SJText>
            <TextInput
              style={styles.phoneInput}
              placeholder={t('auth.phone.placeholder')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoFocus
              maxLength={20}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.disabledButton]}
            onPress={handleSendOTPPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <SJText style={styles.sendButtonText}>{t('auth.phone.sendCode')}</SJText>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <SJText style={styles.dividerText}>{t('auth.common.dividerLabel')}</SJText>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.emailButton, isLoading && styles.disabledButton]}
            onPress={handleEmailSignInPress}
            disabled={isLoading}
          >
            <Ionicons name="mail-outline" size={20} color="#007AFF" style={styles.emailIcon} />
            <SJText style={styles.emailButtonText}>{t('auth.phone.signInWithEmail')}</SJText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.googleButton, (isLoading || isGoogleLoading) && styles.disabledButton]}
            onPress={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color={colors.backgroundColor} style={styles.googleIcon} />
                <SJText style={styles.googleButtonText}>{t('auth.common.continueWithGoogle')}</SJText>
              </>
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
    backgroundColor: colors.backgroundColor,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.textSemiDark,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: colors.textSemiDark,
    lineHeight: 22,
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 30,
    backgroundColor: '#f9f9f9',
  },
  countryCode: {
    fontSize: 18,
    color: colors.textDark,
    fontWeight: '500',
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    color: colors.textDark,
    paddingVertical: 15,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
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
    color: colors.textSemiDark,
    fontSize: 14,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: colors.primaryYellow,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  emailIcon: {
    marginRight: 10,
  },
  emailButtonText: {
    color: colors.textSemiDark,
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PhoneSignInScreen;