export interface User {
  id: string;
  phone?: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_verified?: boolean;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface AuthResponse {
  user: User | null;
  session: AuthSession | null;
  error: string | null;
}

export interface PhoneSignInFormData {
  phone: string;
}

export interface OTPVerificationFormData {
  code: string;
}

export interface OnboardingSlide {
  key: string;
  title: string;
  text: string;
  image: string;
}

export interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface CreateUserData {
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
}
