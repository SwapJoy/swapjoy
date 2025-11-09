import React, { memo, ReactNode } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import CachedImage from './CachedImage';

export type ItemCardVariant = 'list' | 'horizontal' | 'grid';

export interface ItemCardChip {
  label: string;
  backgroundColor?: string;
  textColor?: string;
}

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
});

export default ItemCard;

