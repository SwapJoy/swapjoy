import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import ExploreScreen from '../screens/ExploreScreen';
import OffersScreen from '../screens/OffersScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { styles, colors } from './MainTabNavigator.styles';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface MainTabNavigatorProps {
  onNavigateToAdd?: () => void;
}

const MainTabNavigator: React.FC<MainTabNavigatorProps> = ({ onNavigateToAdd }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.headerTitleStyle,
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity
            style={styles.headerButtonContainer}
            onPress={() => {
              if (onNavigateToAdd) {
                onNavigateToAdd();
              }
            }}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        ),
        headerRight: () => {
          const isProfile = route.name === 'Profile';
          return (
            <TouchableOpacity
              style={styles.headerRightButtonContainer}
              onPress={() => {
                if (isProfile) {
                  (navigation as any).navigate('ProfileSettings');
                } else {
                  (navigation as any).navigate('Search');
                }
              }}
            >
              <Ionicons 
                name={isProfile ? "settings-outline" : "search-outline"} 
                size={24} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          );
        },
        tabBarStyle: styles.tabBarStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarIconStyle: styles.tabBarIconStyle,
      })}
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
