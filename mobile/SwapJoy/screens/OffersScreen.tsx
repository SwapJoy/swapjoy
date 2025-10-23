import React, { useState, useEffect } from 'react';
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
import { ApiService } from '../services/api';

interface Offer {
  id: string;
  message?: string;
  top_up_amount: number;
  status: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  receiver: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  offer_items: Array<{
    id: string;
    side: 'offered' | 'requested';
    item: {
      id: string;
      title: string;
      description: string;
      condition: string;
      estimated_value: number;
    };
  }>;
}

const OffersScreen: React.FC<OffersScreenProps> = ({ navigation }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await ApiService.getOffers();
      
      if (error) {
        console.error('Error fetching offers:', error);
        return;
      }

      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOffers();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'accepted':
        return '#4CAF50';
      case 'declined':
        return '#F44336';
      case 'completed':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const renderOffer = ({ item }: { item: Offer }) => (
    <TouchableOpacity style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.sender.first_name} {item.sender.last_name}
          </Text>
          <Text style={styles.username}>@{item.sender.username}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {item.message && (
        <Text style={styles.message} numberOfLines={3}>
          {item.message}
        </Text>
      )}

      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>Offered Items:</Text>
        {item.offer_items
          .filter(offerItem => offerItem.side === 'offered')
          .map((offerItem, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemTitle}>{offerItem.item.title}</Text>
              <Text style={styles.itemValue}>${offerItem.item.estimated_value}</Text>
            </View>
          ))}
      </View>

      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>Requested Items:</Text>
        {item.offer_items
          .filter(offerItem => offerItem.side === 'requested')
          .map((offerItem, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemTitle}>{offerItem.item.title}</Text>
              <Text style={styles.itemValue}>${offerItem.item.estimated_value}</Text>
            </View>
          ))}
      </View>

      {item.top_up_amount !== 0 && (
        <View style={styles.topUpSection}>
          <Text style={styles.topUpText}>
            {item.top_up_amount > 0 ? '+' : ''}${item.top_up_amount} top-up
          </Text>
        </View>
      )}

      <View style={styles.offerActions}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity style={styles.acceptButton}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineButton}>
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text style={styles.dateText}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No offers yet</Text>
            <Text style={styles.emptyText}>
              When someone makes an offer on your items, it will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  itemsSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemTitle: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  topUpSection: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  topUpText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  offerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  declineButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  declineButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OffersScreen;
