import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import SJText from './SJText';
import { getConditionPresentation } from '../utils/conditions';
import { useLocalization } from '../localization';
import { colors } from '@navigation/MainTabNavigator.styles';

interface ConditionChipProps {
  condition: string;
  selected?: boolean;
  compact?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const ConditionChip: React.FC<ConditionChipProps> = ({
  condition,
  selected = false,
  compact = false,
  onPress,
  style,
}) => {
  const { language, t } = useLocalization();
  
  const conditionPresentation = getConditionPresentation({
    condition,
    language,
    translate: t,
  });

  if (!conditionPresentation) {
    return null;
  }

  const chipContent = (
    <View
      style={[
        styles.chip,
        compact && styles.chipCompact,
        {
          backgroundColor: conditionPresentation.backgroundColor,
          borderWidth: selected ? 3 : 0,
          borderColor: selected ? colors.white : 'transparent',
        },
        selected && styles.chipSelected,
        style,
      ]}
    >
      <SJText
        style={[
          styles.chipText,
          compact && styles.chipTextCompact,
        ]}
      >
        {conditionPresentation.label}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  chipSelected: {
    transform: [{ scale: 1.05 }],
    borderColor: colors.primaryYellow,
    borderWidth: 3,
  },
  chipCompact: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textColor,
  },
  chipTextCompact: {
    fontSize: 11,
  },
});

export default ConditionChip;
