import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  ActivityIndicator,
  TextInputProps,
} from 'react-native';
import SJText from './SJText';

interface SWInputFieldProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  showLoading?: boolean;
  maxLength?: number;
  required?: boolean;
  error?: string;
  multiline?: boolean;
  minHeight?: number;
  prefix?: string;
  leftButton?: React.ReactNode;
  rightButton?: React.ReactNode;
}

const SWInputField: React.FC<SWInputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  disabled = false,
  showLoading = false,
  maxLength,
  required = false,
  error,
  multiline = false,
  minHeight = 24,
  prefix,
  leftButton,
  rightButton,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const shouldFloat = isFocused || hasValue;
  
  const animatedLabelPosition = useRef(new Animated.Value(shouldFloat ? 1 : 0)).current;
  const animatedLabelSize = useRef(new Animated.Value(shouldFloat ? 1 : 0)).current;

  useEffect(() => {
    // Animate label when value changes or focus changes
    const shouldAnimateUp = isFocused || hasValue;
    
    Animated.parallel([
      Animated.timing(animatedLabelPosition, {
        toValue: shouldAnimateUp ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(animatedLabelSize, {
        toValue: shouldAnimateUp ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isFocused, hasValue, animatedLabelPosition, animatedLabelSize]);

  const handleFocus = () => {
    setIsFocused(true);
    if (textInputProps.onFocus) {
      textInputProps.onFocus({} as any);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (textInputProps.onBlur) {
      textInputProps.onBlur({} as any);
    }
  };

  const labelTop = animatedLabelPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  const labelFontSize = animatedLabelSize.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  const displayLabel = label || placeholder;
  const showFloatingLabel = isFocused || value.length > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, disabled && styles.inputContainerDisabled]}>
        {displayLabel && showFloatingLabel && (
          <Animated.View
            style={[
              styles.labelContainer,
              {
                top: labelTop,
              },
            ]}
            pointerEvents="none"
          >
            <Animated.Text
              style={[
                styles.floatingLabel,
                {
                  fontSize: labelFontSize,
                  color: isFocused ? '#007AFF' : '#8e8e93',
                },
              ]}
            >
              {displayLabel}
              {required && <SJText style={styles.required}> *</SJText>}
            </Animated.Text>
          </Animated.View>
        )}
        <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
          {leftButton && (
            <View style={styles.leftButtonContainer}>
              {leftButton}
            </View>
          )}
          {prefix && (
            <SJText style={styles.prefix}>{prefix}</SJText>
          )}
          <TextInput
            {...textInputProps}
            style={[
              styles.textInput,
              disabled && styles.textInputDisabled,
              multiline && styles.textInputMultiline,
            ]}
            placeholder={!hasValue && !isFocused ? placeholder : undefined}
            placeholderTextColor="#8e8e93"
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            maxLength={maxLength}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
          />
          {showLoading && !multiline && !rightButton && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          )}
          {rightButton && (
            <View style={styles.rightButtonContainer}>
              {rightButton}
            </View>
          )}
        </View>
        <View style={[styles.bottomBorder, isFocused && styles.bottomBorderFocused]} />
      </View>
      {maxLength && (
        <SJText style={styles.charCount}>
          {value.length}/{maxLength}
        </SJText>
      )}
      {error && <SJText style={styles.errorText}>{error}</SJText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  inputContainer: {
    position: 'relative',
    paddingTop: 20,
    paddingBottom: 8,
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
  labelContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  floatingLabel: {
    fontWeight: '600',
  },
  required: {
    color: '#FF3B30',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start',
  },
  leftButtonContainer: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtonContainer: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
    alignSelf: 'flex-start',
    paddingTop: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 0,
    minHeight: 24,
  },
  textInputDisabled: {
    color: '#8e8e93',
  },
  textInputMultiline: {
    minHeight: 40,
    maxHeight: 200,
    paddingTop: 8,
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
  bottomBorderFocused: {
    height: 2,
    backgroundColor: '#007AFF',
  },
  charCount: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
});

export default SWInputField;

