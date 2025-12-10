import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import ExploreScreen from '../screens/ExploreScreen';
import OffersScreen from '../screens/OffersScreen';
import ChatListScreen from '../screens/ChatListScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { styles, colors } from './MainTabNavigator.styles';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface MainTabNavigatorProps {
  onNavigateToAdd?: () => void;
}

const MainTabNavigator: React.FC<MainTabNavigatorProps> = ({ onNavigateToAdd }) => {
  const { unreadCount, totalUnreadChats } = useNotifications();
  const { isAuthenticated, isAnonymous } = useAuth();
  const navigation = useNavigation<any>();

  const navigateToSignIn = () => {
    navigation.navigate('EmailSignIn');
  };

  const handleTabPress = (tabName: string) => {
    // Allow access to Explore tab (SwapJoy) for everyone
    if (tabName === 'SwapJoy') {
      return true;
    }

    // Check if user is authenticated (not anonymous)
    if (!isAuthenticated || isAnonymous) {
      navigateToSignIn();
      return false; // Prevent navigation
    }

    return true; // Allow navigation
  };

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
                if (!isAuthenticated || isAnonymous) {
                  navigateToSignIn();
                } else if (onNavigateToAdd) {
                  onNavigateToAdd();
                }
              }}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        headerRight: () => {
          const isProfile = route.name === 'Profile';
          if (!isProfile) return null; // remove search from top bar for non-profile
          return (
            <TouchableOpacity
              style={styles.headerRightButtonContainer}
              onPress={() => (navigation as any).navigate('ProfileSettings')}
            >
              <Ionicons name="settings-outline" size={24} color={colors.primary} />
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
        name='SwapJoy'
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "compass" : "compass-outline"} 
              size={size} 
              color={color} 
            />
          ),
          // Font will be applied globally via Text.defaultProps and StyleSheet.create patch
        }}
      />
      <Tab.Screen
        name="Offers"
        component={OffersScreen}
        listeners={{
          tabPress: (e) => {
            if (!handleTabPress('Offers')) {
              e.preventDefault();
            }
          },
        }}
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
        name="Chats"
        component={ChatListScreen}
        listeners={{
          tabPress: (e) => {
            if (!handleTabPress('Chats')) {
              e.preventDefault();
            }
          },
        }}
        options={{
          tabBarBadge: totalUnreadChats > 0 ? (totalUnreadChats > 99 ? '99+' : totalUnreadChats) : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "chatbubbles" : "chatbubbles-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        listeners={{
          tabPress: (e) => {
            if (!handleTabPress('Notifications')) {
              e.preventDefault();
            }
          },
        }}
        options={{
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
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
        listeners={{
          tabPress: (e) => {
            if (!handleTabPress('Profile')) {
              e.preventDefault();
            }
          },
        }}
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
