import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderBottomColor: Platform.OS === 'ios' ? '#C6C6C8' : '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 0.5 } : { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: Platform.OS === 'ios' ? 0 : 2,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: Platform.OS === 'ios' ? 28 : 36,
    minHeight: Platform.OS === 'ios' ? 28 : 36,
    maxHeight: Platform.OS === 'ios' ? 28 : 36,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  leftButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 14 : 16,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    color: '#000',
    textAlign: 'center',
  },
});

export const colors = {
  primary: '#007AFF',
  inactive: '#8E8E93',
  border: Platform.OS === 'ios' ? '#C6C6C8' : '#E0E0E0',
  white: '#fff',
  black: '#000',
};
