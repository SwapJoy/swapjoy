import React, { memo, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OffersScreenProps } from '../types/navigation';
import { useOffersData, Offer } from '../hooks/useOffersData';

const { width } = Dimensions.get('window');

const OffersScreen: React.FC<OffersScreenProps> = memo(({ route }) => {
  const { sentOffers, receivedOffers, loading, refreshing, onRefresh, getStatusColor, getStatusText } = useOffersData();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>((route?.params as any)?.initialTab ?? 'sent');

  const data = activeTab === 'sent' ? sentOffers : receivedOffers;

  const OfferRow = React.memo(({ item }: { item: Offer }) => (
    <TouchableOpacity style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Text style={styles.offerType}>
          {activeTab === 'sent' ? 'Sent Offer' : 'Received Offer'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.offerContent}>
        <Text style={styles.offerMessage} numberOfLines={2}>
          {item.message || 'No message provided'}
        </Text>
        
        {!!item.top_up_amount && item.top_up_amount !== 0 && (
          <Text style={styles.topUpAmount}>
            {item.top_up_amount > 0 ? `+$${item.top_up_amount.toFixed(2)} cash` : `They add $${Math.abs(item.top_up_amount).toFixed(2)}`}
          </Text>
        )}
        
        <View style={styles.itemsContainer}>
          {item.offer_items?.slice(0, 3).map((offerItem: any, index: number) => (
            <View key={index} style={styles.itemPreview}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {offerItem.item?.title || 'Item'}
              </Text>
            </View>
          ))}
          {item.offer_items && item.offer_items.length > 3 && (
            <Text style={styles.moreItems}>
              +{item.offer_items.length - 3} more items
            </Text>
          )}
        </View>
        
        <View style={styles.offerFooter}>
          <Text style={styles.offerDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <Text style={styles.offerUser}>
            {activeTab === 'sent' ? `To: ${item.receiver?.username}` : `From: ${item.sender?.username}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ), (prev, next) => (
    prev.item.id === next.item.id &&
    prev.item.status === next.item.status &&
    prev.item.top_up_amount === next.item.top_up_amount &&
    (prev.item.offer_items?.length || 0) === (next.item.offer_items?.length || 0)
  ));

  const renderOffer = useCallback(({ item }: { item: Offer }) => (
    <OfferRow item={item} />
  ), []);

  // Lightweight shimmer
  const SkeletonLoader: React.FC<{ width?: number | string; height?: number; borderRadius?: number; style?: any }> = ({ width = '100%', height = 16, borderRadius = 6, style }) => {
    const animatedValue = useRef(new (require('react-native').Animated.Value)(0)).current;
    const { Animated } = require('react-native');
    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(animatedValue, { toValue: 0, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    }, [animatedValue]);
    const opacity = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.8] });
    return (
      <Animated.View
        style={[{ width, height, borderRadius, backgroundColor: '#E1E9EE', opacity }, style]}
      />
    );
  };

  const OfferCardSkeleton: React.FC = () => (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <SkeletonLoader width={110} height={16} />
        <SkeletonLoader width={70} height={20} borderRadius={12} />
      </View>
      <View style={styles.offerContent}>
        <SkeletonLoader width={'80%'} height={14} style={{ marginBottom: 10 }} />
        <SkeletonLoader width={'50%'} height={16} style={{ marginBottom: 12 }} />
        <View style={{ gap: 6 }}>
          <SkeletonLoader width={'60%'} height={32} borderRadius={8} />
          <SkeletonLoader width={'50%'} height={32} borderRadius={8} />
          <SkeletonLoader width={'40%'} height={32} borderRadius={8} />
        </View>
        <View style={styles.offerFooter}>
          <SkeletonLoader width={90} height={12} />
          <SkeletonLoader width={120} height={12} />
        </View>
      </View>
    </View>
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
              <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>Sent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('received')}
              style={[styles.tabButton, activeTab === 'received' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>Received</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={skeletons}
          keyExtractor={(i) => `skeleton-${i}`}
          renderItem={() => <OfferCardSkeleton />}
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
            <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>Sent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('received')}
            style={[styles.tabButton, activeTab === 'received' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>Received</Text>
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
            <Text style={styles.emptyTitle}>No {activeTab === 'sent' ? 'sent' : 'received'} offers</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'sent' ? 'Send an offer to get the conversation started.' : `You'll see offers from others here.`}
            </Text>
          </View>
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabsWrapper: {
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  offerType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  offerContent: {
    padding: 15,
  },
  offerMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  topUpAmount: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemsContainer: {
    marginBottom: 10,
  },
  itemPreview: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 14,
    color: '#333',
  },
  moreItems: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  offerDate: {
    fontSize: 12,
    color: '#666',
  },
  offerUser: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
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
});

export default OffersScreen;