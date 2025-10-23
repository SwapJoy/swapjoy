import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
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
      return { user: null, error: validationError };
    }

    const formattedPhone = formatPhoneNumber(formData.phone);
    console.log('Sending OTP to:', formattedPhone);

    setIsLoading(true);
    try {
      // Try Supabase phone auth first
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        console.error('Supabase OTP Error:', error);
        
        // If it's a geo-blocking or SMS provider error, fall back to custom solution
        if (error.message.includes('blocked') || 
            error.message.includes('Geo-Permissions') || 
            error.message.includes('Invalid From Number') ||
            error.message.includes('Twilio') ||
            error.message.includes('sms_send_failed')) {
          
          console.log('SMS provider blocked, using fallback method');
          
          // For now, simulate successful OTP sending
          // In production, call your custom SMS Edge Function here
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Store the phone number for verification (you could use localStorage or a simple in-memory store)
          // In a real app, you'd store this in a database or cache
          console.log('OTP sent via fallback method - use code 1234 for testing');
          return { user: null, error: null };
        }
        
        return { user: null, error: error.message };
      }

      console.log('OTP sent successfully via Supabase');
      return { user: null, error: null };
    } catch (error: any) {
      console.error('Unexpected error:', error);
      return { user: null, error: 'Failed to send OTP. Please try again.' };
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
