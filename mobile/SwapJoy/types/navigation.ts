import { User } from './auth';
import { ItemCondition } from './item';
import { NavigationProp } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Intro: undefined;
  PhoneSignIn: undefined;
  EmailSignIn: undefined;
  EmailSignUp: undefined;
  EmailVerification: {
    email: string;
  };
  OTPVerification: {
    phone: string;
  };
  OnboardingUsername: undefined;
  OnboardingName: undefined;
  OnboardingBirthdate: undefined;
  OnboardingGender: undefined;
  OnboardingCategories: undefined;
  OnboardingLocation: undefined;
  MainTabs: undefined;
  CreateListing: undefined;
  AddItem: undefined;
  Camera: undefined;
  ItemDetailsForm: {
    imageUris: string[];
  };
  CategorySelector: {
    multiselect?: boolean;
    selectedCategories?: string[];
    updateProfile?: boolean;
    onCategorySelected?: (categoryId: string) => void;
  };
  ItemPreview: {
    itemData: {
      title: string;
      description: string;
      category_id: string | null;
      condition: ItemCondition;
      price: number;
      currency: string;
      location_lat: number | null;
      location_lng: number | null;
      location_label: string | null;
      images: Array<{
        id: string;
        uri: string;
        supabaseUrl: string;
      }>;
    };
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
  ProfileEdit:
    | {
        initialProfile?: {
          firstName?: string;
          lastName?: string;
          username?: string;
          bio?: string;
          profileImageUrl?: string;
        };
      }
    | undefined;
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
  OfferDetails: {
    offer: any;
  };
  ProfileSettings: undefined;
  CategorySelector: {
    multiselect?: boolean;
    selectedCategories?: string[];
    updateProfile?: boolean;
  };
  DevRecommendationSettings: undefined;
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
  Chat: {
    chatId: string;
    offerId: string;
    otherUserId?: string;
    offer?: any;
  };
};

export type MainTabParamList = {
  Explore: undefined;
  Offers: undefined;
  Chats: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type IntroScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'Intro'>;
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

export type EmailVerificationScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'EmailVerification'>;
  route: RouteProp<RootStackParamList, 'EmailVerification'>;
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
  navigation: NavigationProp<RootStackParamList, 'Offers'>;
  route?: RouteProp<RootStackParamList, 'Offers'>;
};

export type NotificationsScreenProps = {
  navigation: NavigationProp<MainTabParamList, 'Notifications'>;
};

export type ChatScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'Chat'>;
  route: RouteProp<RootStackParamList, 'Chat'>;
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

export type CategorySelectorScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'CategorySelector'>;
  route: RouteProp<RootStackParamList, 'CategorySelector'>;
};

export type ProfileEditScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'ProfileEdit'>;
  route: RouteProp<RootStackParamList, 'ProfileEdit'>;
};

export type DevRecommendationSettingsScreenProps = {
  navigation: NavigationProp<RootStackParamList, 'DevRecommendationSettings'>;
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


