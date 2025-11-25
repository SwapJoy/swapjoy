import { useState } from 'react';
import { AuthService } from '../services/auth';

export interface EmailSignUpResult {
  success: boolean;
  error: string | null;
  email?: string;
}

export const useEmailSignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = async (): Promise<{ valid: boolean; error: string | null }> => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      return { valid: false, error: 'Please fill in all fields' };
    }

    if (!validateEmailFormat(email.trim())) {
      return { valid: false, error: 'Please enter a valid email address' };
    }

    if (password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters long' };
    }

    if (password !== confirmPassword) {
      return { valid: false, error: 'Passwords do not match' };
    }

    // Email existence will be checked by Supabase during signup
    // We can optionally check here for better UX, but it's not required
    return { valid: true, error: null };
  };

  const signUp = async (): Promise<EmailSignUpResult> => {
    setError(null);

    const validation = await validateForm();
    if (!validation.valid) {
      setError(validation.error || 'Validation failed');
      return { success: false, error: validation.error || 'Validation failed' };
    }

    setIsLoading(true);

    try {
      // Sign up without userData - onboarding will collect that
      const result = await AuthService.signUpWithEmail(
        email.trim(),
        password,
        {
          username: '', // Will be set during onboarding
          first_name: '', // Will be set during onboarding
          last_name: '', // Will be set during onboarding
        }
      );

      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      if (result.user) {
        // If session exists, user is logged in (email confirmation disabled)
        // If no session, email OTP was sent
        return { 
          success: true, 
          error: null,
          email: email.trim()
        };
      }

      setError('Registration failed');
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
    validateForm,
    signUp,
  };
};

