import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AppLanguage, LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '../types/language';

type LanguageSelectorVariant = 'compact' | 'list';

interface LanguageSelectorProps {
  selectedLanguage: AppLanguage;
  onSelect: (language: AppLanguage) => void | Promise<void>;
  variant?: LanguageSelectorVariant;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelect,
  variant = 'compact',
}) => {
  return (
    <View
      style={[
        styles.container,
        variant === 'list' ? styles.listContainer : styles.compactContainer,
      ]}
    >
      {SUPPORTED_LANGUAGES.map((language) => {
        const isActive = selectedLanguage === language;
        return (
          <TouchableOpacity
            key={language}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={[
              styles.option,
              variant === 'list' ? styles.listOption : styles.compactOption,
              isActive && styles.optionActive,
            ]}
            onPress={() => onSelect(language)}
          >
            <Text
              style={[
                styles.optionLabel,
                isActive && styles.optionLabelActive,
              ]}
            >
              {LANGUAGE_LABELS[language]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactContainer: {
    gap: 8,
  },
  listContainer: {
    gap: 12,
    flexDirection: 'column',
  },
  option: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 20,
  },
  compactOption: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  listOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  optionActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E6F0FF',
  },
  optionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  optionLabelActive: {
    color: '#004A99',
  },
});

export default LanguageSelector;




