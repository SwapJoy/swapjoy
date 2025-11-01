import React, { memo, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileScreenProps } from '../types/navigation';
import { useProfileData } from '../hooks/useProfileData';
import CachedImage from '../components/CachedImage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FlatList, Dimensions, Alert } from 'react-native';
import { ApiService } from '../services/api';
import { formatCurrency } from '../utils';

const FollowButton: React.FC<{ targetUserId: string }> = ({ targetUserId }) => {
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await ApiService.isFollowing(targetUserId);
      if (mounted) setIsFollowing(Boolean(data));
    })();
    return () => {
      mounted = false;
    };
  }, [targetUserId]);

  const toggleFollow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isFollowing) {
        const { error } = await ApiService.unfollowUser(targetUserId);
        if (error) {
          Alert.alert('Error', error.message || 'Failed to unfollow.');
        } else {
          setIsFollowing(false);
        }
      } else {
        const { error } = await ApiService.followUser(targetUserId);
        if (error) {
          Alert.alert('Error', error.message || 'Failed to follow.');
        } else {
          setIsFollowing(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleFollow}
      activeOpacity={0.8}
      style={[
        styles.followButton,
        isFollowing ? styles.followButtonFollowing : styles.followButtonPrimary,
      ]}
    >
      <Text
        style={[
          styles.followButtonText,
          isFollowing ? styles.followButtonTextFollowing : styles.followButtonTextPrimary,
        ]}
      >
        {loading ? 'Please wait…' : isFollowing ? 'Unfollow' : 'Follow'}
      </Text>
    </TouchableOpacity>
  );
};

