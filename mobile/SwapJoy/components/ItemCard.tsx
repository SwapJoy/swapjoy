import React, { memo, ReactNode, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
} from 'react-native';
import CachedImage from './CachedImage';

export type ItemCardVariant = 'list' | 'horizontal' | 'grid';

export interface ItemCardChip {
  label: string;
  backgroundColor?: string;
  textColor?: string;
}

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
  description?: string;
  priceLabel?: string;
  metaRightLabel?: string | null;
  imageUri?: string | null;
  fallbackImageUri?: string;
  placeholderLabel?: string;
  chips?: ItemCardChip[];
  onPress?: () => void;
  variant?: ItemCardVariant;
  style?: StyleProp<ViewStyle>;
  imageHeight?: number;
  titleLines?: number;
  descriptionLines?: number;
  metaBadges?: Array<{ label: string; backgroundColor?: string; textColor?: string }>;
  favoriteButton?: ReactNode;
  ownerHandle?: string;
  conditionBadge?: ItemCardChip;
}

const ItemCard: React.FC<ItemCardProps> = memo(
  ({
    title,
    description,
    priceLabel,
    metaRightLabel,
    imageUri,
    fallbackImageUri = 'https://via.placeholder.com/200x150',
    placeholderLabel = 'No image',
    chips,
    onPress,
    variant = 'list',
    style,
    imageHeight,
    titleLines,
    descriptionLines,
    metaBadges,
    favoriteButton,
    ownerHandle,
    conditionBadge,
  }) => {
    const computedImageHeight =
      imageHeight ??
      (variant === 'horizontal' ? 180 : variant === 'grid' ? 200 : 220);
    const computedTitleLines = titleLines ?? (variant === 'horizontal' ? 1 : 2);
    const computedDescriptionLines = descriptionLines ?? 2;

    const hasChips = Array.isArray(chips) && chips.length > 0;
    const hasMetaBadges = Array.isArray(metaBadges) && metaBadges.length > 0;
    const hasMetaRight = !!metaRightLabel;

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
              <Text style={styles.imagePlaceholderText}>{placeholderLabel}</Text>
            </View>
          )}

          {hasMetaBadges || priceLabel ? (
            <View style={styles.metadataOverlay}>
              <View style={styles.metadataRow}>
                {priceLabel ? (
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>{priceLabel}</Text>
                  </View>
                ) : null}
                {metaBadges?.map((badge, index) => (
                  <View
                    key={`${badge.label}-${index}`}
                    style={[
                      styles.metaBadge,
                      badge.backgroundColor ? { backgroundColor: badge.backgroundColor } : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.metaBadgeText,
                        badge.textColor ? { color: badge.textColor } : null,
                      ]}
                    >
                      {badge.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {favoriteButton ? <View style={styles.favoriteButtonWrapper}>{favoriteButton}</View> : null}

          {conditionBadge ? (
            <View
              style={[
                styles.conditionBadge,
                conditionBadge.backgroundColor ? { backgroundColor: conditionBadge.backgroundColor } : null,
              ]}
            >
              <Text
                style={[
                  styles.conditionBadgeText,
                  conditionBadge.textColor ? { color: conditionBadge.textColor } : null,
                ]}
              >
                {conditionBadge.label}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <Text numberOfLines={computedTitleLines} style={styles.title}>
            {title}
          </Text>

          {ownerHandle ? (
            <Text style={styles.ownerHandle} numberOfLines={1}>
              {ownerHandle.startsWith('@') ? ownerHandle : `@${ownerHandle}`}
            </Text>
          ) : null}

          {description ? (
            <Text
              numberOfLines={computedDescriptionLines}
              ellipsizeMode="tail"
              style={styles.description}
            >
              {description}
            </Text>
          ) : null}

          {hasMetaRight ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaRight}>{metaRightLabel}</Text>
            </View>
          ) : null}

          {hasChips ? (
            <View style={styles.chipsRow}>
              {chips!.map((chip, index) => (
                <View
                  key={`${chip.label}-${index}`}
                  style={[
                    styles.chip,
                    chip.backgroundColor ? { backgroundColor: chip.backgroundColor } : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      chip.textColor ? { color: chip.textColor } : null,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }
);

ItemCard.displayName = 'ItemCard';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
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
    fontSize: 12,
    color: '#94a3b8',
  },
  metadataOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  priceBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  favoriteButtonWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  metaBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  content: {
    padding: 14,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  ownerHandle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  metaRight: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  conditionBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  conditionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
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
          borderRadius={20}
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

