import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export type OnboardingStep = 'username' | 'name' | 'birthdate' | 'gender' | 'categories' | 'location';

const ONBOARDING_STEPS: OnboardingStep[] = ['username', 'name', 'birthdate', 'gender', 'categories', 'location'];

// Map route names to step indices
const ROUTE_TO_STEP_INDEX: Record<string, number> = {
  OnboardingUsername: 0,
  OnboardingName: 1,
  OnboardingBirthdate: 2,
  OnboardingGender: 3,
  OnboardingCategories: 4,
  OnboardingLocation: 5,
};

export const useOnboarding = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const routeName = route.name as string;
  const currentStepIndex = ROUTE_TO_STEP_INDEX[routeName] ?? 0;
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Check if user needs onboarding (based on username presence)
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setIsLoading(false);
        setNeedsOnboarding(false);
        return;
      }

      try {
        const { data: profile, error } = await ApiService.getProfile();
        if (error) {
          console.warn('[useOnboarding] Error fetching profile:', error);
          setIsLoading(false);
          return;
        }

        // If user has a username, assume onboarding was completed
        const hasUsername = !!profile?.username;
        setNeedsOnboarding(!hasUsername);
        setIsLoading(false);
      } catch (error) {
        console.error('[useOnboarding] Error checking onboarding status:', error);
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

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
    
    // Fallback: if route name not found in map, try to infer from route name
    if (stepIndex === undefined) {
      if (currentRouteName === 'OnboardingCategories') {
        stepIndex = 4;
      } else if (currentRouteName === 'OnboardingLocation') {
        stepIndex = 5;
      } else {
        stepIndex = 0;
      }
    }
    
    const isLast = stepIndex === ONBOARDING_STEPS.length - 1;
    
    console.log('[useOnboarding] nextStep called:', {
      currentRouteName,
      stepIndex,
      isLast,
      totalSteps: ONBOARDING_STEPS.length,
      routeFromState: currentRoute?.name,
      routeFromHook: route.name,
      allRoutes: state?.routes.map(r => r.name),
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
        case 'birthdate':
          nextRoute = 'OnboardingBirthdate';
          break;
        case 'gender':
          nextRoute = 'OnboardingGender';
          break;
        case 'categories':
          nextRoute = 'OnboardingCategories';
          break;
        case 'location':
          nextRoute = 'OnboardingLocation';
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
    // Recalculate current step index based on current route to avoid stale closures
    const currentRouteName = route.name as string;
    const stepIndex = ROUTE_TO_STEP_INDEX[currentRouteName] ?? 0;
    const isFirst = stepIndex === 0;
    
    if (!isFirst) {
      const prevStepName = ONBOARDING_STEPS[stepIndex - 1];
      const stepRouteMap: Record<OnboardingStep, keyof any> = {
        username: 'OnboardingUsername',
        name: 'OnboardingUsername',
        birthdate: 'OnboardingName',
        gender: 'OnboardingBirthdate',
        categories: 'OnboardingGender',
        location: 'OnboardingCategories',
      };
      navigation.navigate(stepRouteMap[prevStepName] as any);
    }
  }, [route, navigation]);

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
        birthdate: 'OnboardingBirthdate',
        gender: 'OnboardingGender',
        categories: 'OnboardingCategories',
        location: 'OnboardingLocation',
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

