import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Keyboard, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SJText from './SJText';
import { colors } from '@navigation/MainTabNavigator.styles';

interface PrimaryButtonProps {
  onPress: () => void;
  disabled?: boolean;
  label: string;
  showArrow?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_WIDTH = SCREEN_WIDTH * 0.92;
const HALF_WIDTH = SCREEN_WIDTH * 0.5;
const DEFAULT_PADDING = 24;

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onPress,
  disabled = false,
  label,
  showArrow = true,
}) => {
  const insets = useSafeAreaInsets();
  const bottomOffset = useRef(new Animated.Value(0)).current;
  const paddingBottom = useRef(new Animated.Value(insets.bottom + 8)).current;
  const buttonWidth = useRef(new Animated.Value(HALF_WIDTH)).current; // Start with half width (keyboard down)
  const containerPadding = useRef(new Animated.Value(DEFAULT_PADDING)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardWillShow = Keyboard.addListener(showEvent, (e) => {
      const keyboardHeight = e.endCoordinates.height;
      Animated.parallel([
        Animated.timing(bottomOffset, {
          toValue: keyboardHeight,
          duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
          useNativeDriver: false,
        }),
        Animated.timing(paddingBottom, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
          useNativeDriver: false,
        }),
        Animated.timing(buttonWidth, {
          toValue: SCREEN_WIDTH, // Full width (100%) when keyboard is up, no padding
          duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
          useNativeDriver: false,
        }),
        Animated.timing(containerPadding, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
          useNativeDriver: false,
        }),
      ]).start();
    });

    const keyboardWillHide = Keyboard.addListener(hideEvent, (e) => {
      Animated.parallel([
        Animated.timing(bottomOffset, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
          useNativeDriver: false,
        }),
        Animated.timing(paddingBottom, {
          toValue: insets.bottom + 8,
          duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
          useNativeDriver: false,
        }),
        Animated.timing(buttonWidth, {
          toValue: HALF_WIDTH, // Half width when keyboard is down
          duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
          useNativeDriver: false,
        }),
        Animated.timing(containerPadding, {
          toValue: DEFAULT_PADDING,
          duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
          useNativeDriver: false,
        }),
      ]).start();
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [bottomOffset, paddingBottom, buttonWidth, containerPadding, insets.bottom]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          paddingHorizontal: containerPadding,
          paddingBottom: paddingBottom,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          {
            width: buttonWidth,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.buttonInner}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <SJText style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
            {label}
          </SJText>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.primaryDark,
    paddingTop: 8,
    alignItems: 'center',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        // Ensure it's positioned relative to the window, not parent
      },
    }),
  },
  button: {
    backgroundColor: colors.primaryYellow,
    paddingVertical: 16,
    // No borderRadius
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  buttonTextDisabled: {
    color: '#999',
  },
});

export default PrimaryButton;
