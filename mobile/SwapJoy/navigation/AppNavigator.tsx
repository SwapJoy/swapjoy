import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import OnboardingScreen from '../screens/OnboardingScreen';
import PhoneSignInScreen from '../screens/PhoneSignInScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import MainPageContainer from '../screens/MainPageContainer';
import CreateListingScreen from '../screens/CreateListingScreen';
import AddItemScreen from '../screens/AddItemScreen';
import CameraScreen from '../screens/CameraScreen';
import ItemDetailsFormScreen from '../screens/ItemDetailsFormScreen';
import ItemPreviewScreen from '../screens/ItemPreviewScreen';
import ItemDetailsScreen from '../screens/ItemDetailsScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import BundleItemsScreen from '../screens/BundleItemsScreen';
import OfferCreateScreen from '../screens/OfferCreateScreen';
import OfferPreviewScreen from '../screens/OfferPreviewScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return null; // Or a loading component
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "MainTabs" : "Onboarding"}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
            borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
            borderBottomColor: Platform.OS === 'ios' ? '#C6C6C8' : '#E0E0E0',
            shadowColor: Platform.OS === 'ios' ? '#000' : '#000',
            shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 0.5 } : { width: 0, height: 2 },
            shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.1,
            shadowRadius: Platform.OS === 'ios' ? 0 : 2,
            elevation: Platform.OS === 'android' ? 4 : 0,
          },
          headerTitleStyle: {
            fontSize: Platform.OS === 'ios' ? 17 : 20,
            fontWeight: Platform.OS === 'ios' ? '600' : '500',
            color: '#000',
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
              options={{ 
                title: 'Item Details',
                headerShown: false,
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
              name="Search" 
              component={SearchScreen}
              options={{ title: 'Search' }}
            />
          </>
        ) : (
          // Unauthenticated screens
          <>
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="PhoneSignIn" 
              component={PhoneSignInScreen}
              options={{ title: 'Sign In' }}
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
};

export default AppNavigator;
