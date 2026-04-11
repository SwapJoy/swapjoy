import React, { memo, useMemo, useState, useCallback } from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions, } from 'react-native';
import { colors } from '@navigation/MainTabNavigator.styles';
import SJText from '../components/SJText';
import { OffersScreenProps } from '../types/navigation';
import { useOffersData, Offer } from '../hooks/useOffersData';
import { useLocalization } from '../localization';
import OfferListCard from '../components/OfferListCard';
import { MatchCardSkeleton } from '../components/OfferListCard';
import type { AppLanguage } from '../types/language';
import { DEFAULT_LANGUAGE } from '../types/language';

const { width } = Dimensions.get('window');

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

  const OfferRow = React.memo(
    ({ item }: { item: Offer }) => {
      const isSent = activeTab === 'sent';
      const resolvedLanguage = (language ?? DEFAULT_LANGUAGE) as AppLanguage;
      return (
        <OfferListCard
          item={item}
          isSent={isSent}
          language={resolvedLanguage}
          strings={strings}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          onPress={() => {
            (navigation as any).navigate('OfferDetails', { offer: item });
          }}
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
          renderItem={() => <MatchCardSkeleton cardWidth={width} style={styles.offerSkeletonCard} />}
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
            colors={[colors.primaryYellow]}
            tintColor={colors.primaryYellow}
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
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primaryYellow,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8e8e8e',
  },
  tabTextActive: {
    color: colors.primaryYellow,
    fontWeight: '700',
  },
  listContainer: {
    paddingTop: 14,
    paddingBottom: 24,
    paddingHorizontal: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e3e3e3',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9e9e9e',
    textAlign: 'center',
  },
  offerSkeletonCard: {
    width: width,
    marginBottom: 14,
  },
});

export default OffersScreen;