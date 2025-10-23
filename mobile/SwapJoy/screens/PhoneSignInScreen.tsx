import React, { useState } from 'react';
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
import { usePhoneSignIn } from '../hooks/usePhoneSignIn';
import { PhoneSignInScreenProps } from '../types/navigation';

const PhoneSignInScreen: React.FC<PhoneSignInScreenProps> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const { isLoading, handleSendOTP, formatPhoneNumber } = usePhoneSignIn();

  const handleSendOTPPress = async () => {
    const { success } = await handleSendOTP({ phone });
    
    if (success) {
      const formattedPhone = formatPhoneNumber(phone);
      navigation.navigate('OTPVerification', { phone: formattedPhone });
    }
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
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sign In</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>Enter your phone number</Text>
          <Text style={styles.description}>
            We'll send you a verification code to confirm your phone number
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>+1</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="5177606110"
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
              <Text style={styles.sendButtonText}>Send Code</Text>
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
    color: '#333',
    fontWeight: '500',
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    color: '#333',
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
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PhoneSignInScreen;