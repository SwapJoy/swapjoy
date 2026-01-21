import React, { useMemo } from 'react';
import {View, StyleSheet, TouchableOpacity, ScrollView, FlatList, Dimensions} from 'react-native';
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
      evenSwap: t('offers.preview.evenSwap'),
      topUpYouAdd: t('offers.list.topUpYouAdd'),
      topUpTheyAdd: t('offers.list.topUpTheyAdd'),
      fromUser: t('offers.list.fromUser'),
      toUser: t('offers.list.toUser'),
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

  const primaryCollection = (isSentByMe ? requestedItems : offeredItems).filter((entry: any) => entry?.item);
  const fallbackCollection = (isSentByMe ? offeredItems : requestedItems).filter((entry: any) => entry?.item);
  const primaryItem = primaryCollection[0]?.item || fallbackCollection[0]?.item || undefined;

  const primaryImage = primaryItem ? getItemImageUri(primaryItem) : null;

  const category =
    primaryItem
      ? resolveCategoryName(primaryItem, resolvedLanguage) ||
        (typeof primaryItem.category_name === 'string' ? primaryItem.category_name : undefined) ||
        (typeof primaryItem.category === 'string' ? primaryItem.category : undefined)
      : undefined;

  const primaryPrice =
    typeof primaryItem?.price === 'number'
      ? formatCurrency(primaryItem.price, primaryItem.currency || 'USD')
      : null;

  const fallbackCurrency =
    primaryItem?.currency ||
    primaryItem?.item_currency ||
    'USD';

  const topUpAmount = offer.top_up_amount ?? 0;
  const topUpAbs = Math.abs(topUpAmount);
  const topUpText =
    topUpAmount === 0
      ? strings.evenSwap
      : topUpAmount > 0
        ? strings.topUpYouAdd.replace('{amount}', formatCurrency(topUpAbs, fallbackCurrency))
        : strings.topUpTheyAdd.replace('{amount}', formatCurrency(topUpAbs, fallbackCurrency));

  const priceLabel =
    primaryPrice ??
    (topUpAmount !== 0 ? formatCurrency(topUpAbs, fallbackCurrency) : strings.evenSwap);

  const otherUser = isSentByMe ? offer.receiver : offer.sender;
  const displayNameParts = [
    otherUser?.first_name ?? '',
    otherUser?.last_name ?? '',
  ].filter(Boolean);
  const displayName = displayNameParts.join(' ') || otherUser?.username || '';

  const userLabelTemplate = isSentByMe ? strings.toUser : strings.fromUser;
  const userLabel = userLabelTemplate.replace('{username}', otherUser?.username || displayName || '');

  const createdAtLabel = new Date(offer.created_at).toLocaleString();

  const renderItemsList = (list: any[]) => {
    const items = list
      .map((entry) => entry?.item)
      .filter((it): it is any => Boolean(it));

    if (items.length === 0) {
      return <SJText style={styles.itemsEmpty}>—</SJText>;
    }

    return (
      <View style={styles.itemsList}>
        {items.map((it, idx) => (
          <View key={it.id || idx} style={styles.itemRow}>
            <SJText style={styles.itemBullet}>•</SJText>
            <View style={{ flex: 1 }}>
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
      </View>
    );
  };

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
        <SJText style={styles.title}>{primaryItem?.title || 'Offer'}</SJText>
        <SJText style={styles.price}>{priceLabel}</SJText>

        {category && (
          <SJText style={styles.meta}>
            Category: {category}
          </SJText>
        )}

        {primaryItem?.condition && (
          <SJText style={styles.meta}>
            Condition: {primaryItem.condition}
          </SJText>
        )}

        <SJText style={styles.meta}>
          {userLabel}
        </SJText>

        <SJText style={styles.meta}>
          Created at: {createdAtLabel}
        </SJText>

        {offer.message && offer.message.trim().length > 0 && (
          <SJText style={styles.description}>{offer.message}</SJText>
        )}

        {primaryImage && (
          <View style={styles.heroWrapper}>
            <CachedImage
              uri={primaryImage}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.section}>
          <SJText style={styles.sectionTitle}>{strings.youOffer}</SJText>
          {renderItemsList(youGiveItems)}
        </View>

        <View style={styles.section}>
          <SJText style={styles.sectionTitle}>{strings.youWant}</SJText>
          {renderItemsList(youReceiveItems)}
        </View>

        <View style={styles.topUpBox}>
          <SJText style={styles.topUpText}>{topUpText}</SJText>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatButton} onPress={onStartChat}>
          <SJText style={styles.chatButtonText}>Message about this offer</SJText>
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
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  price: {
    marginTop: 6,
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: '#666',
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    color: '#333',
  },
  heroWrapper: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroImage: {
    width: width - 32,
    height: Math.min(260, Math.round(width * 0.6)),
    backgroundColor: '#e5e7eb',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  itemsList: {
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemBullet: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 6,
  },
  itemTitle: {
    fontSize: 13,
    color: '#111827',
  },
  itemPrice: {
    fontSize: 12,
    color: '#4b5563',
  },
  itemsEmpty: {
    fontSize: 13,
    color: '#9ca3af',
  },
  topUpBox: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  topUpText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: colors.primaryDark,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  chatButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  chatButtonText: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OfferDetailsScreen;