// Skeleton loader component
const SkeletonLoader: React.FC<{ width?: number | string; height?: number; style?: any; borderRadius?: number }> = ({ 
  width = '100%', 
  height = 16, 
  style,
  borderRadius = 4 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: '#E1E9EE',
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Profile Header Skeleton
const ProfileHeaderSkeleton = memo(() => (
  <View style={styles.header}>
    <View style={styles.profileInfo}>
      <View style={styles.avatarContainer}>
        <SkeletonLoader width={80} height={80} borderRadius={40} />
      </View>
      <View style={styles.userInfo}>
        <SkeletonLoader width="70%" height={24} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="50%" height={18} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="90%" height={16} />
      </View>
    </View>
  </View>
));

// Stats Skeleton
const StatsSkeleton = memo(() => (
  <View style={styles.statsContainer}>
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <SkeletonLoader width={60} height={28} style={{ marginBottom: 4 }} />
        <SkeletonLoader width={80} height={14} />
      </View>
      <View style={styles.statItem}>
        <SkeletonLoader width={60} height={28} style={{ marginBottom: 4 }} />
        <SkeletonLoader width={80} height={14} />
      </View>
    </View>
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <SkeletonLoader width={60} height={28} style={{ marginBottom: 4 }} />
        <SkeletonLoader width={80} height={14} />
      </View>
      <View style={styles.statItem}>
        <SkeletonLoader width={60} height={28} style={{ marginBottom: 4 }} />
        <SkeletonLoader width={80} height={14} />
      </View>
    </View>
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <SkeletonLoader width={60} height={28} style={{ marginBottom: 4 }} />
        <SkeletonLoader width={80} height={14} />
      </View>
      <View style={styles.statItem}>
        <SkeletonLoader width={60} height={28} style={{ marginBottom: 4 }} />
        <SkeletonLoader width={80} height={14} />
      </View>
    </View>
  </View>
));

// Grid Items Skeleton
const GridItemsSkeleton = memo(() => {
  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width;
  const gridSpacing = 2;
  const itemSize = Math.floor((screenWidth - gridSpacing * (numColumns - 1)) / numColumns);
  const skeletonItems = Array.from({ length: 6 }, (_, i) => i);

  return (
    <View style={styles.gridList}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {skeletonItems.map((item) => (
          <View key={item} style={{ width: itemSize, height: itemSize * 1.7, marginBottom: 2 }}>
            <SkeletonLoader width="100%" height="100%" borderRadius={0} />
          </View>
        ))}
      </View>
    </View>
  );
});

const ProfileScreen: React.FC<ProfileScreenProps> = memo(() => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const viewedUserId: string | undefined = (route as any)?.name === 'UserProfile' ? (route as any)?.params?.userId : undefined;
  const {
    user,
    profile,
    stats,
    rating,
    userItems,
    savedItems,
    draftItems,
    loadingProfile,
    loadingMetrics,
    loadingPublishedItems,
    loadingSavedItems,
    loadingDraftItems,
    loadSavedItems,
    loadDraftItems,
    handleSignOut,
    formatSuccessRate,
    formatRating,
    favoriteCategories,
    favoriteCategoryNames,
  } = useProfileData(viewedUserId);

  const isViewingOtherUser = Boolean(viewedUserId && user?.id !== viewedUserId);

  const [activeTab, setActiveTab] = useState<'published' | 'saved' | 'drafts'>('published');
  useEffect(() => {
    if (isViewingOtherUser) setActiveTab('published');
  }, [isViewingOtherUser]);

  // Load items when tab changes (lazy loading)
  useEffect(() => {
    if (!isViewingOtherUser && activeTab === 'saved') {
      loadSavedItems();
    } else if (!isViewingOtherUser && activeTab === 'drafts') {
      loadDraftItems();
    }
  }, [activeTab, isViewingOtherUser, loadSavedItems, loadDraftItems]);

  const gridData = useMemo(() => {
    if (isViewingOtherUser) return userItems;
    if (activeTab === 'published') return userItems;
    if (activeTab === 'saved') return savedItems;
    return draftItems;
  }, [activeTab, userItems, savedItems, draftItems, isViewingOtherUser]);

  // Get loading state for current tab
  const isLoadingCurrentTab = useMemo(() => {
    if (isViewingOtherUser) return loadingPublishedItems;
    if (activeTab === 'published') return loadingPublishedItems;
    if (activeTab === 'saved') return loadingSavedItems;
    return loadingDraftItems;
  }, [activeTab, isViewingOtherUser, loadingPublishedItems, loadingSavedItems, loadingDraftItems]);

  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width;
  const gridSpacing = 2;
  const itemSize = useMemo(() => {
    const horizontalPadding = 0;
    return Math.floor((screenWidth - horizontalPadding - gridSpacing * (numColumns - 1)) / numColumns);
  }, [screenWidth]);


  const renderStatItem = useCallback((title: string, value: string | number, subtitle?: string) => (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  ), []);

  // removed unused renderProfileItem helper

  const renderGridItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ItemDetails', { itemId: item.id })}
      style={[styles.gridItem, { width: itemSize, height: itemSize * 1.7 }]}
    > 
      <CachedImage
        uri={item.image_url || ''}
        style={styles.gridImage}
        resizeMode="cover"
        fallbackUri={'https://via.placeholder.com/300?text=No+Image'}
        defaultSource={require('../assets/icon.png')}
      />
      <View style={styles.gridMetaBar}>
        <Text style={styles.gridMetaText} numberOfLines={1}>{item.title || 'Untitled'}</Text>
        {typeof item.price !== 'undefined' && item.price !== null && (
          <Text style={styles.gridMetaPrice}>{formatCurrency(Number(item.price), item.currency || 'USD').replace(/\.00$/, '')}</Text>
        )}
      </View>
    </TouchableOpacity>
  ), [itemSize, navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={gridData}
        keyExtractor={(it) => it.id}
        numColumns={3}
        renderItem={renderGridItem}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 2 }}
        contentContainerStyle={styles.gridList}
        showsVerticalScrollIndicator={false}
        initialNumToRender={18}
        windowSize={7}
        removeClippedSubviews
        maxToRenderPerBatch={24}
        updateCellsBatchingPeriod={50}
        getItemLayout={(_, index) => {
          const row = Math.floor(index / 3);
          const rowHeight = itemSize * 1.7 + 2; // item height + spacing
          return { length: rowHeight, offset: row * rowHeight, index };
        }}
        ListHeaderComponent={(
          <View>
            {/* Header */}
            {loadingProfile ? (
              <ProfileHeaderSkeleton />
            ) : (
              <View style={styles.header}>
                <View style={styles.profileInfo}>
                  <View style={styles.avatarContainer}>
                    <CachedImage
                      uri={
                        (profile as any)?.profile_image_url ||
                        (user as any)?.profile_image_url ||
                        (user as any)?.user_metadata?.avatar_url ||
                        'https://via.placeholder.com/100?text=Avatar'
                      }
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {profile?.first_name || (user as any)?.user_metadata?.first_name || ''} {profile?.last_name || (user as any)?.user_metadata?.last_name || ''}
                    </Text>
                    {(
                      profile?.username ||
                      (user as any)?.user_metadata?.username ||
                      (user as any)?.email?.split?.('@')?.[0]
                    ) && (
                      <Text style={styles.username}>@
                        {profile?.username || (user as any)?.user_metadata?.username || (user as any)?.email?.split?.('@')?.[0]}
                      </Text>
                    )}
                    {(profile?.bio) && (
                      <Text style={styles.bio}>{profile.bio}</Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Follow button (other users only) */}
            {isViewingOtherUser && (
              <View style={styles.followContainer}> 
                <FollowButton targetUserId={viewedUserId!} />
              </View>
            )}

            {/* Favorite Categories Section - centered and below header */}
            {Array.isArray(favoriteCategoryNames) && favoriteCategoryNames.length > 0 && (
              <View style={styles.favSection}>
                <View style={styles.favChipsContainerCentered}>
                  {favoriteCategoryNames.slice(0, 10).map((name) => (
                    <View key={name} style={styles.favChip}>
                      <Text style={styles.favChipText}>{name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Stats */}
            {loadingMetrics ? (
              <StatsSkeleton />
            ) : (
              <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                  {renderStatItem('Items Listed', stats.itemsListed)}
                  {renderStatItem('Items Swapped', stats.itemsSwapped)}
                </View>
                <View style={styles.statsRow}>
                  {renderStatItem('Sent Offers', (stats as any).sentOffers ?? Math.floor((stats.totalOffers || 0) / 2))}
                  {renderStatItem('Received Offers', (stats as any).receivedOffers ?? Math.ceil((stats.totalOffers || 0) / 2))}
                </View>
                <View style={styles.statsRow}>
                  {renderStatItem('Success Rate', formatSuccessRate(stats.successRate))}
                  {renderStatItem('Total Offers', stats.totalOffers)}
                </View>
              </View>
            )}

            {/* Rating */}
            {!loadingMetrics && rating.totalRatings > 0 && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingTitle}>Rating</Text>
                <View style={styles.ratingContent}>
                  <Text style={styles.ratingValue}>{formatRating(rating.averageRating)}</Text>
                  <Text style={styles.ratingStars}>★★★★★</Text>
                  <Text style={styles.ratingCount}>({rating.totalRatings} reviews)</Text>
                </View>
              </View>
            )}

            {/* Tabs (hide for other users) */}
            {!isViewingOtherUser && (
              <View style={styles.section}>
                <View style={styles.tabsWrapper}>
                  <View style={styles.tabsContainer}>
                    <TouchableOpacity
                      onPress={() => setActiveTab('published')}
                      style={[styles.tabButton, activeTab === 'published' && styles.tabButtonActive]}
                    >
                      <Text style={[styles.tabText, activeTab === 'published' && styles.tabTextActive]}>Published</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setActiveTab('saved')}
                      style={[styles.tabButton, activeTab === 'saved' && styles.tabButtonActive]}
                    >
                      <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>Saved</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setActiveTab('drafts')}
                      style={[styles.tabButton, activeTab === 'drafts' && styles.tabButtonActive]}
                    >
                      <Text style={[styles.tabText, activeTab === 'drafts' && styles.tabTextActive]}>Drafts</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {isLoadingCurrentTab ? (
                  <View style={styles.loadingItemsContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingItemsText}>Loading items...</Text>
                  </View>
                ) : gridData.length === 0 ? (
                  <View style={styles.emptyItemsContainer}>
                    <Text style={styles.emptyItemsText}>No items to display</Text>
                    <Text style={styles.emptyItemsSubtext}>
                      {activeTab === 'published' ? 'Publish items to show here.' : activeTab === 'saved' ? 'Save items to view them here.' : 'Your draft items will appear here.'}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          isLoadingCurrentTab ? (
            <GridItemsSkeleton />
          ) : null
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
  scrollView: {
    flex: 1,
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  ratingContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  ratingStars: {
    fontSize: 16,
    color: '#FFD700',
    marginRight: 10,
  },
  ratingCount: {
    fontSize: 14,
    color: '#666',
  },
  profileOptions: {
    backgroundColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  profileItemText: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
    marginLeft: 10,
  },
  signOutContainer: {
    padding: 20,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemsContainer: {
    marginTop: 10,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  itemCondition: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyItemsContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginTop: 10,
  },
  emptyItemsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  emptyItemsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  loadingItemsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginTop: 10,
  },
  loadingItemsText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  addItemsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addItemsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tabsWrapper: {
    marginHorizontal: -20, // cancel section horizontal padding to stretch full width
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '700',
  },
  gridList: {
    paddingTop: 6,
  },
  gridItem: {
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridMetaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  gridMetaText: {
    color: '#fff',
    fontSize: 11,
    flex: 1,
    marginRight: 6,
  },
  gridMetaPrice: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  followContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  followButton: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  followButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  followButtonFollowing: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  followButtonTextPrimary: {
    color: '#fff',
  },
  followButtonTextFollowing: {
    color: '#111',
  },
  favChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  favSection: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  favChipsContainerCentered: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  favChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  favChipText: {
    color: '#3b6cff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProfileScreen;