import { User } from './auth';
import { NavigationProp } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  PhoneSignIn: undefined;
  OTPVerification: {
    phone: string;
  };
  MainTabs: undefined;
  CreateListing: undefined;
  AddItem: undefined;
  ItemDetails: {
    itemId: string;
  };
  ProfileSettings: undefined;
  Search: undefined;
};

export type MainTabParamList = {
  Explore: undefined;
  Offers: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type OnboardingScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'Onboarding'>;
};

export type PhoneSignInScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'PhoneSignIn'>;
};

export type OTPVerificationScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'OTPVerification'>;
  route: RouteProp<RootStackParamList, 'OTPVerification'>;
};

export type MainTabsScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'MainTabs'>;
};

export type ExploreScreenProps = {
  navigation: NavigationProp<MainTabParamList, 'Explore'>;
};

export type OffersScreenProps = {
  navigation: NavigationProp<MainTabParamList, 'Offers'>;
};

export type NotificationsScreenProps = {
  navigation: NavigationProp<MainTabParamList, 'Notifications'>;
};

export type ProfileScreenProps = {
  navigation: NavigationProp<MainTabParamList, 'Profile'>;
};

export type CreateListingScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'CreateListing'>;
};

export type ItemDetailsScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'ItemDetails'>;
  route: RouteProp<RootStackParamList, 'ItemDetails'>;
};

export type ProfileSettingsScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'ProfileSettings'>;
};

export type SearchScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'Search'>;
};

export type AddItemScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'AddItem'>;
};


