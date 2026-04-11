import React from 'react';
import {View, StyleSheet, TouchableOpacity, ActivityIndicator, } from 'react-native';
import SJText from '../components/SJText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@navigation/MainTabNavigator.styles';

interface SWCategorySelectorProps {
  placeholder?: string;
  value: string | null;
  displayValue?: string;
  onPress: () => void;
  disabled?: boolean;
  showLoading?: boolean;
  required?: boolean;
  error?: string;
  showCoordinates?: boolean;
}

const SWCategorySelector: React.FC<SWCategorySelectorProps> = ({
  placeholder = 'Select category',
  value,
  displayValue,
  onPress,
  disabled = false,
  showLoading = false,
  required = false,
  error,
}) => {
  const hasValue = value !== null && value.length > 0;
  const showFloatingLabel = hasValue;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.selectorContainer, disabled && styles.selectorContainerDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {placeholder && (
          <View
            style={[
              styles.labelContainer,
              {
                opacity: showFloatingLabel ? 1 : 0,
              },
            ]}
            pointerEvents="none"
          >
            <SJText
              style={[
                styles.floatingLabel,
                {
                  color: colors.inputPlaceholder,
                },
              ]}
            >
              {placeholder}
              {required && <SJText style={styles.required}> *</SJText>}
            </SJText>
          </View>
        )}
        <View style={styles.contentWrapper}>
          <SJText
            style={[
              styles.selectorText,
              !hasValue && styles.selectorTextPlaceholder,
              disabled && styles.selectorTextDisabled,
            ]}
            numberOfLines={1}
          >
            {hasValue ? displayValue || value : placeholder}
          </SJText>
          {showLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : (
            <Ionicons name="chevron-down" size={20} color="#666" />
          )}
        </View>
        <View style={styles.bottomBorder} />
      </TouchableOpacity>
      {error && <SJText style={styles.errorText}>{error}</SJText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  selectorContainer: {
    position: 'relative',
    paddingTop: 20,
    paddingBottom: 8,
  },
  selectorContainerDisabled: {
    opacity: 0.6,
  },
  labelContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  floatingLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  required: {
    color: colors.textSemiDark,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
    paddingVertical: 8,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
  selectorTextPlaceholder: {
    color: colors.textSemiDark,
  },
  selectorTextDisabled: {
    color: colors.textSemiDark,
  },
  loadingContainer: {
    marginLeft: 8,
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#d1d1d6',
  },
  errorText: {
    fontSize: 12,
    color: colors.textSemiDark,
    marginTop: 4,
  },
});

export default SWCategorySelector;

