import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import SJText from './SJText';
import { getConditionPresentation } from '../utils/conditions';
import { useLocalization } from '../localization';

interface ConditionChipProps {
  condition: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const ConditionChip: React.FC<ConditionChipProps> = ({
  condition,
  selected = false,
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
        {
          backgroundColor: conditionPresentation.backgroundColor,
        },
        selected && styles.chipSelected,
        style,
      ]}
    >
      <SJText style={styles.chipEmoji}>{conditionPresentation.emoji}</SJText>
      <SJText
        style={[
          styles.chipText,
          { color: conditionPresentation.textColor },
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
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  chipSelected: {
    opacity: 0.9,
    transform: [{ scale: 1.05 }],
  },
  chipEmoji: {
    fontSize: 12,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ConditionChip;
