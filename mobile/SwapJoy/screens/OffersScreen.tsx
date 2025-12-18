import React, { memo, useMemo, useState, useCallback } from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions, } from 'react-native';
import { colors } from '@navigation/MainTabNavigator.styles';
import SJText from '../components/SJText';
import { OffersScreenProps } from '../types/navigation';
import { useOffersData, Offer } from '../hooks/useOffersData';
import { useLocalization } from '../localization';
import TopMatchCard, { TopMatchCardSkeleton } from '../components/TopMatchCard';
import { formatCurrency } from '../utils';
import { resolveCategoryName } from '../utils/category';
import type { AppLanguage } from '../types/language';
import { DEFAULT_LANGUAGE } from '../types/language';

const { width } = Dimensions.get('window');
const noop = () => {};

const OffersScreen: React.FC<OffersScreenProps> = memo(({ route, navigation }) => {
  const { sentOffers, receivedOffers, loading, refreshing, onRefresh, getStatusColor, getStatusText } = useOffersData();
  const { t, language } = useLocalization();
  const strings = useMemo(
    () => ({
      tabs: {
        sent: t('offers.list.tabSent'),
        received: t('offers.list.tabReceived'),
      },
      types: {
        sent: t('offers.list.sentOffer'),
        received: t('offers.list.receivedOffer'),
      },
      noMessage: t('offers.list.noMessage'),
      topUpYouAdd: t('offers.list.topUpYouAdd'),
      topUpTheyAdd: t('offers.list.topUpTheyAdd'),
      moreItems: t('offers.list.moreItems'),
      toUser: t('offers.list.toUser'),
      fromUser: t('offers.list.fromUser'),
      emptySentTitle: t('offers.list.emptySentTitle'),
      emptySentSubtitle: t('offers.list.emptySentSubtitle'),
      emptyReceivedTitle: t('offers.list.emptyReceivedTitle'),
      emptyReceivedSubtitle: t('offers.list.emptyReceivedSubtitle'),
      evenSwap: t('offers.preview.evenSwap'),
      youOffer: t('offers.preview.youOffer'),
      youWant: t('offers.preview.youWant'),
    }),
    [t]
  );
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>((route?.params as any)?.initialTab ?? 'sent');

  const data = activeTab === 'sent' ? sentOffers : receivedOffers;

  const formatUserLabel = useCallback(
    (username: string, isSent: boolean) =>
      (isSent ? strings.toUser : strings.fromUser).replace('{username}', username || ''),
    [strings.fromUser, strings.toUser]
  );

  const formatMoreItems = useCallback(
    (count: number) => strings.moreItems.replace('{count}', String(count)),
    [strings.moreItems]
  );

  const OfferRow = React.memo(
    ({ item }: { item: Offer }) => {
      const isSent = activeTab === 'sent';
      const resolvedLanguage = (language ?? DEFAULT_LANGUAGE) as AppLanguage;
      const entries = Array.isArray(item.offer_items) ? item.offer_items : [];
      const requestedItems = entries.filter((entry: any) => entry?.side === 'requested');
      const offeredItems = entries.filter((entry: any) => entry?.side === 'offered');
      const primaryCollection = (isSent ? requestedItems : offeredItems).filter((entry: any) => entry?.item);
      const fallbackCollection = (isSent ? offeredItems : requestedItems).filter((entry: any) => entry?.item);
      const primaryItem = primaryCollection[0]?.item || fallbackCollection[0]?.item || undefined;

      const imageUrl =
        primaryItem?.image_url ||
        primaryItem?.images?.[0]?.image_url ||
        primaryItem?.images?.[0]?.url ||
        undefined;

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

      const topUpAmount = item.top_up_amount ?? 0;
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

      const otherUser = isSent ? item.receiver : item.sender;
      const displayNameParts = [
        otherUser?.first_name ?? '',
        otherUser?.last_name ?? '',
      ].filter(Boolean);
      const displayName = displayNameParts.join(' ') || otherUser?.username || '';
      const initialsSource = displayName || otherUser?.username || '?';
      const ownerInitials =
        initialsSource
          .split(' ')
          .map((part) => part.charAt(0))
          .join('')
          .slice(0, 2)
          .toUpperCase() || '?';

      const description =
        item.message && item.message.trim().length > 0 ? item.message : strings.noMessage;

      const youGiveItems = isSent ? offeredItems : requestedItems;
      const youReceiveItems = isSent ? requestedItems : offeredItems;

      const statusColor = getStatusColor(item.status);
      const statusText = getStatusText(item.status);
      const userLabel = formatUserLabel(otherUser?.username || displayName || '', isSent);
      const createdAtLabel = new Date(item.created_at).toLocaleDateString();

      const renderItemsList = (list: any[]) => {
        const titles = list
          .map((entry) => entry?.item?.title)
          .filter((title): title is string => Boolean(title && title.trim().length > 0));

        if (titles.length === 0) {
          return <SJText style={styles.offerItemEmpty}>—</SJText>;
        }

        const visible = titles.slice(0, 2);
        const remaining = titles.length - visible.length;

        return (
          <View style={styles.offerItemsList}>
            {visible.map((title, idx) => (
              <SJText key={`${title}-${idx}`} style={styles.offerItemText} numberOfLines={1}>
                • {title}
              </SJText>
            ))}
            {remaining > 0 ? (
              <SJText style={styles.offerMoreItems}>{formatMoreItems(remaining)}</SJText>
            ) : null}
          </View>
        );
      };

      return (
        <TopMatchCard
          title={primaryItem?.title || strings.types[isSent ? 'sent' : 'received']}
          price={priceLabel}
          description={description}
          descriptionLines={2}
          category={category}
          condition={primaryItem?.condition}
          imageUrl={imageUrl}
          owner={{
            username: otherUser?.username || displayName,
            displayName,
            initials: ownerInitials,
          }}
          onPress={() => {
            (navigation as any).navigate('OfferDetails', { offer: item });
          }}
          disableLikeButton
          containerStyle={styles.offerCard}
          swapSuggestions={
            <View style={styles.offerMetaSection}>
              <View style={styles.offerMetaHeader}>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <SJText style={styles.statusText}>{statusText}</SJText>
                </View>
                <SJText style={styles.offerMetaUser} numberOfLines={1}>
                  {userLabel}
                </SJText>
                <SJText style={styles.offerMetaDate}>{createdAtLabel}</SJText>
              </View>
              <View style={styles.offerMetaRow}>
                <SJText style={styles.offerMetaLabel}>{strings.youOffer}</SJText>
                <View style={styles.offerMetaContent}>{renderItemsList(youGiveItems)}</View>
              </View>
              <View style={styles.offerMetaRow}>
                <SJText style={styles.offerMetaLabel}>{strings.youWant}</SJText>
                <View style={styles.offerMetaContent}>{renderItemsList(youReceiveItems)}</View>
              </View>
              <View style={styles.offerTopUpRow}>
                <SJText style={styles.offerTopUpLabel}>{topUpText}</SJText>
              </View>
            </View>
          }
        />
      );
    },
    (prev, next) =>
      prev.item.id === next.item.id &&
      prev.item.status === next.item.status &&
      prev.item.top_up_amount === next.item.top_up_amount &&
      (prev.item.offer_items?.length || 0) === (next.item.offer_items?.length || 0) &&
      prev.item.message === next.item.message
  );

  const renderOffer = useCallback(
    ({ item }: { item: Offer }) => <OfferRow item={item} />,
    [OfferRow]
  );

  if (loading) {
    const skeletons = Array.from({ length: 6 }, (_, i) => i);
    return (
      <View style={styles.container}>
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              onPress={() => setActiveTab('sent')}
              style={[styles.tabButton, activeTab === 'sent' && styles.tabButtonActive]}
            >
              <SJText style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>{strings.tabs.sent}</SJText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('received')}
              style={[styles.tabButton, activeTab === 'received' && styles.tabButtonActive]}
            >
              <SJText style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>{strings.tabs.received}</SJText>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={skeletons}
          keyExtractor={(i) => `skeleton-${i}`}
          renderItem={() => <TopMatchCardSkeleton style={styles.offerSkeletonCard} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
            <TouchableOpacity
              onPress={() => setActiveTab('sent')}
              style={[styles.tabButton, activeTab === 'sent' && styles.tabButtonActive]}
            >
              <SJText style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>{strings.tabs.sent}</SJText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('received')}
            style={[styles.tabButton, activeTab === 'received' && styles.tabButtonActive]}
          >
              <SJText style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>{strings.tabs.received}</SJText>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={data}
        renderItem={renderOffer}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        initialNumToRender={10}
        windowSize={10}
        maxToRenderPerBatch={10}
        removeClippedSubviews={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <SJText style={styles.emptyTitle}>
              {activeTab === 'sent' ? strings.emptySentTitle : strings.emptyReceivedTitle}
            </SJText>
            <SJText style={styles.emptySubtitle}>
              {activeTab === 'sent' ? strings.emptySentSubtitle : strings.emptyReceivedSubtitle}
            </SJText>
          </View>
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  tabsWrapper: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
  listContainer: {
    padding: 20,
  },
  offerCard: {
    width: width - 80,
    marginHorizontal: 20,
    marginBottom: 18,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: colors.primaryDark,
    fontSize: 12,
  },
  offerMetaSection: {
    gap: 12,
  },
  offerMetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  offerMetaUser: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  offerMetaDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  offerMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  offerMetaLabel: {
    minWidth: 70,
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  offerMetaContent: {
    flex: 1,
  },
  offerItemsList: {
    gap: 4,
  },
  offerItemText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  offerItemEmpty: {
    fontSize: 12,
    color: '#cbd5f5',
  },
  offerMoreItems: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  offerTopUpRow: {
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  offerTopUpLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  offerSkeletonCard: {
    width: width - 40,
    marginHorizontal: 20,
    marginBottom: 18,
  },
});

export default OffersScreen;