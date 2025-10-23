import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OffersScreenProps } from '../types/navigation';
import { useOffersData, Offer } from '../hooks/useOffersData';

const OffersScreen: React.FC<OffersScreenProps> = memo(() => {
  const { offers, loading, refreshing, onRefresh, getStatusColor, getStatusText } = useOffersData();

  const renderOffer = ({ item }: { item: Offer & { type: 'sent' | 'received' } }) => (
    <TouchableOpacity style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Text style={styles.offerType}>
          {item.type === 'sent' ? 'Sent Offer' : 'Received Offer'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.offerContent}>
        <Text style={styles.offerMessage} numberOfLines={2}>
          {item.message || 'No message provided'}
        </Text>
        
        {item.top_up_amount > 0 && (
          <Text style={styles.topUpAmount}>
            +${item.top_up_amount.toFixed(2)} cash
          </Text>
        )}
        
        <View style={styles.itemsContainer}>
          {item.offer_items?.slice(0, 3).map((offerItem, index) => (
            <View key={index} style={styles.itemPreview}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {offerItem.item.title}
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
            {item.type === 'sent' ? 'To' : 'From'}: {item.sender?.username || item.receiver?.username}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Offers</Text>
        <Text style={styles.headerSubtitle}>
          Manage your swap offers and proposals
        </Text>
      </View>

      <FlatList
        data={offers}
        renderItem={renderOffer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No offers yet</Text>
            <Text style={styles.emptySubtitle}>
              Start browsing items to make your first offer!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
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