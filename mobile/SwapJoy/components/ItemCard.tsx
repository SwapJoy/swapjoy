import React, { memo, ReactNode, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
} from 'react-native';
import CachedImage from './CachedImage';
import SJText from './SJText';

export type ItemCardVariant = 'list' | 'horizontal' | 'grid';

const useFadeAnimation = () => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return opacity;
};

const FadePlaceholder: React.FC<{ style?: StyleProp<ViewStyle>; borderRadius?: number }> = ({
  style,
  borderRadius,
}) => {
  const opacity = useFadeAnimation();

  return (
    <Animated.View
      style={[
        styles.fadePlaceholder,
        { opacity },
        borderRadius !== undefined ? { borderRadius } : null,
        style,
      ]}
    />
  );
};

interface ItemCardProps {
  title: string;
  priceLabel?: string;
  imageUri?: string | null;
  fallbackImageUri?: string;
  placeholderLabel?: string;
  onPress?: () => void;
  variant?: ItemCardVariant;
  style?: StyleProp<ViewStyle>;
  imageHeight?: number;
  titleLines?: number;
  favoriteButton?: ReactNode;
  conditionColor?: string;
}

const ItemCard: React.FC<ItemCardProps> = memo(
  ({
    title,
    priceLabel,
    imageUri,
    fallbackImageUri = 'https://via.placeholder.com/200x150',
    placeholderLabel = 'No image',
    onPress,
    variant = 'list',
    style,
    imageHeight,
    titleLines,
    favoriteButton,
    conditionColor,
  }) => {
    const computedImageHeight =
      imageHeight ??
      (variant === 'horizontal' ? 180 : variant === 'grid' ? 240 : 260);
    const computedTitleLines = titleLines ?? (variant === 'horizontal' ? 1 : 2);
    const titleLabel = priceLabel ? `${priceLabel} - ${title}` : title;

    return (
      <TouchableOpacity
        activeOpacity={onPress ? 0.85 : 1}
        onPress={onPress}
        disabled={!onPress}
        style={[styles.container, style]}
      >
        <View style={styles.imageWrapper}>
          {imageUri ? (
            <CachedImage
              uri={imageUri}
              fallbackUri={fallbackImageUri}
              style={[styles.image, { height: computedImageHeight }]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder, { height: computedImageHeight }]}>
              <SJText style={styles.imagePlaceholderText}>{placeholderLabel}</SJText>
            </View>
          )}

          {favoriteButton ? <View style={styles.favoriteButtonWrapper}>{favoriteButton}</View> : null}
          <View style={[styles.conditionLine, conditionColor ? { backgroundColor: conditionColor } : null]} />
        </View>

        <View style={styles.content}>
          <SJText 
            numberOfLines={computedTitleLines} 
            ellipsizeMode="tail"
            style={styles.title}
          >
            {titleLabel}
          </SJText>
        </View>
      </TouchableOpacity>
    );
  }
);

ItemCard.displayName = 'ItemCard';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161200f',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    backgroundColor: '#e2e8f0',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12
  },
  favoriteButtonWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  conditionLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingLeft: 6,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '400'
  },
  skeletonCard: {
    pointerEvents: 'none',
  },
  skeletonImage: {
    width: '100%',
    height: 200,
  },
  skeletonTitle: {
    width: '70%',
    height: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  skeletonSubtitle: {
    width: '55%',
    height: 14,
    borderRadius: 7,
    marginBottom: 8,
  },
  skeletonLineSmall: {
    width: '80%',
    height: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  skeletonChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  skeletonChip: {
    width: 56,
    height: 18,
    borderRadius: 9,
  },
  skeletonChipSmall: {
    width: 44,
    height: 18,
    borderRadius: 9,
  },
  fadePlaceholder: {
    backgroundColor: '#e2e8f0',
  },
});

export const ItemCardSkeleton = memo(
  ({ variant = 'list', style }: { variant?: ItemCardVariant; style?: StyleProp<ViewStyle> }) => {
    const imageHeight =
      variant === 'horizontal' ? 180 : variant === 'grid' ? 200 : 220;

    const showChips = variant !== 'list';

    return (
      <View style={[styles.container, styles.skeletonCard, style]}>
        <FadePlaceholder
          style={[styles.skeletonImage, { height: imageHeight }]}
          borderRadius={4}
        />
        <View style={styles.content}>
          <FadePlaceholder style={styles.skeletonTitle} />
          <FadePlaceholder style={styles.skeletonSubtitle} />
          <FadePlaceholder style={styles.skeletonLineSmall} />
          {showChips ? (
            <View style={styles.skeletonChipRow}>
              <FadePlaceholder style={styles.skeletonChip} />
              <FadePlaceholder style={styles.skeletonChipSmall} />
            </View>
          ) : null}
        </View>
      </View>
    );
  }
);

export default ItemCard;

