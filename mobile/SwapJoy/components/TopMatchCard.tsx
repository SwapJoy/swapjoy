import React, { memo, useEffect, useMemo, useRef } from 'react';
import {
  View,
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
import { useCategories } from '../contexts/CategoriesContext';
import SJText from './SJText';

const { width, height } = Dimensions.get('window');

export const TOP_MATCH_CARD_WIDTH = width * 0.75;
export const TOP_MATCH_CARD_HEIGHT = height * 0.55; // Card height based on screen height

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
  userId?: string;
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
  onOwnerPress?: () => void;
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
  onOwnerPress,
  onLikePress,
  containerStyle,
  likeIconName = 'heart-outline',
  likeIconColor = '#1f2933',
  likeActiveColor = '#ef4444',
  isLikeActive = false,
  disableLikeButton,
}) => {
  const { language, t } = useLocalization();
  const { getCategoryByName } = useCategories();
  const displayTitle = (title ?? '').trim() || 'Untitled item';
  const ownerUsername = owner.username?.trim() || owner.displayName?.trim() || '';

  const handleOwnerPress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    if (onOwnerPress) {
      onOwnerPress();
    }
  };

  const { conditionPresentation, normalizedCategory, categoryIcon } = useMemo(() => {
    const conditionPresentationResult = getConditionPresentation({
      condition,
      language,
      translate: t,
    });

    const normalizedCategoryResult = category?.trim();
    const categoryData = normalizedCategoryResult ? getCategoryByName(normalizedCategoryResult) : null;
    const categoryIconResult = categoryData?.icon || '📦'; // Default emoji if no icon

    return {
      conditionPresentation: conditionPresentationResult,
      normalizedCategory: normalizedCategoryResult,
      categoryIcon: categoryIconResult,
    };
  }, [category, condition, language, t, getCategoryByName]);

  return (
    <View>
      {ownerUsername.length > 0 ? (
        <TouchableOpacity
          style={styles.ownerHeader}
          onPress={handleOwnerPress}
          activeOpacity={0.7}
          disabled={!onOwnerPress}
        >
          {owner.profileImageUrl ? (
            <CachedImage
              uri={owner.profileImageUrl}
              style={styles.ownerProfileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.ownerProfileImagePlaceholder}>
              <SJText style={styles.ownerProfileImageText}>
                {owner.initials || ownerUsername.charAt(0).toUpperCase()}
              </SJText>
            </View>
          )}
          <SJText style={styles.ownerUsername} numberOfLines={1}>
            {ownerUsername}
          </SJText>
        </TouchableOpacity>
      ) : null}

      <View style={styles.cardWrapper}>
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
          {conditionPresentation && (
            <View
              style={[
                styles.conditionBadge,
                { backgroundColor: conditionPresentation.backgroundColor },
              ]}
            >
              <SJText
                style={[
                  styles.conditionText,
                  { color: conditionPresentation.textColor },
                ]}
              >
                {conditionPresentation.label}
              </SJText>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <SJText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {displayTitle}
            </SJText>
          </View>

          {description ? (
            <SJText
              style={styles.description}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {description}
            </SJText>
          ) : null}

          {normalizedCategory && (
            <View style={styles.metaSection}>
              <View style={styles.chipsRow}>
                <View
                  style={[styles.chip, { backgroundColor: '#e2e8f0' }]}
                >
                  <SJText style={styles.chipEmoji}>{categoryIcon}</SJText>
                  <SJText style={[styles.chipText, { color: '#0f172a' }]}>
                    {normalizedCategory}
                  </SJText>
                </View>
              </View>
            </View>
          )}

          {price ? (
            <SJText style={styles.priceText}>{price}</SJText>
          ) : null}
        </View>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: TOP_MATCH_CARD_WIDTH,
    height: TOP_MATCH_CARD_HEIGHT,
    marginRight: 8,
    marginBottom: 8, // Add space for shadow to be visible at bottom
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
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
    fontWeight: 'bold', // or use '700' for numeric weight
    color: '#0f172a',
  },
  ownerUsername: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    flex: 1,
  },
  mediaSection: {
    flex: 0.75,
    position: 'relative',
  },
  infoSection: {
    flex: 0.25,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'flex-start',
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
  conditionBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  conditionEmoji: {
    fontSize: 12,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '600',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '400',
    color: '#0f172a',
    flex: 1,
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
    maxHeight: 18, // 1 line max
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipEmoji: {
    fontSize: 12,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '300',
    color: '#0f172a',
  },
  metaSection: {
    marginTop: 8,
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
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
    marginTop: 8,
  },
  suggestionsSlot: {
    marginTop: 12,
  },
  skeletonCard: {
    backgroundColor: '#f8fafc',
  },
  skeletonMedia: {
    flex: 0.8,
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
  <View style={styles.cardWrapper}>
    <View style={[styles.card, styles.skeletonCard, style, { paddingLeft: 16, paddingTop: 8 }]}>
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
  </View>
));

export default memo(TopMatchCard);

