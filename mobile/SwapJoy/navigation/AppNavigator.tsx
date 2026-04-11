import React, { forwardRef, useState, useEffect, useCallback, useRef, memo } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HeaderBackButton } from '@react-navigation/elements';
import { Platform, TouchableOpacity, ActivityIndicator, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';
import { hasCompletedIntro } from '../utils/introStorage';
import { colors } from './MainTabNavigator.styles';
import IntroScreen from '../screens/IntroScreen';
import PhoneSignInScreen from '../screens/PhoneSignInScreen';
import EmailSignInScreen from '../screens/EmailSignInScreen';
import EmailSignUpScreen from '../screens/EmailSignUpScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import UsernameScreen from '../screens/onboarding/UsernameScreen';
import NameScreen from '../screens/onboarding/NameScreen';
import MainPageContainer from '../screens/MainPageContainer';
import CreateListingScreen from '../screens/CreateListingScreen';
import AddItemScreen from '../screens/AddItemScreen';
import CameraScreen from '../screens/CameraScreen';
import ItemDetailsFormScreen from '../screens/ItemDetailsFormScreen';
import ImageUploadProgressScreen from '../screens/wizard/ImageUploadProgressScreen';
import TitleInputScreen from '../screens/wizard/TitleInputScreen';
import CategoryInputScreen from '../screens/wizard/CategoryInputScreen';
import DescInputScreen from '../screens/wizard/DescInputScreen';
import PriceInputScreen from '../screens/wizard/PriceInputScreen';
import LocationInputScreen from '../screens/wizard/LocationInputScreen';
import ItemPreviewScreen from '../screens/ItemPreviewScreen';
import ItemDetailsScreen from '../screens/ItemDetailsScreen';
import SearchScreen from '../modules/search/screens/SearchScreen';
import SearchResultsScreen from '../modules/search/screens/SearchResultsScreen';
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
import SJText from '@components/SJText';
import { useLocalization } from '../localization';

const Stack = createStackNavigator<RootStackParamList>();

// Loading screen component with animation
const LoadingScreen = memo(() => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundColor }}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        }}
      >
        <SJText style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold' }}>SwapJoy</SJText>
      </Animated.View>
    </View>
  );
});

