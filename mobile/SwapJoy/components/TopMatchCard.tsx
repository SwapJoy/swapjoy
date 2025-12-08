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

const { width, height } = Dimensions.get('window');

export const TOP_MATCH_CARD_WIDTH = width * 0.75;
export const TOP_MATCH_CARD_HEIGHT = height * 0.5; // Card height based on screen height

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
  profileImageUrl?: string;
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
}) => {
  const { language, t } = useLocalization();
  const displayTitle = (title ?? '').trim() || 'Untitled item';
  const ownerUsername = owner.username?.trim() || owner.displayName?.trim() || '';

  const { conditionPresentation, normalizedCategory } = useMemo(() => {
    const conditionPresentationResult = getConditionPresentation({
      condition,
      language,
      translate: t,
    });

    const normalizedCategoryResult = category?.trim();

    return {
      conditionPresentation: conditionPresentationResult,
      normalizedCategory: normalizedCategoryResult,
    };
  }, [category, condition, language, t]);

  return (
    <View>
      {ownerUsername.length > 0 ? (
        <View style={styles.ownerHeader}>
          {owner.profileImageUrl ? (
            <CachedImage
              uri={owner.profileImageUrl}
              style={styles.ownerProfileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.ownerProfileImagePlaceholder}>
              <Text style={styles.ownerProfileImageText}>
                {owner.initials || ownerUsername.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.ownerUsername} numberOfLines={1}>
            {ownerUsername}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.card, containerStyle]}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <View style={styles.mediaSection}>
          <CachedImage
            uri={imageUrl || 'https://via.placeholder.com/320x240'}
            style={styles.heroImage}
            resizeMode="cover"
            fallbackUri="https://picsum.photos/320/240?random=7"
          />
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
        </View>

        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {displayTitle}
            </Text>
            {price ? (
              <Text style={styles.priceText}>{price}</Text>
            ) : null}
          </View>

          {description ? (
            <Text
              style={styles.description}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {description}
            </Text>
          ) : null}

          {(conditionPresentation || normalizedCategory) && (
            <View style={styles.metaSection}>
              {normalizedCategory ? (
                <View style={styles.metaRowItem}>
                  <Text style={styles.metaLabelVertical}>Category</Text>
                  <View
                    style={[styles.chip, { backgroundColor: '#e2e8f0' }]}
                  >
                    <Text style={[styles.chipText, { color: '#0f172a' }]}>
                      {normalizedCategory}
                    </Text>
                  </View>
                </View>
              ) : null}

              {conditionPresentation ? (
                <View style={[styles.metaRowItem, styles.metaRowItemSpaced]}>
                  <Text style={styles.metaLabelVertical}>Condition</Text>
                  <View
                    style={[
                      styles.chip,
                      { backgroundColor: conditionPresentation.backgroundColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: conditionPresentation.textColor },
                      ]}
                    >
                      {conditionPresentation.label}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: TOP_MATCH_CARD_WIDTH,
    height: TOP_MATCH_CARD_HEIGHT,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginRight: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  ownerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    paddingLeft: 8,
    gap: 10,
  },
  ownerProfileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
  },
  ownerProfileImagePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerProfileImageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  ownerUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  mediaSection: {
    flex: 0.7,
    position: 'relative',
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
    color: '#000',
  },
  ownerSection: {
    marginTop: 8,
  },
  ownerValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '500',
    color: '#0f172a',
  },
  infoSection: {
    flex: 0.3,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
    maxHeight: 36, // 2 lines max (2 * lineHeight)
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
  metaSection: {
    marginTop: 12,
  },
  metaRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaRowItemSpaced: {
    marginTop: 8,
  },
  metaLabelVertical: {
    fontSize: 10,
    fontWeight: '300',
    fontStyle: 'italic',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginRight: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  suggestionsSlot: {
    marginTop: 12,
  },
  skeletonCard: {
    backgroundColor: '#f8fafc',
  },
  skeletonMedia: {
    flex: 0.7,
    width: '100%',
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
    <View style={styles.infoSection}>
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

