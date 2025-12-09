import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
  children?: React.ReactNode;
}

const DEFAULT_FONT_FAMILY = 'Noto Sans Georgian';

/**
 * Custom Text component that applies Noto Sans Georgian font by default.
 * This ensures all text in the app uses the Georgian font without needing
 * to specify it in every component.
 * 
 * This component automatically injects the fontFamily into all styles,
 * ensuring it works even when components use StyleSheet.create().
 */
export const Text: React.FC<TextProps> = React.forwardRef<any, TextProps>(
  ({ style, ...props }, ref) => {
    // Inject fontFamily into style - this works even with StyleSheet styles
    const mergedStyle = React.useMemo(() => {
      if (Array.isArray(style)) {
        // For array styles, prepend fontFamily so it can be overridden if needed
        return [{ fontFamily: DEFAULT_FONT_FAMILY }, ...style];
      } else if (style && typeof style === 'object') {
        // For object styles, merge fontFamily (allow explicit override)
        return {
          fontFamily: DEFAULT_FONT_FAMILY,
          ...style,
        };
      }
      return { fontFamily: DEFAULT_FONT_FAMILY };
    }, [style]);

    return (
      <RNText
        {...props}
        style={mergedStyle}
        ref={ref}
      />
    );
  }
);

Text.displayName = 'Text';

// Copy static properties from RNText
Object.keys(RNText).forEach((key) => {
  if (key !== 'defaultProps') {
    (Text as any)[key] = (RNText as any)[key];
  }
});

export default Text;

