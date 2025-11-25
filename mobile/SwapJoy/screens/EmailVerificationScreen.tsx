import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useEmailVerification } from '../hooks/useEmailVerification';
import { useAuth } from '../contexts/AuthContext';
import { EmailVerificationScreenProps } from '../types/navigation';

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { email } = route.params;
  const [otpCode, setOtpCode] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { signIn } = useAuth();
  
  const { 
    isLoading, 
    resendTimer, 
    canResend, 
    handleVerifyOTP, 
    handleResendOTP 
  } = useEmailVerification(email);

  const handleVerifyOTPPress = async () => {
    const { success, user, session, error } = await handleVerifyOTP({ code: otpCode });
    
    if (success && user && session) {
      // The auth context will automatically handle the state update
      // Navigation will be handled by the AppNavigator based on auth state
      console.log('User authenticated successfully:', user);
    }
  };

  const handleResendOTPPress = async () => {
    await handleResendOTP();
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleOTPChange = (text: string) => {
    // Only allow numbers and limit to 6 digits
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtpCode(numericText);
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
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Verify Email</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>Enter verification code</Text>
          <Text style={styles.description}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.emailAddress}>{email}</Text>
          </Text>

          <View style={styles.otpContainer}>
            <TextInput
              ref={inputRef}
              style={styles.otpInput}
              value={otpCode}
              onChangeText={handleOTPChange}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              placeholder="000000"
              placeholderTextColor="#ccc"
            />
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, isLoading && styles.disabledButton]}
            onPress={handleVerifyOTPPress}
            disabled={isLoading || otpCode.length !== 6}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Code</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity
              onPress={handleResendOTPPress}
              disabled={!canResend || isLoading}
            >
              <Text style={[styles.resendLink, !canResend && styles.disabledText]}>
                {canResend ? 'Resend' : `Resend in ${resendTimer}s`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  emailAddress: {
    fontWeight: 'bold',
    color: '#333',
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  otpInput: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
    paddingVertical: 10,
    minWidth: 200,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    color: '#666',
  },
  resendLink: {
    color: '#007AFF',
    fontWeight: '500',
  },
  disabledText: {
    color: '#ccc',
  },
});

export default EmailVerificationScreen;

