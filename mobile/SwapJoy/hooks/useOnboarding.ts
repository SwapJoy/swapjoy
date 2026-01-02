import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../contexts/ProfileContext';

export type OnboardingStep = 'username' | 'name';

const ONBOARDING_STEPS: OnboardingStep[] = ['username', 'name'];

// Map route names to step indices
const ROUTE_TO_STEP_INDEX: Record<string, number> = {
  OnboardingUsername: 0,
  OnboardingName: 1,
};

export const useOnboarding = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const routeName = route.name as string;
  const currentStepIndex = ROUTE_TO_STEP_INDEX[routeName] ?? 0;
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Check if user needs onboarding (based on username presence)
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // If user is not authenticated, redirect to unauthenticated flow
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        setNeedsOnboarding(false);
        // Navigate away from onboarding if not authenticated
        try {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        } catch (error) {
          console.warn('[useOnboarding] Navigation error:', error);
        }
        return;
      }

      try {
        const { data: profile, error } = await ApiService.getProfile();
        if (error) {
          console.warn('[useOnboarding] Error fetching profile:', error);
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
            console.log('[useOnboarding] Auth error detected (user deleted or invalid session), signing out');
            await signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          }
          setIsLoading(false);
          return;
        }

        // If user has a username, assume onboarding was completed
        const typedProfile = profile as UserProfile | null;
        const hasUsername = !!typedProfile?.username;
        setNeedsOnboarding(!hasUsername);
        setIsLoading(false);
      } catch (error) {
        console.error('[useOnboarding] Error checking onboarding status:', error);
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, isAuthenticated, signOut, navigation]);

  const completeOnboarding = useCallback(async () => {
    try {
      // Navigation completes onboarding - username presence is the indicator
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      console.error('[useOnboarding] Error completing onboarding:', error);
    }
  }, [navigation]);

  const currentStep = ONBOARDING_STEPS[currentStepIndex] || ONBOARDING_STEPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  const nextStep = useCallback(() => {
    // Get current route from navigation state to ensure we have the latest route
    const state = navigation.getState();
    const currentRoute = state?.routes[state?.index ?? 0];
    const currentRouteName = (currentRoute?.name ?? route.name) as string;
    let stepIndex = ROUTE_TO_STEP_INDEX[currentRouteName];
    
    // Fallback: if route name not found in map, default to first step
    if (stepIndex === undefined) {
      stepIndex = 0;
    }
    
    const isLast = stepIndex === ONBOARDING_STEPS.length - 1;
    
    console.log('[useOnboarding] nextStep called:', {
      currentRouteName,
      stepIndex,
      isLast,
      totalSteps: ONBOARDING_STEPS.length,
      routeFromState: currentRoute?.name,
      routeFromHook: route.name,
      allRoutes: state?.routes.map((r: any) => r.name),
      currentIndex: state?.index,
    });
    
    if (isLast) {
      console.log('[useOnboarding] Last step, completing onboarding');
      completeOnboarding();
    } else {
      const nextStepIndex = stepIndex + 1;
      const nextStepName = ONBOARDING_STEPS[nextStepIndex];
      
      // Direct route mapping based on next step name
      let nextRoute: string;
      switch (nextStepName) {
        case 'name':
          nextRoute = 'OnboardingName';
          break;
        default:
          nextRoute = 'MainTabs';
          break;
      }
      console.log('[useOnboarding] Navigating to next step:', {
        nextStepIndex,
        nextStepName,
        nextRoute,
      });
      if (nextRoute) {
        try {
          navigation.navigate(nextRoute as any);
        } catch (error) {
          console.error('[useOnboarding] Navigation error:', error);
        }
      } else {
        console.error('[useOnboarding] No route found for next step:', nextStepName);
      }
    }
  }, [route, navigation, completeOnboarding]);

  const previousStep = useCallback(() => {
    // Use goBack() to get proper back animation instead of navigate()
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const skipOnboarding = useCallback(async () => {
    try {
      // Navigation completes onboarding - username presence is the indicator
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      console.error('[useOnboarding] Error skipping onboarding:', error);
    }
  }, [navigation]);

  const goToStep = useCallback((step: OnboardingStep) => {
    const index = ONBOARDING_STEPS.indexOf(step);
    if (index !== -1) {
      const stepRouteMap: Record<OnboardingStep, keyof any> = {
        username: 'OnboardingUsername',
        name: 'OnboardingName',
      };
      navigation.navigate(stepRouteMap[step] as any);
    }
  }, [navigation]);

  return {
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    needsOnboarding,
    isLoading,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    goToStep,
    totalSteps: ONBOARDING_STEPS.length,
  };
};

