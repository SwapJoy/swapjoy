import React, { useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExploreScreenProps } from '../types/navigation';
import { useExploreData, AIOffer } from '../hooks/useExploreData';
import CachedImage from '../components/CachedImage';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.7;

const ExploreScreen: React.FC<ExploreScreenProps> = memo(({ navigation }) => {
  const { aiOffers, loading, hasData, isInitialized, user, refreshData } = useExploreData();


  const renderAIOffer = useCallback(({ item }: { item: AIOffer }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => (navigation as any).navigate('ItemDetails', { 
        itemId: item.id, 
        isBundle: item.is_bundle || false,
        bundleItems: item.bundle_items || null 
      })}
    >
      <View style={styles.imageContainer}>
        <CachedImage
          uri={item.image_url || 'https://via.placeholder.com/200x150'}
          style={styles.itemImage}
          resizeMode="cover"
          fallbackUri="https://picsum.photos/200/150?random=1"
        />
        <View style={styles.matchScoreBadge}>
          <Text style={styles.matchScoreText}>{item.match_score}% Match</Text>
        </View>
        {item.is_bundle && (
          <View style={styles.bundleBadge}>
            <Text style={styles.bundleBadgeText}>Bundle</Text>
          </View>
        )}
      </View>
      <View style={styles.offerDetails}>
        <Text style={styles.offerTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.offerValue}>
          {item.is_bundle ? 'Bundle Value' : 'Price'}: ${(item.price || item.estimated_value || 0).toFixed(2)}
        </Text>
        {item.is_bundle && item.bundle_items && (
          <Text style={styles.bundleItems} numberOfLines={1}>
            {item.bundle_items.map(bundleItem => bundleItem.title).join(' + ')}
          </Text>
        )}
        <Text style={styles.matchReason} numberOfLines={1}>{item.reason}</Text>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.user.first_name} {item.user.last_name}
          </Text>
          <Text style={styles.username}>@{item.user.username}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please sign in to view AI Matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isInitialized || loading || !hasData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding perfect matches for you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollView} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refreshData}
          colors={['#007AFF']}
          tintColor="#007AFF"
        />
      }
    >
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Matches</Text>
          <FlatList
            data={aiOffers}
            renderItem={renderAIOffer}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            snapToInterval={ITEM_WIDTH + 20}
            decelerationRate="fast"
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={10}
            initialNumToRender={3}
            getItemLayout={(data, index) => ({
              length: ITEM_WIDTH + 20,
              offset: (ITEM_WIDTH + 20) * index,
              index,
            })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Our AI analyzes your preferences, location, and item history to find the perfect swap matches.
              Each recommendation includes a match score and reason why it's perfect for you.
            </Text>
          </View>
        </View>
      </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  horizontalList: {
    paddingVertical: 10,
  },
  offerCard: {
    width: ITEM_WIDTH,
    marginRight: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  matchScoreBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchScoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  offerDetails: {
    padding: 15,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  offerValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  matchReason: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  username: {
    fontSize: 12,
    color: '#777',
  },
  infoCard: {
    backgroundColor: '#e6f7ff',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bundleBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff6b35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bundleBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bundleItems: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default ExploreScreen;