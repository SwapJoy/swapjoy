import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  headerButtonContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0,122,255,0.08)',
  },
  headerRightButtonContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(0,122,255,0.08)',
  },
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
