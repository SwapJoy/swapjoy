import React, { forwardRef, useState, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';
import IntroScreen from '../screens/IntroScreen';
import PhoneSignInScreen from '../screens/PhoneSignInScreen';
import EmailSignInScreen from '../screens/EmailSignInScreen';
import EmailSignUpScreen from '../screens/EmailSignUpScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import UsernameScreen from '../screens/onboarding/UsernameScreen';
import NameScreen from '../screens/onboarding/NameScreen';
import BirthdateScreen from '../screens/onboarding/BirthdateScreen';
import GenderScreen from '../screens/onboarding/GenderScreen';
import CategoriesScreen from '../screens/onboarding/CategoriesScreen';
import LocationScreen from '../screens/onboarding/LocationScreen';
import MainPageContainer from '../screens/MainPageContainer';
import CreateListingScreen from '../screens/CreateListingScreen';
import AddItemScreen from '../screens/AddItemScreen';
import CameraScreen from '../screens/CameraScreen';
import ItemDetailsFormScreen from '../screens/ItemDetailsFormScreen';
import ItemPreviewScreen from '../screens/ItemPreviewScreen';
import ItemDetailsScreen from '../screens/ItemDetailsScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import CategorySelectorScreen from '../screens/CategorySelectorScreen';
import BundleItemsScreen from '../screens/BundleItemsScreen';
import OfferCreateScreen from '../screens/OfferCreateScreen';
import OfferPreviewScreen from '../screens/OfferPreviewScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FollowersFollowingScreen from '../screens/FollowersFollowingScreen';
import DevRecommendationSettingsScreen from '../screens/DevRecommendationSettingsScreen';
import SuggestionDetailsScreen from '../screens/SuggestionDetailsScreen';
import OffersScreen from '../screens/OffersScreen';
import RecentlyListedScreen from '../screens/RecentlyListedScreen';
import ChatScreen from '../screens/ChatScreen';
import OfferDetailsScreen from '../screens/OfferDetailsScreen';

const Stack = createStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  ref?: React.Ref<NavigationContainerRef<RootStackParamList>>;
}