const AppNavigator = forwardRef<NavigationContainerRef<RootStackParamList>>((props, ref) => {
  const { isAuthenticated, isLoading, user, isAnonymous, signOut } = useAuth();
  const { t } = useLocalization();
  const [hasUsername, setHasUsername] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [hasResolvedInitialUsernameCheck, setHasResolvedInitialUsernameCheck] = useState(false);
  const [introCompleted, setIntroCompleted] = useState<boolean | null>(null);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList> | null>(null);
  const previousRouteNameRef = useRef<string | undefined>(undefined);
  const activeUserId = user?.id ?? null;

  // Check intro completion status
  useEffect(() => {
    const checkIntroStatus = async () => {
      const completed = await hasCompletedIntro();
      setIntroCompleted(completed);
    };
    checkIntroStatus();
  }, []);

  // Function to check username status (extracted for reuse)
  // Simple check: if user has a username, onboarding is complete
  const checkUsernameStatus = useCallback(async () => {
    if (!isAuthenticated || !user || isAnonymous) {
      setHasUsername(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data: profile, error } = await ApiService.getProfile();
      if (error) {
        console.warn('[AppNavigator] Error fetching profile:', error);
        // Check for various auth errors that indicate user was deleted or session is invalid
        const errorMessage = error.message || String(error) || '';
        const errorStatus = (error as any)?.status || (error as any)?.code;
        const isAuthError = 
          errorStatus === 403 || 
          errorStatus === 401 ||
          errorMessage.includes('Not authenticated') || 
          errorMessage.includes('not found') ||
          errorMessage.includes('Forbidden') ||
          errorMessage.includes('403') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('session') ||
          errorMessage.includes('jwt') ||
          errorMessage.includes('token');
        
        // If user was deleted from auth or session is invalid, sign them out
        if (isAuthError) {
          console.log('[AppNavigator] Auth error detected (user deleted or invalid session), signing out');
          await signOut();
          setHasUsername(null);
          return;
        }
        // For other errors, default to true to avoid blocking
        setHasUsername(true);
      } else {
        const username = (profile as any)?.username;
        const hasUsernameValue = !!username && username.trim() !== '';
        
        console.log('[AppNavigator] Username check result:', {
          hasUsername: hasUsernameValue,
          username: username || 'null',
        });
        
        setHasUsername(hasUsernameValue);
      }
    } catch (error) {
      console.error('[AppNavigator] Error checking username status:', error);
      // For unexpected errors, default to true to avoid blocking
      setHasUsername(true);
    } finally {
      setCheckingUsername(false);
    }
  }, [isAuthenticated, user, isAnonymous, signOut]);

  // Complete startup only after the first username resolution for authenticated users.
  // This prevents navigator <-> loading toggles that remount the launch animation.
  useEffect(() => {
    if (isLoading) {
      setHasResolvedInitialUsernameCheck(false);
      return;
    }

    if (!isAuthenticated || isAnonymous) {
      setHasResolvedInitialUsernameCheck(true);
      return;
    }

    let isMounted = true;
    const runInitialUsernameCheck = async () => {
      await checkUsernameStatus();
      if (isMounted) {
        setHasResolvedInitialUsernameCheck(true);
      }
    };

    setHasResolvedInitialUsernameCheck(false);
    runInitialUsernameCheck();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isLoading, isAnonymous, activeUserId, checkUsernameStatus]);

  // Listen to navigation state changes to re-check username after onboarding
  const handleNavigationStateChange = useCallback(() => {
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;
    const previousRouteName = previousRouteNameRef.current;

    // Re-check username when navigating to MainTabs (especially after onboarding)
    // This handles both normal navigation and navigation.reset() cases
    if (currentRouteName === 'MainTabs') {
      // If we were on an onboarding screen before, re-check username
      // This catches the case where user completes onboarding
      if (previousRouteName && previousRouteName.startsWith('Onboarding')) {
        console.log('[AppNavigator] Navigated to MainTabs from onboarding, re-checking username');
        // Add a small delay to ensure profile update has been saved to database
        setTimeout(() => {
          checkUsernameStatus();
        }, 500);
      }
    }

    previousRouteNameRef.current = currentRouteName;
  }, [checkUsernameStatus]);

  // Also re-check username when hasUsername is false and we're authenticated
  // This catches edge cases where navigation listener might not fire
  useEffect(() => {
    if (
      isAuthenticated &&
      !isAnonymous &&
      hasUsername === false &&
      !checkingUsername &&
      navigationRef.current?.getCurrentRoute()?.name === 'MainTabs'
    ) {
      // If we're on MainTabs but still think user doesn't have username, re-check after a delay
      // This handles cases where onboarding completed but navigation listener didn't catch it
      const timeoutId = setTimeout(() => {
        console.log('[AppNavigator] Re-checking username on MainTabs (hasUsername is false)');
        checkUsernameStatus();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isAnonymous, hasUsername, checkingUsername, checkUsernameStatus]);

  // Combine refs: both forward ref and internal ref
  // MUST be declared before any conditional returns to follow Rules of Hooks
  const setRef = useCallback((node: NavigationContainerRef<RootStackParamList> | null) => {
    navigationRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  // Show loading screen while checking authentication, intro status, or username
  if (isLoading || introCompleted === null || (isAuthenticated && !isAnonymous && !hasResolvedInitialUsernameCheck)) {
    return <LoadingScreen />;
  }

  // Determine initial route
  const getInitialRoute = (): keyof RootStackParamList => {
    // Show intro if not completed
    if (!introCompleted) {
      return 'Intro';
    }
    
    // If authenticated but not anonymous and doesn't have username, show onboarding
    if (isAuthenticated && !isAnonymous && hasUsername === false) {
      return 'OnboardingUsername';
    }
    
    // Allow access to MainTabs for both authenticated and anonymous users
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
    <NavigationContainer ref={setRef} linking={linking} onStateChange={handleNavigationStateChange}>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: true, // Explicitly set default - ensures header is shown unless screen overrides it
          headerStyle: {
            backgroundColor: colors.primaryYellow,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.backgroundColor,
            letterSpacing: 0.3,
          },
          headerTintColor: colors.textLight,
          headerTitleAlign: 'center',
          headerBackTitle: '',
          headerLeft: (props) => {
            if (Platform.OS === 'ios') {
              return (
                <HeaderBackButton
                  {...props}
                  tintColor={colors.textLight}
                  style={{ marginLeft: 0 }}
                />
              );
            }
            // Android: use custom back button
            return (
              <TouchableOpacity
                style={{
                  width: 44,
                  height: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 0,
                }}
                onPress={props.onPress}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color={colors.textLight} />
              </TouchableOpacity>
            );
          },
        }}
      >
        {/* Intro screen - always available (shown if not completed) */}
        <Stack.Screen 
          name="Intro" 
          component={IntroScreen}
          options={{ headerShown: false }}
        />
        
        {/* Auth screens - always available (for sign-in modal navigation) */}
        <Stack.Screen 
          name="PhoneSignIn" 
          component={PhoneSignInScreen}
          options={{ title: t('navigation.signIn') }}
        />
        <Stack.Screen 
          name="EmailSignIn" 
          component={EmailSignInScreen}
          options={{ 
            title: t('navigation.signIn'),
            animationEnabled: false,
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 0 } },
              close: { animation: 'timing', config: { duration: 0 } },
            },
          }}
        />
        <Stack.Screen 
          name="EmailSignUp" 
          component={EmailSignUpScreen}
          options={{ title: t('navigation.signUp') }}
        />
        <Stack.Screen 
          name="EmailVerification" 
          component={EmailVerificationScreen}
          options={{ title: t('navigation.verifyEmail') }}
        />
        <Stack.Screen 
          name="OTPVerification" 
          component={OTPVerificationScreen}
          options={{ title: t('navigation.verifyPhone') }}
        />
        
        {/* Screens accessible to both authenticated and anonymous users */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainPageContainer} 
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ItemDetails"
          component={ItemDetailsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: '',
          }}
        />
        <Stack.Screen
          name="SearchResults"
          component={SearchResultsScreen}
          options={{
            title: t('navigation.searchResults'),
          }}
        />
        
        {/* Authenticated-only screens */}
        {isAuthenticated && (
          <>
            {/* Onboarding screens */}
            {!isAnonymous && hasUsername === false && (
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
              </>
            )}
            <Stack.Screen 
              name="CreateListing" 
              component={CreateListingScreen}
              options={{ title: t('navigation.createListing') }}
            />
            <Stack.Screen 
              name="AddItem" 
              component={AddItemScreen}
              options={{ 
                title: t('navigation.addItem'),
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="Camera" 
              component={CameraScreen}
              options={{ 
                title: t('navigation.camera'),
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
                title: t('navigation.itemDetails'),
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
              name="ImageUploadProgress" 
              component={ImageUploadProgressScreen}
              options={{
                title: t('navigation.uploadImages'),
                headerShown: true,
                headerStyle: {
                  backgroundColor: colors.primaryYellow,
                },
              }}
            />
            <Stack.Screen 
              name="TitleInput" 
              component={TitleInputScreen}
              options={{
                title: t('navigation.titleAndCondition'),
                headerShown: true,
                headerStyle: {
                  backgroundColor: colors.primaryYellow,
                },
              }}
            />
            <Stack.Screen 
              name="CategoryInput" 
              component={CategoryInputScreen}
              options={{
                title: t('navigation.category'),
                headerShown: true,
                headerStyle: {
                  backgroundColor: colors.primaryYellow,
                },
              }}
            />
            <Stack.Screen 
              name="DescInput" 
              component={DescInputScreen}
              options={{
                title: t('navigation.description'),
                headerShown: true,
                headerStyle: {
                  backgroundColor: colors.primaryYellow,
                },
              }}
            />
            <Stack.Screen 
              name="PriceInput" 
              component={PriceInputScreen}
              options={{
                title: t('navigation.price'),
                headerShown: true,
                headerStyle: {
                  backgroundColor: colors.primaryYellow,
                },
              }}
            />
            <Stack.Screen 
              name="LocationInput" 
              component={LocationInputScreen}
              options={{
                title: t('navigation.location'),
                headerShown: true,
                headerStyle: {
                  backgroundColor: colors.primaryYellow,
                },
              }}
            />
            <Stack.Screen 
              name="ItemPreview" 
              component={ItemPreviewScreen}
              options={{
                title: t('navigation.preview'),
                headerShown: true,
                headerStyle: {
                  backgroundColor: colors.primaryYellow,
                },
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
                title: t('navigation.profile'),
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="BundleItems" 
              component={BundleItemsScreen}
              options={({ route }) => ({ 
                title: (route.params as any).title || t('navigation.bundle'),
                headerBackTitleVisible: false,
              })}
            />
            <Stack.Screen 
              name="OfferCreate" 
              component={OfferCreateScreen}
              options={{ title: t('navigation.createOffer') }}
            />
            <Stack.Screen 
              name="OfferPreview" 
              component={OfferPreviewScreen}
              options={{ title: t('navigation.previewOffer') }}
            />
            <Stack.Screen 
              name="ProfileSettings" 
              component={ProfileSettingsScreen}
              options={{ title: t('navigation.settings') }}
            />
            <Stack.Screen
              name="CategorySelector"
              component={CategorySelectorScreen}
              options={({ route }) => {
                const params = route.params as any;
                // Disable animation when opened from ItemDetailsForm (multiselect=false, updateProfile=false)
                const shouldDisableAnimation = params?.multiselect === false && params?.updateProfile === false;
                return {
                  title: t('navigation.selectCategories'),
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
              options={{ title: t('navigation.editProfile'), headerBackTitleVisible: false }}
            />
            <Stack.Screen 
              name="DevRecommendationSettings" 
              component={DevRecommendationSettingsScreen}
              options={{ title: t('navigation.devRecommendationSettings') }}
            />
            <Stack.Screen 
              name="FollowersFollowing" 
              component={FollowersFollowingScreen}
              options={{ title: t('navigation.followersFollowing') }}
            />
            <Stack.Screen
              name="Offers"
              component={OffersScreen}
              options={{ title: t('navigation.offers') }}
            />
            <Stack.Screen
              name="OfferDetails"
              component={OfferDetailsScreen}
              options={{ title: t('navigation.offerDetails') }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ title: t('navigation.chat') }}
            />
            <Stack.Screen 
              name="SuggestionDetails" 
              component={SuggestionDetailsScreen}
              options={{ title: t('navigation.suggestionDetails') }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
});

AppNavigator.displayName = 'AppNavigator';

export default AppNavigator;
