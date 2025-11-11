import React, { memo, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CachedImage from './CachedImage';
import { useLocalization } from '../localization';
import { getConditionPresentation } from '../utils/conditions';

const { width } = Dimensions.get('window');

export const TOP_MATCH_CARD_WIDTH = width * 0.75;

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

interface TopMatchCardOwner {
  initials: string;
  username?: string;
  displayName?: string;
}

interface TopMatchCardProps {
  title: string;
  price: string;
  description?: string;
  descriptionLines?: number;
  category?: string;
  condition?: string;
  imageUrl?: string;
  owner: TopMatchCardOwner;
  onPress: () => void;
  onLikePress?: (event: GestureResponderEvent) => void;
  containerStyle?: StyleProp<ViewStyle>;
  likeIconName?: keyof typeof Ionicons.glyphMap;
  likeIconColor?: string;
  likeActiveColor?: string;
  isLikeActive?: boolean;
  disableLikeButton?: boolean;
  swapSuggestions?: React.ReactNode;
}

const TopMatchCard: React.FC<TopMatchCardProps> = ({
  title,
  price,
  description,
  descriptionLines,
  category,
  condition,
  imageUrl,
  owner,
  onPress,
  onLikePress,
  containerStyle,
  likeIconName = 'heart-outline',
  likeIconColor = '#1f2933',
  likeActiveColor = '#ef4444',
  isLikeActive = false,
  disableLikeButton,
  swapSuggestions,
}) => {
  const { language, t } = useLocalization();
  const displayTitle = (title ?? '').trim() || 'Untitled item';
  const ownerUsername = owner.username?.trim() || owner.displayName?.trim() || '';

  const chips = useMemo(() => {
    const entries: Array<{ label: string; backgroundColor: string; textColor: string }> = [];

    const conditionPresentation = getConditionPresentation({
      condition,
      language,
      translate: t,
    });

    if (conditionPresentation) {
      entries.push(conditionPresentation);
    }

    const normalizedCategory = category?.trim();
    if (normalizedCategory) {
      entries.push({
        label: normalizedCategory,
        backgroundColor: '#e2e8f0',
        textColor: '#0f172a',
      });
    }

    return entries;
  }, [category, condition, language, t]);

  return (
    <TouchableOpacity
      style={[styles.card, containerStyle]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.mediaWrapper}>
        <CachedImage
          uri={imageUrl || 'https://via.placeholder.com/320x240'}
          style={styles.heroImage}
          resizeMode="cover"
          fallbackUri="https://picsum.photos/320/240?random=7"
        />

        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>{price}</Text>
        </View>

        {!disableLikeButton && (
          <TouchableOpacity
            style={[styles.likeButton, isLikeActive ? styles.likeButtonActive : null]}
            activeOpacity={0.6}
            onPress={onLikePress}
          >
            <Ionicons
              name={likeIconName}
              size={18}
              color={isLikeActive ? likeActiveColor : likeIconColor}
            />
          </TouchableOpacity>
        )}

        {ownerUsername.length > 0 ? (
          <View style={styles.ownerOverlay}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerAvatarText}>{owner.initials}</Text>
            </View>
            <Text style={styles.ownerName} numberOfLines={1}>
              {ownerUsername}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {displayTitle}
        </Text>

        {description ? (
          <Text
            style={styles.description}
            numberOfLines={descriptionLines ?? 3}
            ellipsizeMode="tail"
          >
            {description}
          </Text>
        ) : null}

        {chips.length > 0 ? (
          <View style={styles.chipsRow}>
            {chips.map((chip) => (
              <View
                key={`${chip.label}-${chip.backgroundColor}`}
                style={[styles.chip, { backgroundColor: chip.backgroundColor }]}
              >
                <Text style={[styles.chipText, { color: chip.textColor }]}>
                  {chip.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {swapSuggestions ? (
          <View style={styles.suggestionsSlot}>{swapSuggestions}</View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: TOP_MATCH_CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  mediaWrapper: {
    position: 'relative',
    height: 170,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  likeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffffdd',
  },
  likeButtonActive: {
    backgroundColor: '#fee2e2',
  },
  priceBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  ownerOverlay: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ffffffee',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  ownerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f172a',
  },
  ownerName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
    minHeight: 54,
    maxHeight: 54,
  },
  chipsRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
  },
  suggestionsSlot: {
    marginTop: 12,
  },
  skeletonCard: {
    backgroundColor: '#f8fafc',
  },
  skeletonMedia: {
    width: '100%',
    height: 170,
  },
  skeletonLineLarge: {
    width: '70%',
    height: 18,
    borderRadius: 9,
    marginBottom: 12,
  },
  skeletonLineMedium: {
    width: '55%',
    height: 14,
    borderRadius: 7,
    marginBottom: 10,
  },
  skeletonLineSmall: {
    width: '80%',
    height: 12,
    borderRadius: 6,
    marginBottom: 14,
  },
  skeletonChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skeletonChip: {
    width: 48,
    height: 18,
    borderRadius: 9,
  },
  skeletonChipWide: {
    width: 68,
    height: 18,
    borderRadius: 9,
  },
  fadePlaceholder: {
    backgroundColor: '#e2e8f0',
  },
});

export const TopMatchCardSkeleton = memo(({ style }: { style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.card, styles.skeletonCard, style]}>
    <FadePlaceholder style={styles.skeletonMedia} borderRadius={16} />
    <View style={styles.content}>
      <FadePlaceholder style={styles.skeletonLineLarge} />
      <FadePlaceholder style={styles.skeletonLineMedium} />
      <FadePlaceholder style={styles.skeletonLineSmall} />
      <View style={styles.skeletonChipRow}>
        <FadePlaceholder style={styles.skeletonChip} />
        <FadePlaceholder style={styles.skeletonChipWide} />
      </View>
    </View>
  </View>
));

export default memo(TopMatchCard);

