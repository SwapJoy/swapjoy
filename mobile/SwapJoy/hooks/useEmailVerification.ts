import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { AuthService } from '../services/auth';
import { OTPVerificationFormData, AuthResponse, User } from '../types/auth';

export const useEmailVerification = (email: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startResendTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startResendTimer = () => {
    setResendTimer(60);
    setCanResend(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const verifyOTP = async (formData: OTPVerificationFormData): Promise<AuthResponse> => {
    if (!formData.code.trim()) {
      return { user: null, session: null, error: 'Please enter the OTP code' };
    }

    setIsLoading(true);
    try {
      const result = await AuthService.verifyEmailOTP(email, formData.code);
      return result;
    } catch (error: any) {
      console.error('Unexpected error:', error);
      return { user: null, session: null, error: 'Failed to verify OTP. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (): Promise<{ success: boolean; error: string | null }> => {
    if (!canResend) {
      return { success: false, error: 'Please wait before resending' };
    }

    setIsLoading(true);
    try {
      const error = await AuthService.sendEmailOTP(email);

      if (error) {
        console.error('Resend OTP Error:', error);
        return { success: false, error: error };
      }

      startResendTimer();
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Unexpected error:', error);
      return { success: false, error: 'Failed to resend OTP. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (formData: OTPVerificationFormData) => {
    const { user, session, error } = await verifyOTP(formData);
    
    if (error) {
      Alert.alert('Verification Error', error);
      return { success: false, user: null, session: null, error };
    }

    if (user && session) {
      return { success: true, user, session, error: null };
    }

    return { success: false, user: null, session: null, error: 'Verification failed' };
  };

  const handleResendOTP = async () => {
    const { success, error } = await resendOTP();
    
    if (error) {
      Alert.alert('Resend OTP Error', error);
    } else if (success) {
      Alert.alert('Success', 'New OTP sent to your email!');
    }
  };

  return {
    isLoading,
    resendTimer,
    canResend,
    verifyOTP,
    resendOTP,
    handleVerifyOTP,
    handleResendOTP,
  };
};



