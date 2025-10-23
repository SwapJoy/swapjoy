import { useState } from 'react';
import { Alert } from 'react-native';
import { AuthService } from '../services/auth';
import { PhoneSignInFormData, AuthResponse } from '../types/auth';

export const usePhoneSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (phone: string): string => {
    let formattedPhone = phone.trim();
    
    // If user enters just the number without country code, add +1 for US testing
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('1')) {
        formattedPhone = '+' + formattedPhone;
      } else {
        // Add +1 prefix for US testing
        formattedPhone = '+1' + formattedPhone;
      }
    }

    return formattedPhone;
  };

  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone.trim()) {
      return 'Please enter your phone number';
    }

    const formattedPhone = formatPhoneNumber(phone);
    
    // Validate phone number format
    if (!/^\+\d{10,15}$/.test(formattedPhone)) {
      return 'Invalid phone number format. Please use international format (+15177606110)';
    }

    return null;
  };

  const sendOTP = async (formData: PhoneSignInFormData): Promise<AuthResponse> => {
    const validationError = validatePhoneNumber(formData.phone);
    if (validationError) {
      return { user: null, session: null, error: validationError };
    }

    const formattedPhone = formatPhoneNumber(formData.phone);
    console.log('Sending OTP to:', formattedPhone);

    setIsLoading(true);
    try {
      const { error } = await AuthService.signInWithOTP(formattedPhone);

      if (error) {
        console.error('OTP Error:', error);
        return { user: null, session: null, error: error };
      }

      console.log('OTP sent successfully');
      return { user: null, session: null, error: null };
    } catch (error: any) {
      console.error('Unexpected error:', error);
      return { user: null, session: null, error: 'Failed to send OTP. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (formData: PhoneSignInFormData) => {
    const { error } = await sendOTP(formData);
    
    if (error) {
      Alert.alert('Error', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  };

  return {
    isLoading,
    sendOTP,
    handleSendOTP,
    formatPhoneNumber,
    validatePhoneNumber,
  };
};
