export interface User {
  id: string;
  phone?: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  user: User | null;
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
