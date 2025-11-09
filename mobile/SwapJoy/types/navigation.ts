import { User } from './auth';
import { NavigationProp } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  PhoneSignIn: undefined;
  EmailSignIn: undefined;
  EmailSignUp: undefined;
  OTPVerification: {
    phone: string;
  };
  MainTabs: undefined;
  CreateListing: undefined;
  AddItem: undefined;
  Camera: undefined;
  ItemDetailsForm: {
    draftId: string;
    imageUris: string[];
  };
  ItemPreview: {
    draftId: string;
  };
  RecentlyListed: undefined;
  ItemDetails: {
    itemId: string;
  };
  BundleItems: {
    bundleId: string;
    title: string;
    ownerId: string;
    bundleItems: Array<any>;
  };
  UserProfile: {
    userId: string;
  };
  FollowersFollowing: {
    userId: string;
    initialTab?: 'followers' | 'following';
  };
  // Offers moved to Root stack to allow deep navigation with initial tab
  Offers: {
    initialTab?: 'sent' | 'received';
  } | undefined;
  ProfileSettings: undefined;
  DevRecommendationSettings: undefined;
  Search: undefined;
  // Offer flow
  OfferCreate: {
    receiverId: string;
    requestedItems: Array<{ id: string; title?: string; price?: number; image_url?: string; item_images?: Array<{ image_url: string }>; condition?: string }>;
    contextTitle?: string; // e.g., bundle title or item title
  };
  OfferPreview: {
    receiverId: string;
    offeredItemIds: string[];
    requestedItemIds: string[];
    topUpAmount: number; // signed (+ add money, - request money)
    message?: string;
    summary: {
      offered: Array<{ id: string; title?: string; price?: number; image_url?: string; item_images?: Array<{ image_url: string }> }>;
      requested: Array<{ id: string; title?: string; price?: number; image_url?: string; item_images?: Array<{ image_url: string }> }>;
    };
  };
  SuggestionDetails: {
    items: Array<{ id: string; title?: string; price?: number; currency?: string; image_url?: string | null }>;
    signature: string;
    targetTitle?: string;
  };
};

export type MainTabParamList = {
  Explore: undefined;
  Search: undefined;
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

export type EmailSignInScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'EmailSignIn'>;
};

export type EmailSignUpScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'EmailSignUp'>;
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
  navigation: NavigationProp<RootStackParamList | MainTabParamList, 'Offers'>;
  route?: RouteProp<RootStackParamList | MainTabParamList, 'Offers'>;
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

export type BundleItemsScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'BundleItems'>;
  route: RouteProp<RootStackParamList, 'BundleItems'>;
};

// Offer screens
export type OfferCreateScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'OfferCreate'>;
  route: RouteProp<RootStackParamList, 'OfferCreate'>;
};

export type OfferPreviewScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'OfferPreview'>;
  route: RouteProp<RootStackParamList, 'OfferPreview'>;
};

export type ProfileSettingsScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'ProfileSettings'>;
};

export type DevRecommendationSettingsScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'DevRecommendationSettings'>;
};

export type SearchScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'Search'>;
};

export type AddItemScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'AddItem'>;
};

export type CameraScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'Camera'>;
};

export type ItemDetailsFormScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'ItemDetailsForm'>;
  route: RouteProp<RootStackParamList, 'ItemDetailsForm'>;
};

export type ItemPreviewScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'ItemPreview'>;
  route: RouteProp<RootStackParamList, 'ItemPreview'>;
};


