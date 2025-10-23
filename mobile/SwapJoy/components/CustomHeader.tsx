import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface CustomHeaderProps {
  showSearch?: boolean;
  showGear?: boolean;
  onSearchPress?: () => void;
  onGearPress?: () => void;
  onCreatePress?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  showSearch = true,
  showGear = false,
  onSearchPress,
  onGearPress,
  onCreatePress,
}) => {
  const navigation = useNavigation();
  const route = useRoute();

  const handleCreatePress = () => {
    if (onCreatePress) {
      onCreatePress();
    } else {
      navigation.navigate('CreateListing' as never);
    }
  };

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      navigation.navigate('Search' as never);
    }
  };

  const handleGearPress = () => {
    if (onGearPress) {
      onGearPress();
    } else {
      navigation.navigate('ProfileSettings' as never);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.leftButton}
          onPress={handleCreatePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add" size={18} color="#007AFF" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>SwapJoy</Text>
        </View>

        <TouchableOpacity
          style={styles.rightButton}
          onPress={showGear ? handleGearPress : handleSearchPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={showGear ? "settings-outline" : "search-outline"} 
            size={18} 
            color="#007AFF" 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderBottomColor: Platform.OS === 'ios' ? '#C6C6C8' : '#E0E0E0',
    shadowColor: Platform.OS === 'ios' ? '#000' : '#000',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 0.5 } : { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.1,
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

export default CustomHeader;
