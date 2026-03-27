import React, { useMemo } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import SJText from '../../../components/SJText';
import { getConditionPresentation } from '../../../utils/conditions';
import type { AppLanguage } from '../../../types/language';

const CONDITION_KEYS = ['mint', 'new', 'like_new', 'excellent', 'good', 'fair', 'poor'];

interface FilterConditionScreenProps {
  selectedConditions: string[];
  onToggleCondition: (condition: string) => void;
  t: (key: string, options?: { defaultValue?: string }) => string;
  language: AppLanguage;
}

const FilterConditionScreen: React.FC<FilterConditionScreenProps> = ({
  selectedConditions,
  onToggleCondition,
  t,
  language,
}) => {
  const rows = useMemo(
    () =>
      CONDITION_KEYS.map((condition) => {
        const presentation = getConditionPresentation({
          condition,
          language,
          translate: t,
        });
        return {
          key: condition,
          emoji: presentation?.emoji || '❓',
          label: presentation?.label || condition,
        };
      }),
    [language, t]
  );

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => {
        const selected = selectedConditions.includes(item.key);
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.row}
            onPress={() => onToggleCondition(item.key)}
          >
            <View style={styles.leftContent}>
              <SJText style={styles.emoji}>{item.emoji}</SJText>
              <SJText style={styles.label}>{item.label}</SJText>
            </View>
            <View style={[styles.checkbox, selected && styles.checkboxSelected]} />
          </TouchableOpacity>
        );
      }}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  row: {
    minHeight: 54,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  emoji: {
    fontSize: 18,
    marginRight: 12,
  },
  label: {
    fontSize: 18,
    color: '#fff',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#8b8b8b',
  },
  checkboxSelected: {
    borderColor: '#2d8cff',
    backgroundColor: '#2d8cff',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#303030',
  },
});

export default FilterConditionScreen;

