import React, { useCallback, memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExploreScreenProps } from '../types/navigation';
import { useExploreData, AIOffer } from '../hooks/useExploreData';
import { useRecentlyListed } from '../hooks/useRecentlyListed';
import { useTopCategories } from '../hooks/useTopCategories';
import { useOtherItems } from '../hooks/useOtherItems';
import CachedImage from '../components/CachedImage';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.7;
const GRID_ITEM_WIDTH = (width - 60) / 2; // 2 columns with margins

const ExploreScreen: React.FC<ExploreScreenProps> = memo(({ navigation }) => {
  const { aiOffers, loading: topPicksLoading, hasData, isInitialized, user, refreshData: refreshTopPicks } = useExploreData();
  const { items: recentItems, loading: recentLoading, refresh: refreshRecent } = useRecentlyListed(10);
  const { categories: topCategories, loading: categoriesLoading, refresh: refreshCategories } = useTopCategories(6);
  const { items: otherItems, pagination, loading: othersLoading, loadingMore, loadMore, refresh: refreshOthers } = useOtherItems(10);
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshTopPicks(),
      refreshRecent(),
      refreshCategories(),
      refreshOthers()
    ]);
    setRefreshing(false);
  }, [refreshTopPicks, refreshRecent, refreshCategories, refreshOthers]);

  const loading = topPicksLoading && recentLoading && categoriesLoading && othersLoading;


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

  const renderRecentItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.recentCard}
      onPress={() => (navigation as any).navigate('ItemDetails', { itemId: item.id })}
    >
      <CachedImage
        uri={item.image_url || 'https://via.placeholder.com/200x150'}
        style={styles.recentImage}
        resizeMode="cover"
        fallbackUri="https://picsum.photos/200/150?random=2"
      />
      <View style={styles.recentDetails}>
        <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.recentPrice}>${(item.price || item.estimated_value || 0).toFixed(2)}</Text>
        <Text style={styles.recentCondition}>{item.condition}</Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const renderCategory = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => {
        // TODO: Navigate to category items screen
        console.log('Category pressed:', item.name);
      }}
    >
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>{item.item_count} items</Text>
    </TouchableOpacity>
  ), []);

  const renderGridItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[styles.gridItem, index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight]}
      onPress={() => (navigation as any).navigate('ItemDetails', { itemId: item.id })}
    >
      <CachedImage
        uri={item.image_url || 'https://via.placeholder.com/200x150'}
        style={styles.gridImage}
        resizeMode="cover"
        fallbackUri="https://picsum.photos/200/150?random=3"
      />
      <View style={styles.gridDetails}>
        <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.gridPrice}>${(item.price || item.estimated_value || 0).toFixed(2)}</Text>
        <Text style={styles.gridCondition} numberOfLines={1}>{item.condition}</Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }, [loadingMore]);

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
    <View style={styles.container}>
      <FlatList
        data={otherItems}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainContent}
        ListHeaderComponent={
          <>
            {/* Top Matches Section */}
            {aiOffers.length > 0 && (
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
            )}

            {/* Recently Listed Section */}
            {recentItems.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recently Listed</Text>
                <Text style={styles.sectionSubtitle}>New items from the last month</Text>
                <FlatList
                  data={recentItems}
                  renderItem={renderRecentItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  snapToInterval={ITEM_WIDTH * 0.8 + 15}
                  decelerationRate="fast"
                />
              </View>
            )}

            {/* Top Categories Section */}
            {topCategories.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Categories</Text>
                <View style={styles.categoriesGrid}>
                  {topCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.categoryCard}
                      onPress={() => {
                        // TODO: Navigate to category items
                        console.log('Category pressed:', category.name);
                      }}
                    >
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryCount}>{category.item_count} items</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Others Section Header */}
            {otherItems.length > 0 && (
              <View style={[styles.section, styles.othersHeader]}>
                <Text style={styles.sectionTitle}>Explore More</Text>
                <Text style={styles.sectionSubtitle}>Discover all available items</Text>
              </View>
            )}
          </>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
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
  mainContent: {
    paddingBottom: 20,
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
  othersHeader: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: -10,
    marginBottom: 10,
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
  // Recently Listed Styles
  recentCard: {
    width: ITEM_WIDTH * 0.8,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  recentImage: {
    width: '100%',
    height: 140,
  },
  recentDetails: {
    padding: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recentPrice: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  recentCondition: {
    fontSize: 12,
    color: '#777',
    textTransform: 'capitalize',
  },
  // Category Styles
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryCard: {
    width: (width - 70) / 3, // 3 columns
    margin: 5,
    padding: 15,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: '#007AFF',
  },
  // Grid Styles (2 columns)
  gridItem: {
    width: GRID_ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  gridItemLeft: {
    marginLeft: 20,
    marginRight: 10,
  },
  gridItemRight: {
    marginLeft: 10,
    marginRight: 20,
  },
  gridImage: {
    width: '100%',
    height: 150,
  },
  gridDetails: {
    padding: 10,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    height: 35,
  },
  gridPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  gridCondition: {
    fontSize: 11,
    color: '#777',
    textTransform: 'capitalize',
  },
  footerLoader: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default ExploreScreen;