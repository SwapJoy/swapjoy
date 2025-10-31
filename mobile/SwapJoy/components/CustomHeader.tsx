import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { styles, colors } from './CustomHeader.styles';

interface CustomHeaderProps {
  showSearch?: boolean;
  showGear?: boolean;
  onSearchPress?: () => void;
  onGearPress?: () => void;
  onCreatePress?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = React.memo(({
  showSearch = true,
  showGear = false,
  onSearchPress,
  onGearPress,
  onCreatePress,
}) => {
  const navigation = useNavigation();

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
          <Ionicons name="add" size={18} color={colors.primary} />
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
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

CustomHeader.displayName = 'CustomHeader';

export default CustomHeader;
