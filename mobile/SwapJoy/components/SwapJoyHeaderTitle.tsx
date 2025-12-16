// SwapJoyHeaderTitle.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Pick ONE:
// A) Best: use a real handwritten font (recommended)
// B) Fallback: use system fonts (won't be as "comic")

type Props = {
  width?: number;
  height?: number;
};

export default function SwapJoyHeaderTitle({ width = 280, height = 64 }: Props) {
  return (
    <View style={[styles.box, { width, height }]}>
      <Text numberOfLines={1} allowFontScaling={false} style={styles.text}>
        SwapJoy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    // EXACT bounds, no padding/margin
    padding: 0,
    margin: 0,
    overflow: 'hidden',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',

    // Helps Android measure tightly
    includeFontPadding: false as any,
  },
  text: {
    color: '#000',
    padding: 0,
    margin: 0,

    // For best results, replace with your custom font name.
    // e.g. "ComicNeue-Bold", "PatrickHand-Regular", etc.
    fontFamily:
      Platform.select({
        ios: 'PatrickHand-Regular',
        android: 'PatrickHand-Regular',
      }) ?? undefined,

    // Tune these once based on your font
    fontSize: 32,
    lineHeight: 32,

    // Remove extra spacing / padding effects
    includeFontPadding: false as any, // Android
    textAlignVertical: 'top' as any,  // Android

    // Slight organic feel
    letterSpacing: 0.2,
  },
});