const AppNavigator = forwardRef<NavigationContainerRef<RootStackParamList>>((props, ref) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [hasUsername, setHasUsername] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Check if user has username when authenticated
  useEffect(() => {
    const checkUsernameStatus = async () => {
      if (!isAuthenticated || !user) {
        setHasUsername(null);
        return;
      }

      setCheckingUsername(true);
      try {
        const { data: profile, error } = await ApiService.getProfile();
        if (error) {
          console.warn('[AppNavigator] Error fetching profile:', error);
          setHasUsername(true); // Default to true to avoid blocking
        } else {
          // If user has a username, assume onboarding was completed
          setHasUsername(!!profile?.username);
        }
      } catch (error) {
        console.error('[AppNavigator] Error checking username status:', error);
        setHasUsername(true); // Default to true to avoid blocking
      } finally {
        setCheckingUsername(false);
      }
    };

    if (isAuthenticated && !isLoading) {
      checkUsernameStatus();
    }
  }, [isAuthenticated, user, isLoading]);

  // Show loading screen while checking authentication or username
  if (isLoading || (isAuthenticated && checkingUsername)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Determine initial route
  const getInitialRoute = (): keyof RootStackParamList => {
    if (!isAuthenticated) {
      return 'Intro';
    }
    // If user doesn't have a username, show onboarding
    if (hasUsername === false) {
      return 'OnboardingUsername';
    }
    return 'MainTabs';
  };

  // Deep linking configuration for OAuth callbacks
  const linking = {
    prefixes: ['com.swapjoy://', 'swapjoy://'],
    config: {
      screens: {
        EmailSignIn: 'auth/callback',
        EmailSignUp: 'auth/callback',
        EmailVerification: 'auth/callback',
        PhoneSignIn: 'auth/callback',
        OTPVerification: 'auth/callback',
      },
    },
  };

  return (
    <NavigationContainer ref={ref} linking={linking}>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#F7F8FF',
            borderBottomWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 14,
            elevation: Platform.OS === 'android' ? 6 : 0,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
            color: '#111827',
            letterSpacing: 0.3,
          },
          headerTitleAlign: 'center',
          headerLeft: ({ navigation, onPress: _onPress, ...props }) => {
            // Use default behavior by calling the default back handler
            const handlePress = () => {
              if (_onPress) {
                _onPress();
              } else if (navigation.canGoBack()) {
                navigation.goBack();
              }
            };
            
            return (
              <TouchableOpacity
                style={{
                  width: 44,
                  height: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: Platform.OS === 'ios' ? 4 : 8,
                }}
                onPress={handlePress}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
            );
          },
        }}
      >
        {isAuthenticated ? (
          // Authenticated screens
          <>
            {/* Onboarding screens */}
            {hasUsername === false && (
              <>
                <Stack.Screen 
                  name="OnboardingUsername" 
                  component={UsernameScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="OnboardingName" 
                  component={NameScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="OnboardingBirthdate" 
                  component={BirthdateScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="OnboardingGender" 
                  component={GenderScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="OnboardingCategories" 
                  component={CategoriesScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="OnboardingLocation" 
                  component={LocationScreen}
                  options={{ headerShown: false }}
                />
              </>
            )}
            <Stack.Screen 
              name="MainTabs" 
              component={MainPageContainer} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="CreateListing" 
              component={CreateListingScreen}
              options={{ title: 'Create Listing' }}
            />
            <Stack.Screen 
              name="AddItem" 
              component={AddItemScreen}
              options={{ 
                title: 'Add Item',
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="Camera" 
              component={CameraScreen}
              options={{ 
                title: 'Camera',
                headerShown: false,
                presentation: 'fullScreenModal',
              }}
            />
            <Stack.Screen 
              name="ItemDetailsForm" 
              component={ItemDetailsFormScreen}
              options={({ route }) => {
                const params = route.params as any;
                // Disable animation when navigating back from CategorySelector
                const shouldDisableAnimation = params?.selectedCategoryId !== undefined;
                return {
                title: 'Item Details',
                headerShown: false,
                  ...(shouldDisableAnimation ? {
                    animationEnabled: false,
                    animation: 'none' as const,
                    transitionSpec: {
                      open: { animation: 'timing', config: { duration: 0 } },
                      close: { animation: 'timing', config: { duration: 0 } },
                    },
                  } : {}),
                };
              }}
            />
            <Stack.Screen 
              name="ItemPreview" 
              component={ItemPreviewScreen}
              options={{ 
                title: 'Preview',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="ItemDetails" 
              component={ItemDetailsScreen}
              options={{ 
                title: 'Item Details',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="RecentlyListed"
              component={RecentlyListedScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UserProfile"
              component={ProfileScreen}
              options={{
                title: 'Profile',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="BundleItems" 
              component={BundleItemsScreen}
              options={({ route }) => ({ 
                title: (route.params as any).title || 'Bundle',
                headerBackTitleVisible: false,
              })}
            />
            <Stack.Screen 
              name="OfferCreate" 
              component={OfferCreateScreen}
              options={{ title: 'Create Offer' }}
            />
            <Stack.Screen 
              name="OfferPreview" 
              component={OfferPreviewScreen}
              options={{ title: 'Preview Offer' }}
            />
            <Stack.Screen 
              name="ProfileSettings" 
              component={ProfileSettingsScreen}
              options={{ title: 'Settings' }}
            />
            <Stack.Screen
              name="CategorySelector"
              component={CategorySelectorScreen}
              options={({ route }) => {
                const params = route.params as any;
                // Disable animation when opened from ItemDetailsForm (multiselect=false, updateProfile=false)
                const shouldDisableAnimation = params?.multiselect === false && params?.updateProfile === false;
                return {
                  title: 'Select Categories',
                  headerBackTitleVisible: false,
                  headerShown: true,
                  ...(shouldDisableAnimation ? {
                    animationEnabled: false,
                    animation: 'none' as const,
                    transitionSpec: {
                      open: { animation: 'timing', config: { duration: 0 } },
                      close: { animation: 'timing', config: { duration: 0 } },
                    },
                  } : {}),
                };
              }}
            />
            <Stack.Screen
              name="ProfileEdit"
              component={ProfileEditScreen}
              options={{ title: 'Edit Profile', headerBackTitleVisible: false }}
            />
            <Stack.Screen 
              name="DevRecommendationSettings" 
              component={DevRecommendationSettingsScreen}
              options={{ title: 'DEV: Recommendation Weights' }}
            />
            <Stack.Screen 
              name="FollowersFollowing" 
              component={FollowersFollowingScreen}
              options={{ title: 'Followers & Following' }}
            />
            <Stack.Screen
              name="Offers"
              component={OffersScreen}
              options={{ title: 'Offers' }}
            />
            <Stack.Screen
              name="OfferDetails"
              component={OfferDetailsScreen}
              options={{ title: 'Offer Details' }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ title: 'Chat' }}
            />
            <Stack.Screen 
              name="SuggestionDetails" 
              component={SuggestionDetailsScreen}
              options={{ title: 'Suggestion Details' }}
            />
          </>
        ) : (
          // Unauthenticated screens
          <>
            <Stack.Screen 
              name="Intro" 
                  component={IntroScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="PhoneSignIn" 
              component={PhoneSignInScreen}
              options={{ title: 'Sign In' }}
            />
            <Stack.Screen 
              name="EmailSignIn" 
              component={EmailSignInScreen}
              options={{ title: 'Sign In' }}
            />
            <Stack.Screen 
              name="EmailSignUp" 
              component={EmailSignUpScreen}
              options={{ title: 'Sign Up' }}
            />
            <Stack.Screen 
              name="EmailVerification" 
              component={EmailVerificationScreen}
              options={{ title: 'Verify Email' }}
            />
            <Stack.Screen 
              name="OTPVerification" 
              component={OTPVerificationScreen}
              options={{ title: 'Verify Phone' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
});

AppNavigator.displayName = 'AppNavigator';

export default AppNavigator;
