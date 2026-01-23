import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import SJText from './SJText';
import { colors } from '@navigation/MainTabNavigator.styles';

interface CategoryChipProps {
  name: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  name,
  selected = false,
  onPress,
  style,
}) => {
  const chipContent = (
    <View
      style={[
        styles.chip,
        selected && styles.chipSelected,
        style,
      ]}
    >
      <SJText
        style={[
          styles.chipText,
          selected && styles.chipTextSelected,
        ]}
      >
        {name}
      </SJText>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {chipContent}
      </TouchableOpacity>
    );
  }

  return chipContent;
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.8,
    borderColor: colors.white,
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: colors.primaryYellow,
    borderColor: colors.primaryYellow,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '300',
    color: colors.white,
  },
  chipTextSelected: {
    color: colors.primaryDark,
    fontWeight: '400',
  },
});

export default CategoryChip;
