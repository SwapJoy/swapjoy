import React from 'react';
import { Text, StyleSheet, TextProps, TextStyle } from 'react-native';

interface SJTextProps extends TextProps {
  children?: React.ReactNode;
}

const SJText: React.FC<SJTextProps> = (props) => {
  const { style, children, ...restProps } = props;
  
  // Flatten both styles and merge as objects
  // This ensures proper merging regardless of whether style is a StyleSheet reference or object
  const mergedStyle = React.useMemo(() => {
    const defaultFontFlattened = StyleSheet.flatten(styles.defaultFont);
    
    if (!style) {
      return defaultFontFlattened;
    }
    
    const customStyleFlattened = StyleSheet.flatten(style);
    
    // Determine font family based on fontWeight
    const fontWeight = customStyleFlattened?.fontWeight;
    const isBold = fontWeight === 'bold' || fontWeight === '700' || fontWeight === '800' || fontWeight === '900';
    const fontFamily = isBold ? 'Noto Sans Georgian Bold' : 'Noto Sans Georgian';
    
    // Merge: defaultFont provides fontFamily, custom style overrides everything else
    return {
      ...defaultFontFlattened,
      ...customStyleFlattened,
      fontFamily, // Override with appropriate font family based on weight
    } as TextStyle;
  }, [style]);
  
  return (
    <Text style={mergedStyle} {...restProps}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultFont: {
    fontFamily: 'Noto Sans Georgian', // Use the exact name from your font file
  },
});

export default SJText;

