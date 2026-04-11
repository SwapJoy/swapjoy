import React, { memo, ReactNode, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import CachedImage from './CachedImage';
import SJText from './SJText';
import { useLocalization } from '../localization';
import { useCategories } from '../contexts/CategoriesContext';
import { formatCurrency } from '../utils';
import { getItemImageUri } from '../utils/imageUtils';
import { resolveCategoryName } from '../utils/category';
import ConditionChip from './ConditionChip';
import CategoryChip from './CategoryChip';
import type { Offer } from '../hooks/useOffersData';
import type { AppLanguage } from '../types/language';
import { colors } from '@navigation/MainTabNavigator.styles';

const { width, height } = Dimensions.get('window');
export const MATCH_CARD_HEIGHT = height * 0.55;
const DEFAULT_CARD_WIDTH = width * 0.75;

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

interface MatchCardOwner {
  initials: string;
  username?: string;
  displayName?: string;
  profileImageUrl?: string;
  userId?: string;
}

interface MatchCardProps {
  title: string;
  price: string;
  description?: string;
  descriptionLines?: number;
  category?: string;
  condition?: string;
  imageUrl?: string;
  owner: MatchCardOwner;
  onPress: () => void;
  onOwnerPress?: () => void;
  onLikePress?: (event: GestureResponderEvent) => void;
  containerStyle?: StyleProp<ViewStyle>;
  likeIconName?: keyof typeof Ionicons.glyphMap;
  likeIconColor?: string;
  likeActiveColor?: string;
  isLikeActive?: boolean;
  disableLikeButton?: boolean;
  cardWidth?: number;
  sectionPaddingHorizontal?: number;
  borderRadius?: number;
  viewCount?: number;
  swapSuggestions?: ReactNode;
  fixedHeight?: boolean;
  imageHeight?: number;
}

const MatchCardBase: React.FC<MatchCardProps> = ({
  title,
  price,
  description,
  descriptionLines = 1,
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
  cardWidth = DEFAULT_CARD_WIDTH,
  sectionPaddingHorizontal = 0,
  borderRadius = 12,
  viewCount,
  swapSuggestions,
  fixedHeight = true,
  imageHeight,
}) => {
  const { language } = useLocalization();
  const { getCategoryByName, getCategoryById } = useCategories();
  const navigation = useNavigation<any>();
  const displayTitle = (title ?? '').trim() || 'Untitled item';
  const ownerDisplayName = owner.displayName?.trim() || '';
  const ownerUsername = owner.username?.trim() || ownerDisplayName || '';
  const hasOwner = ownerUsername.length > 0 || owner.initials?.length > 0;

  const handleOwnerPress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    if (onOwnerPress) {
      onOwnerPress();
    } else if (owner.userId) {
      navigation.navigate('UserProfile', { userId: owner.userId });
    }
  };

  const { normalizedCategory } = useMemo(() => {
    let categoryData = null;
    let normalizedCategoryResult: string | null = null;

    if (category) {
      if (typeof category === 'object' && category !== null && 'id' in category && typeof (category as any).id === 'string') {
        categoryData = getCategoryById((category as any).id);
        if (categoryData) {
          normalizedCategoryResult = categoryData.name || categoryData.title_en || categoryData.title_ka || null;
        }
      } else if (typeof category === 'object' && category !== null) {
        const resolvedName = resolveCategoryName({ category }, language as AppLanguage);
        if (resolvedName) {
          normalizedCategoryResult = resolvedName;
          categoryData = getCategoryByName(resolvedName);
        }
      } else if (typeof category === 'string') {
        const trimmed = category.trim();
        if (trimmed.length > 0) {
          normalizedCategoryResult = trimmed;
          categoryData = getCategoryByName(trimmed);
        }
      }
    }

    return { normalizedCategory: normalizedCategoryResult };
  }, [category, language, getCategoryByName, getCategoryById]);

  return (
    <View>
      {hasOwner ? (
        <TouchableOpacity
          style={styles.ownerHeader}
          onPress={handleOwnerPress}
          activeOpacity={0.7}
          disabled={!onOwnerPress}
        >
          {owner.profileImageUrl ? (
            <CachedImage uri={owner.profileImageUrl} style={styles.ownerProfileImage} resizeMode="cover" />
          ) : (
            <View style={styles.ownerProfileImagePlaceholder}>
              <SJText style={styles.ownerProfileImageText}>
                {owner.initials || ownerUsername.charAt(0).toUpperCase()}
              </SJText>
            </View>
          )}
          {ownerUsername.length > 0 ? (
            <SJText style={styles.ownerUsername} numberOfLines={1}>
              {ownerUsername}
            </SJText>
          ) : null}
        </TouchableOpacity>
      ) : null}

      <View style={[fixedHeight ? styles.cardWrapperFixed : styles.cardWrapperAuto, { width: cardWidth }]}>
        <TouchableOpacity style={[styles.cardBase, fixedHeight ? styles.cardFixedHeight : null, containerStyle]} activeOpacity={0.85} onPress={onPress}>
          <View
            style={[
              styles.mediaSectionBase,
              fixedHeight ? styles.mediaSectionFixed : styles.mediaSectionAuto,
              !fixedHeight ? { height: imageHeight ?? 220 } : null,
              { borderRadius },
            ]}
          >
            <CachedImage
              uri={imageUrl || 'https://via.placeholder.com/320x240'}
              style={styles.heroImage}
              resizeMode="cover"
              fallbackUri="https://picsum.photos/320/240?random=7"
            />
            {!disableLikeButton ? (
              <TouchableOpacity
                style={[styles.likeButton, isLikeActive ? styles.likeButtonActive : null]}
                activeOpacity={0.6}
                onPress={onLikePress}
              >
                <Ionicons name={likeIconName} size={18} color={isLikeActive ? likeActiveColor : likeIconColor} />
              </TouchableOpacity>
            ) : null}
            {viewCount !== undefined && viewCount > 0 ? (
              <View style={styles.viewCountBadge}>
                <Ionicons name="eye-outline" size={12} color="#666" />
                <SJText style={styles.viewCountText}>
                  {viewCount >= 1000 ? `${(viewCount / 1000).toFixed(1)}K` : viewCount}
                </SJText>
              </View>
            ) : null}
            {condition ? <ConditionChip condition={condition} style={styles.conditionBadge} /> : null}
          </View>

          <View style={[styles.infoSectionBase, fixedHeight ? styles.infoSectionFixed : styles.infoSectionAuto, { paddingHorizontal: sectionPaddingHorizontal }]}>
            <View style={styles.titleRow}>
              <SJText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {displayTitle}
              </SJText>
            </View>

            {description ? (
              <SJText style={styles.description} numberOfLines={descriptionLines} ellipsizeMode="tail">
                {description}
              </SJText>
            ) : null}

            {normalizedCategory ? (
              <View style={styles.metaSection}>
                <View style={styles.chipsRow}>
                  <CategoryChip name={normalizedCategory} style={styles.categoryChip} />
                </View>
              </View>
            ) : null}

            {price ? <SJText style={styles.priceText}>{price}</SJText> : null}
            {swapSuggestions ? <View style={styles.suggestionsSlot}>{swapSuggestions}</View> : null}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const MatchCard = memo(MatchCardBase);

export const MatchCardSkeleton = memo(
  ({ style, cardWidth = DEFAULT_CARD_WIDTH }: { style?: StyleProp<ViewStyle>; cardWidth?: number }) => (
    <View style={[styles.skeletonCardWrapper, { width: cardWidth }]}>
      <View style={[styles.skeletonBackground, style, { paddingLeft: 16, paddingTop: 8 }]}>
        <FadePlaceholder style={styles.skeletonMedia} borderRadius={16} />
        <View style={[styles.infoSectionBase, styles.infoSectionFixed]}>
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
  )
);

type OfferListCardStrings = {
  types: {
    sent: string;
    received: string;
  };
  noMessage: string;
  topUpYouAdd: string;
  topUpTheyAdd: string;
  moreItems: string;
  toUser: string;
  fromUser: string;
  evenSwap: string;
  youOffer: string;
  youWant: string;
};

type Props = {
  item: Offer;
  isSent: boolean;
  language: AppLanguage;
  strings: OfferListCardStrings;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  onPress: () => void;
};

const OfferListCard: React.FC<Props> = ({
  item,
  isSent,
  language,
  strings,
  getStatusColor,
  getStatusText,
  onPress,
}) => {
  const entries = Array.isArray(item.offer_items) ? item.offer_items : [];
  const requestedItems = entries.filter((entry: any) => entry?.side === 'requested');
  const offeredItems = entries.filter((entry: any) => entry?.side === 'offered');
  const fallbackPrimary: any = (isSent ? requestedItems : offeredItems).find((entry: any) => entry?.item)?.item;
  const fallbackCurrency = fallbackPrimary?.currency || fallbackPrimary?.item_currency || 'USD';
  const topUpAmount = item.top_up_amount ?? 0;
  const topUpAbs = Math.abs(topUpAmount);
  const topUpFormatted = formatCurrency(topUpAbs, fallbackCurrency);
  const topUpTone = topUpAmount === 0 ? 'neutral' : isSent ? 'outgoing' : 'incoming';
  const topUpText =
    topUpAmount === 0
      ? strings.evenSwap
      : isSent
        ? `You add cash: -${topUpFormatted}`
        : `Cash included: +${topUpFormatted}`;

  const otherUser: any = isSent ? item.receiver : item.sender;
  const displayNameParts = [otherUser?.first_name ?? '', otherUser?.last_name ?? ''].filter(Boolean);
  const displayName = displayNameParts.join(' ') || otherUser?.username || '';
  const initialsSource = displayName || otherUser?.username || '?';
  const ownerInitials =
    initialsSource
      .split(' ')
      .map((part: string) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';

  const description = item.message && item.message.trim().length > 0 ? item.message : strings.noMessage;
  const youGiveItems = isSent ? offeredItems : requestedItems;
  const youReceiveItems = isSent ? requestedItems : offeredItems;
  const statusColor = getStatusColor(item.status);
  const statusText = getStatusText(item.status);
  const userLabel = (isSent ? strings.toUser : strings.fromUser).replace('{username}', otherUser?.username || displayName || '');
  const createdAtLabel = new Date(item.created_at).toLocaleDateString();
  const leftSideLabel = isSent ? strings.youOffer : 'Your item';
  const rightSideLabel = isSent ? strings.youWant : 'Offer';

  const getItemImages = (entries: any[]) => {
    const uris: string[] = [];
    entries.forEach((entry) => {
      const current = entry?.item;
      if (!current) {
        return;
      }
      const imageUri = getItemImageUri(current);
      if (imageUri) {
        uris.push(imageUri);
      }
    });
    return Array.from(new Set(uris));
  };

  const buildSideModel = (entries: any[]) => {
    const normalizedEntries = entries.filter((entry) => entry?.item);
    const mainEntry = normalizedEntries[0];
    const mainItem = mainEntry?.item;
    const title = mainItem?.title?.trim() || '—';
    const resolvedCategory =
      mainItem &&
      (resolveCategoryName(mainItem, language) ||
        (typeof mainItem.category_name === 'string' ? mainItem.category_name : undefined) ||
        (typeof mainItem.category === 'string' ? mainItem.category : undefined));
    const condition = typeof mainItem?.condition === 'string' ? mainItem.condition : undefined;
    const price =
      typeof mainItem?.price === 'number'
        ? formatCurrency(mainItem.price, mainItem.currency || mainItem.item_currency || fallbackCurrency)
        : null;
    const images = getItemImages(normalizedEntries);
    return {
      title,
      category: resolvedCategory,
      condition,
      price,
      imageUrl: images[0],
      thumbnails: images.slice(1, 4),
      remaining: Math.max(0, normalizedEntries.length - 1),
    };
  };

  const leftSide = useMemo(() => buildSideModel(youGiveItems), [youGiveItems, language, fallbackCurrency]);
  const rightSide = useMemo(() => buildSideModel(youReceiveItems), [youReceiveItems, language, fallbackCurrency]);

  const renderSide = (
    side: ReturnType<typeof buildSideModel>,
    sideLabel: string,
    userName: string,
    initials: string,
    avatarUri?: string
  ) => (
    <View style={styles.swapSide}>
      <View style={styles.sideHeader}>
        <SJText style={styles.sideLabel} numberOfLines={1}>
          {sideLabel}
        </SJText>
        <View style={styles.sideUserRow}>
          {avatarUri ? (
            <CachedImage uri={avatarUri} style={styles.sideAvatar} resizeMode="cover" />
          ) : (
            <View style={styles.sideAvatarFallback}>
              <SJText style={styles.sideAvatarText}>{initials}</SJText>
            </View>
          )}
          <SJText style={styles.sideUsername} numberOfLines={1}>
            {userName}
          </SJText>
        </View>
      </View>

      <View style={styles.sideImageFrame}>
        <CachedImage
          uri={side.imageUrl || 'https://via.placeholder.com/280x180'}
          style={styles.sideImage}
          resizeMode="cover"
          fallbackUri="https://picsum.photos/280/180?random=41"
        />
      </View>

      {side.thumbnails.length > 0 ? (
        <View style={styles.thumbnailsRow}>
          {side.thumbnails.map((uri, index) => (
            <CachedImage key={`${uri}-${index}`} uri={uri} style={styles.thumbnailImage} resizeMode="cover" />
          ))}
        </View>
      ) : null}

      <View style={styles.sideInfo}>
        <SJText style={styles.sideTitle} numberOfLines={1}>
          {side.title}
        </SJText>
        {side.category ? (
          <SJText style={styles.sideMeta} numberOfLines={1}>
            {side.category}
          </SJText>
        ) : null}
        {side.condition ? (
          <View style={styles.sideConditionRow}>
            <ConditionChip condition={side.condition} />
          </View>
        ) : null}
        {side.price ? <SJText style={styles.sidePrice}>{side.price}</SJText> : null}
        {side.remaining > 0 ? (
          <SJText style={styles.sideMoreItems}>{strings.moreItems.replace('{count}', String(side.remaining))}</SJText>
        ) : null}
      </View>
    </View>
  );

  return (
    <TouchableOpacity style={styles.offerCard} onPress={onPress} activeOpacity={0.86}>
      <View style={styles.offerHeaderRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <SJText style={styles.statusText}>{statusText}</SJText>
        </View>
        <SJText style={styles.offerMetaUser} numberOfLines={1}>
          {userLabel}
        </SJText>
        <SJText style={styles.offerMetaDate}>{createdAtLabel}</SJText>
      </View>

      <View style={styles.swapBoard}>
        <View style={styles.swapBoardRow}>
          {renderSide(leftSide, leftSideLabel, 'You', 'Y')}
          {renderSide(
            rightSide,
            rightSideLabel,
            otherUser?.username || displayName || '?',
            ownerInitials,
            otherUser?.profile_image_url
          )}
        </View>
        <View style={styles.swapIconWrapper}>
          <Ionicons name="swap-horizontal" size={20} color={colors.primaryDark} />
        </View>
      </View>

      <View
        style={[
          styles.offerTopUpRow,
          topUpTone === 'incoming' ? styles.offerTopUpRowIncoming : null,
          topUpTone === 'outgoing' ? styles.offerTopUpRowOutgoing : null,
        ]}
      >
        <Ionicons
          name={topUpAmount === 0 ? 'checkmark-circle-outline' : 'cash-outline'}
          size={16}
          color={
            topUpTone === 'incoming'
              ? styles.offerTopUpIncomingLabel.color
              : topUpTone === 'outgoing'
                ? styles.offerTopUpOutgoingLabel.color
                : styles.offerTopUpLabel.color
          }
        />
        <SJText
          style={[
            styles.offerTopUpLabel,
            topUpTone === 'incoming' ? styles.offerTopUpIncomingLabel : null,
            topUpTone === 'outgoing' ? styles.offerTopUpOutgoingLabel : null,
          ]}
        >
          {topUpText}
        </SJText>
      </View>

      <View style={styles.messageBox}>
        <SJText style={styles.messageLabel} numberOfLines={1}>
          Message
        </SJText>
        <SJText style={styles.messageText} numberOfLines={2}>
          {description}
        </SJText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapperFixed: {
    height: MATCH_CARD_HEIGHT,
    marginRight: 8,
    marginBottom: 8,
  },
  cardWrapperAuto: {
    marginRight: 8,
    marginBottom: 8,
  },
  skeletonCardWrapper: {
    height: MATCH_CARD_HEIGHT,
    marginRight: 8,
    marginBottom: 8,
  },
  cardBase: {
    width: '100%',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  cardFixedHeight: {
    height: '100%',
  },
  skeletonBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#161200ff',
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
    fontWeight: '500',
  },
  ownerUsername: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
  },
  mediaSectionBase: {
    position: 'relative',
    overflow: 'hidden',
  },
  mediaSectionFixed: {
    flex: 0.75,
  },
  mediaSectionAuto: {
    width: '100%',
  },
  infoSectionBase: {
    paddingHorizontal: 2,
    paddingVertical: 6,
    justifyContent: 'flex-start',
  },
  infoSectionFixed: {
    flex: 0.25,
  },
  infoSectionAuto: {
    flexShrink: 0,
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
    backgroundColor: '#ffffffee',
  },
  likeButtonActive: {
    backgroundColor: '#fee2e2',
  },
  conditionBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
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
    flex: 1,
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    maxHeight: 36,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  categoryChip: {},
  metaSection: {
    marginTop: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  suggestionsSlot: {
    marginTop: 12,
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
  viewCountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  viewCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  offerCard: {
    width: width - 20,
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 18,
    padding: 12,
    backgroundColor: '#171717',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  offerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  offerMetaUser: {
    flex: 1,
    fontSize: 11,
    color: '#b8b8b8',
    fontWeight: '600',
  },
  offerMetaDate: {
    fontSize: 11,
    color: '#878787',
  },
  swapBoard: {
    position: 'relative',
  },
  swapBoardRow: {
    flexDirection: 'row',
    gap: 8,
  },
  swapSide: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2f2f2f',
    padding: 8,
    gap: 8,
  },
  sideHeader: {
    gap: 6,
  },
  sideLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryYellow,
  },
  sideUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sideAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  sideAvatarFallback: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1f2937',
  },
  sideUsername: {
    flex: 1,
    fontSize: 11,
    color: '#cfcfcf',
    fontWeight: '600',
  },
  sideImageFrame: {
    width: '100%',
    height: 108,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#262626',
  },
  sideImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  thumbnailImage: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#292929',
  },
  sideInfo: {
    gap: 3,
  },
  sideTitle: {
    fontSize: 13,
    color: '#efefef',
    fontWeight: '700',
  },
  sideMeta: {
    fontSize: 11,
    color: '#a1a1a1',
  },
  sideConditionRow: {
    marginTop: 2,
    alignItems: 'flex-start',
  },
  sidePrice: {
    marginTop: 2,
    fontSize: 12,
    color: '#f4f4f4',
    fontWeight: '700',
  },
  sideMoreItems: {
    fontSize: 12,
    color: colors.primaryYellow,
    fontWeight: '600',
  },
  swapIconWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -18,
    marginLeft: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerTopUpRow: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#242424',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offerTopUpRowIncoming: {
    backgroundColor: '#13271d',
  },
  offerTopUpRowOutgoing: {
    backgroundColor: '#2b1c14',
  },
  offerTopUpLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryYellow,
  },
  offerTopUpIncomingLabel: {
    color: '#4ade80',
  },
  offerTopUpOutgoingLabel: {
    color: '#fb923c',
  },
  messageBox: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    backgroundColor: '#1d1d1d',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  messageLabel: {
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#949494',
    fontWeight: '700',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#dfdfdf',
  },
});

export default memo(
  OfferListCard,
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.item.status === next.item.status &&
    prev.item.top_up_amount === next.item.top_up_amount &&
    (prev.item.offer_items?.length || 0) === (next.item.offer_items?.length || 0) &&
    prev.item.message === next.item.message &&
    prev.isSent === next.isSent &&
    prev.language === next.language
);
