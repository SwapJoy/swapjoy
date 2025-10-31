import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  headerButtonContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  headerRightButtonContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerStyle: {
    backgroundColor: '#fff',
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderBottomColor: Platform.OS === 'ios' ? '#C6C6C8' : '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 0.5 } : { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: Platform.OS === 'ios' ? 0 : 2,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  headerTitleStyle: {
    fontSize: Platform.OS === 'ios' ? 17 : 20,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    color: '#000',
  },
  tabBarStyle: {
    backgroundColor: '#fff',
    borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderTopColor: Platform.OS === 'ios' ? '#C6C6C8' : '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: Platform.OS === 'ios' ? 8 : 8,
    height: Platform.OS === 'ios' ? 83 : 60,
    shadowColor: '#000',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: -0.5 } : { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: Platform.OS === 'ios' ? 0 : 2,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  tabBarLabelStyle: {
    fontSize: Platform.OS === 'ios' ? 10 : 12,
    fontWeight: '500',
    marginTop: Platform.OS === 'ios' ? 2 : 0,
  },
  tabBarIconStyle: {
    marginTop: Platform.OS === 'ios' ? 2 : 0,
  },
});

export const colors = {
  primary: '#007AFF',
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
