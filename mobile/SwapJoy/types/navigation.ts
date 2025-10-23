import { User } from './auth';

export type RootStackParamList = {
  Onboarding: undefined;
  PhoneSignIn: undefined;
  OTPVerification: {
    phone: string;
  };
  Main: {
    user: User;
  };
};

export type OnboardingScreenProps = {
  navigation: any;
};

export type PhoneSignInScreenProps = {
  navigation: any;
};

export type OTPVerificationScreenProps = {
  navigation: any;
  route: {
    params: {
      phone: string;
    };
  };
};

export type MainScreenProps = {
  navigation: any;
  route: {
    params: {
      user: User;
    };
  };
};
