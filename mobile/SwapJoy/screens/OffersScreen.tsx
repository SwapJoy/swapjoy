import React, { memo, useMemo, useState, useCallback } from 'react';
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

const OffersScreen: React.FC<OffersScreenProps> = memo(() => {
  const { sentOffers, receivedOffers, loading, refreshing, onRefresh, getStatusColor, getStatusText } = useOffersData();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Offers</Text>
          <Text style={styles.headerSubtitle}>
            Manage your swap offers and proposals
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>
          Manage your swap offers and proposals
        </Text>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'sent' && styles.tabBtnActive]} onPress={() => setActiveTab('sent')}>
            <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>Sent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'received' && styles.tabBtnActive]} onPress={() => setActiveTab('received')}>
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
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777',
  },
  tabsRow: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
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