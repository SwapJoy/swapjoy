import React from 'react';
import { Text, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import ExploreScreen from '../screens/ExploreScreen';
import OffersScreen from '../screens/OffersScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface MainTabNavigatorProps {
  onNavigateToAdd?: () => void;
}

const MainTabNavigator: React.FC<MainTabNavigatorProps> = ({ onNavigateToAdd }) => {
  return (
    <Tab.Navigator
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
        headerLeft: ({ navigation }) => (
          <TouchableOpacity
            style={{
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 16,
            }}
            onPress={() => {
              if (onNavigateToAdd) {
                onNavigateToAdd();
              }
            }}
          >
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        ),
        headerRight: ({ route, navigation }) => {
          const isProfile = route?.name === 'Profile';
          return (
            <TouchableOpacity
              style={{
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
              onPress={() => {
                if (navigation) {
                  if (isProfile) {
                    (navigation as any).navigate('ProfileSettings');
                  } else {
                    (navigation as any).navigate('Search');
                  }
                }
              }}
            >
              <Ionicons 
                name={isProfile ? "settings-outline" : "search-outline"} 
                size={24} 
                color="#007AFF" 
              />
            </TouchableOpacity>
          );
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
          borderTopColor: Platform.OS === 'ios' ? '#C6C6C8' : '#E0E0E0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: Platform.OS === 'ios' ? 8 : 8,
          height: Platform.OS === 'ios' ? 83 : 60,
          shadowColor: Platform.OS === 'ios' ? '#000' : '#000',
          shadowOffset: Platform.OS === 'ios' ? { width: 0, height: -0.5 } : { width: 0, height: 2 },
          shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.1,
          shadowRadius: Platform.OS === 'ios' ? 0 : 2,
          elevation: Platform.OS === 'android' ? 8 : 0,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: Platform.OS === 'ios' ? 10 : 12,
          fontWeight: Platform.OS === 'ios' ? '500' : '500',
          marginTop: Platform.OS === 'ios' ? 2 : 0,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'ios' ? 2 : 0,
        },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "compass" : "compass-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Offers"
        component={OffersScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "swap-horizontal" : "swap-horizontal-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "notifications" : "notifications-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
