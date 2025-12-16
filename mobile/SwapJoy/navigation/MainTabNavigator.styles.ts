import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  headerButtonContainer: {
    width: 40,
    height: 40,
    paddingLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  headerRightButtonContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4
  },
  headerStyle: {
    backgroundColor: '#ffde21', // Same as colors.primaryYellow
  },
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.3,
    fontFamily: 'Noto Sans Georgian',
  },
  tabBarStyle: {
    backgroundColor: '#161200',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: Platform.OS === 'ios' ? 8 : 8,
    height: Platform.OS === 'ios' ? 83 : 60,
  },
  tabBarLabelStyle: {
    fontSize: Platform.OS === 'ios' ? 10 : 12,
    fontWeight: '500',
    marginTop: Platform.OS === 'ios' ? 2 : 0,
    fontFamily: 'Noto Sans Georgian',
  },
  tabBarIconStyle: {
    marginTop: Platform.OS === 'ios' ? 2 : 0,
  },
});

export const colors = {
  primary: '#000',
  primaryYellow: '#ffde21',
  inactive: '#8E8E93',
  border: Platform.OS === 'ios' ? '#C6C6C8' : '#E0E0E0',
  white: '#fff',
  shadow: '#000',
};

export const iconSize = {
  small: 20,
  medium: 24,
  large: 28,
};
