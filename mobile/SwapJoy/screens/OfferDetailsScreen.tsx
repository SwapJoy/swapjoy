import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { colors } from '@navigation/MainTabNavigator.styles';
import SJText from '../components/SJText';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';
import CachedImage from '../components/CachedImage';
import { useLocalization } from '../localization';
import { formatCurrency } from '../utils';
import { getItemImageUri } from '../utils/imageUtils';
import { resolveCategoryName } from '../utils/category';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type OfferDetailsRoute = RouteProp<RootStackParamList, 'OfferDetails'>;
type OfferDetailsNav = NavigationProp<RootStackParamList, 'OfferDetails'>;

interface Props {
  navigation: OfferDetailsNav;
  route: OfferDetailsRoute;
}

const OfferDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { offer } = route.params as any;
  const { user } = useAuth();
  const { t, language } = useLocalization();

  const strings = useMemo(
    () => ({
      youOffer: t('offers.preview.youOffer'),
      youWant: t('offers.preview.youWant'),
      yourItem: t('offers.details.yourItem', { defaultValue: 'Your item' }),
      offerLabel: t('offers.details.offer', { defaultValue: 'Offer' }),
      evenSwap: t('offers.preview.evenSwap'),
      noMessage: t('offers.list.noMessage'),
      fromUser: t('offers.list.fromUser'),
      toUser: t('offers.list.toUser'),
      messageAboutOffer: t('offers.details.messageAboutOffer', { defaultValue: 'Message about this offer' }),
      offerDetails: t('offers.details.title', { defaultValue: 'Offer details' }),
    }),
    [t]
  );

  const otherUserId = useMemo(() => {
    if (!user) return null;
    return user.id === offer.sender_id ? offer.receiver_id : offer.sender_id;
  }, [user, offer]);

  const isSentByMe = user?.id === offer.sender_id;

  const entries = Array.isArray(offer.offer_items) ? offer.offer_items : [];
  const requestedItems = entries.filter((entry: any) => entry?.side === 'requested');
  const offeredItems = entries.filter((entry: any) => entry?.side === 'offered');

  const youGiveItems = isSentByMe ? offeredItems : requestedItems;
  const youReceiveItems = isSentByMe ? requestedItems : offeredItems;

  const resolvedLanguage = (language || 'en') as any;

  const fallbackPrimary = (isSentByMe ? requestedItems : offeredItems).find((entry: any) => entry?.item)?.item;
  const fallbackCurrency =
    fallbackPrimary?.currency ||
    fallbackPrimary?.item_currency ||
    'USD';

  const topUpAmount = offer.top_up_amount ?? 0;
  const topUpAbs = Math.abs(topUpAmount);
  const topUpValue = formatCurrency(topUpAbs, fallbackCurrency);
  const topUpTone = topUpAmount === 0 ? 'neutral' : isSentByMe ? 'outgoing' : 'incoming';
  const topUpText =
    topUpAmount === 0
      ? strings.evenSwap
      : isSentByMe
        ? `You add cash: -${topUpValue}`
        : `Cash included: +${topUpValue}`;

  const otherUser = isSentByMe ? offer.receiver : offer.sender;
  const displayNameParts = [
    otherUser?.first_name ?? '',
    otherUser?.last_name ?? '',
  ].filter(Boolean);
  const displayName = displayNameParts.join(' ') || otherUser?.username || '';

  const userLabelTemplate = isSentByMe ? strings.toUser : strings.fromUser;
  const userLabel = userLabelTemplate.replace('{username}', otherUser?.username || displayName || '');

  const createdAtLabel = new Date(offer.created_at).toLocaleString();
  const messageText = offer.message && offer.message.trim().length > 0 ? offer.message : strings.noMessage;

  const statusColor = (() => {
    switch (offer.status) {
      case 'accepted':
        return '#3ebd7b';
      case 'rejected':
        return '#e75f5f';
      case 'completed':
        return '#38bdf8';
      case 'pending':
        return '#f59e0b';
      default:
        return '#7a7a7a';
    }
  })();
  const statusText = t(`offers.statuses.${offer.status}`, { defaultValue: offer.status || 'pending' });

  const getItemImages = (list: any[]) => {
    const uris: string[] = [];
    list.forEach((entry) => {
      const imageUri = getItemImageUri(entry?.item);
      if (imageUri) {
        uris.push(imageUri);
      }
    });
    return Array.from(new Set(uris));
  };

  const buildSideModel = (list: any[]) => {
    const items = list
      .map((entry) => entry?.item)
      .filter((it): it is any => Boolean(it));
    const mainItem = items[0];
    const imageUrls = getItemImages(list);
    return {
      title: mainItem?.title || '—',
      category:
        mainItem &&
        (resolveCategoryName(mainItem, resolvedLanguage) ||
          (typeof mainItem.category_name === 'string' ? mainItem.category_name : undefined) ||
          (typeof mainItem.category === 'string' ? mainItem.category : undefined)),
      price: typeof mainItem?.price === 'number' ? formatCurrency(mainItem.price, mainItem.currency || 'USD') : null,
      condition: mainItem?.condition,
      imageUrl: imageUrls[0],
      thumbnails: imageUrls.slice(1, 4),
      items,
    };
  };

  const myInitials = user?.username?.[0]?.toUpperCase() || 'Y';
  const otherInitials = (displayName || otherUser?.username || '?')
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const leftSideLabel = isSentByMe ? strings.youOffer : strings.yourItem;
  const rightSideLabel = isSentByMe ? strings.youWant : strings.offerLabel;
  const leftSide = buildSideModel(youGiveItems);
  const rightSide = buildSideModel(youReceiveItems);

  const renderItemsList = (items: any[]) => {
    if (items.length === 0) return <SJText style={styles.itemsEmpty}>—</SJText>;
    return (
      <View style={styles.itemsList}>
        {items.slice(0, 3).map((it, idx) => (
          <View key={`${it.id || it.title}-${idx}`} style={styles.itemRow}>
            <SJText style={styles.itemBullet}>•</SJText>
            <View style={styles.itemInfo}>
              <SJText style={styles.itemTitle} numberOfLines={1}>
                {it.title}
              </SJText>
              {typeof it.price === 'number' && (
                <SJText style={styles.itemPrice}>
                  {formatCurrency(it.price, it.currency || 'USD')}
                </SJText>
              )}
            </View>
          </View>
        ))}
        {items.length > 3 ? (
          <SJText style={styles.moreItems}>+{items.length - 3} more items</SJText>
        ) : null}
      </View>
    );
  };

  const renderTradeSide = (
    side: ReturnType<typeof buildSideModel>,
    label: string,
    username: string,
    initials: string,
    avatarUri?: string
  ) => (
    <View style={styles.tradeSide}>
      <View style={styles.tradeSideHeader}>
        <SJText style={styles.tradeSideLabel}>{label}</SJText>
        <View style={styles.tradeUserRow}>
          {avatarUri ? (
            <CachedImage uri={avatarUri} style={styles.tradeAvatar} resizeMode="cover" />
          ) : (
            <View style={styles.tradeAvatarFallback}>
              <SJText style={styles.tradeAvatarText}>{initials}</SJText>
            </View>
          )}
          <SJText style={styles.tradeUsername} numberOfLines={1}>
            {username}
          </SJText>
        </View>
      </View>
      <View style={styles.tradeImageFrame}>
        <CachedImage
          uri={side.imageUrl || 'https://via.placeholder.com/260x180'}
          style={styles.tradeImage}
          resizeMode="cover"
          fallbackUri="https://picsum.photos/260/180?random=53"
        />
      </View>
      {side.thumbnails.length > 0 ? (
        <View style={styles.thumbnailRow}>
          {side.thumbnails.map((uri, index) => (
            <CachedImage key={`${uri}-${index}`} uri={uri} style={styles.thumbnail} resizeMode="cover" />
          ))}
        </View>
      ) : null}
      <SJText style={styles.tradeTitle} numberOfLines={1}>
        {side.title}
      </SJText>
      {side.category ? (
        <SJText style={styles.tradeMeta} numberOfLines={1}>
          {side.category}
        </SJText>
      ) : null}
      {side.condition ? (
        <SJText style={styles.tradeMeta} numberOfLines={1}>
          Condition: {side.condition}
        </SJText>
      ) : null}
      {side.price ? <SJText style={styles.tradePrice}>{side.price}</SJText> : null}
      {renderItemsList(side.items)}
    </View>
  );

  const onStartChat = async () => {
    if (!otherUserId) return;

    const { data, error } = await ApiService.ensureChatForOffer({
      offerId: offer.id,
      otherUserId,
    });

    if (!error && data?.chatId) {
      navigation.navigate('Chat', {
        chatId: data.chatId,
        offerId: offer.id,
        otherUserId,
        offer,
      });
    } else {
      console.warn('[OfferDetailsScreen] Failed to ensure chat:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <SJText style={styles.statusText}>{statusText}</SJText>
          </View>
          <SJText style={styles.offerDirection} numberOfLines={1}>
            {userLabel}
          </SJText>
          <SJText style={styles.metaDate}>{createdAtLabel}</SJText>
        </View>

        <SJText style={styles.screenTitle}>{strings.offerDetails}</SJText>

        <View style={styles.swapBoard}>
          <View style={styles.swapRow}>
            {renderTradeSide(leftSide, leftSideLabel, 'You', myInitials)}
            {renderTradeSide(
              rightSide,
              rightSideLabel,
              otherUser?.username || displayName || '?',
              otherInitials,
              otherUser?.profile_image_url
            )}
          </View>
          <View style={styles.swapIcon}>
            <Ionicons name="swap-horizontal" size={20} color={colors.primaryDark} />
          </View>
        </View>

        <View
          style={[
            styles.topUpBox,
            topUpTone === 'incoming' ? styles.topUpIncoming : null,
            topUpTone === 'outgoing' ? styles.topUpOutgoing : null,
          ]}
        >
          <Ionicons
            name={topUpAmount === 0 ? 'checkmark-circle-outline' : 'cash-outline'}
            size={16}
            color={
              topUpTone === 'incoming'
                ? styles.topUpIncomingText.color
                : topUpTone === 'outgoing'
                  ? styles.topUpOutgoingText.color
                  : styles.topUpText.color
            }
          />
          <SJText
            style={[
              styles.topUpText,
              topUpTone === 'incoming' ? styles.topUpIncomingText : null,
              topUpTone === 'outgoing' ? styles.topUpOutgoingText : null,
            ]}
          >
            {topUpText}
          </SJText>
        </View>

        <View style={styles.messageCard}>
          <SJText style={styles.messageLabel}>Message</SJText>
          <SJText style={styles.messageText}>{messageText}</SJText>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatButton} onPress={onStartChat}>
          <SJText style={styles.chatButtonText}>{strings.messageAboutOffer}</SJText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: '#1d1d1d',
    borderWidth: 1,
    borderColor: '#2f2f2f',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    color: '#13211a',
    fontSize: 11,
    fontWeight: '700',
  },
  offerDirection: {
    flex: 1,
    fontSize: 12,
    color: '#d3d3d3',
    fontWeight: '600',
  },
  metaDate: {
    fontSize: 11,
    color: '#8f8f8f',
  },
  screenTitle: {
    marginTop: 14,
    fontSize: 20,
    color: '#f4f4f4',
    fontWeight: '700',
  },
  swapBoard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#343434',
    backgroundColor: '#202020',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  swapRow: {
    flexDirection: 'row',
    gap: 8,
  },
  swapIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeSide: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2f2f2f',
    padding: 8,
    gap: 6,
  },
  tradeSideHeader: {
    gap: 6,
  },
  tradeSideLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryYellow,
  },
  tradeUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tradeAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  tradeAvatarFallback: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d1d5db',
  },
  tradeAvatarText: {
    fontSize: 10,
    color: '#1f2937',
    fontWeight: '700',
  },
  tradeUsername: {
    flex: 1,
    fontSize: 11,
    color: '#cfcfcf',
    fontWeight: '600',
  },
  tradeImageFrame: {
    width: '100%',
    height: Math.min(140, Math.round(width * 0.34)),
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#262626',
  },
  tradeImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: 6,
  },
  thumbnail: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#292929',
  },
  tradeTitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#efefef',
    fontWeight: '700',
  },
  tradeMeta: {
    fontSize: 11,
    color: '#a1a1a1',
  },
  tradePrice: {
    fontSize: 12,
    color: '#f4f4f4',
    fontWeight: '700',
  },
  itemsList: {
    gap: 3,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
  },
  itemBullet: {
    fontSize: 13,
    color: '#7d7d7d',
    marginRight: 6,
  },
  itemTitle: {
    fontSize: 12,
    color: '#dfdfdf',
  },
  itemPrice: {
    fontSize: 11,
    color: '#b5b5b5',
  },
  itemsEmpty: {
    fontSize: 12,
    color: '#858585',
  },
  moreItems: {
    fontSize: 11,
    color: colors.primaryYellow,
    fontWeight: '600',
  },
  topUpBox: {
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#242424',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topUpIncoming: {
    backgroundColor: '#13271d',
  },
  topUpOutgoing: {
    backgroundColor: '#2b1c14',
  },
  topUpText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryYellow,
  },
  topUpIncomingText: {
    color: '#4ade80',
  },
  topUpOutgoingText: {
    color: '#fb923c',
  },
  messageCard: {
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
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: colors.primaryDark,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
  },
  chatButton: {
    backgroundColor: colors.primaryYellow,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#202020',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default OfferDetailsScreen;


