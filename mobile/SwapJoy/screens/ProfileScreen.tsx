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
import FavoriteToggleButton from '../components/FavoriteToggleButton';
import ItemCardCollection from '../components/ItemCardCollection';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Dimensions, Alert } from 'react-native';
import { ApiService } from '../services/api';
import { useLocalization } from '../localization';
import type { AppLanguage } from '../types/language';
import { DEFAULT_LANGUAGE } from '../types/language';

const FollowButton: React.FC<{ targetUserId: string }> = ({ targetUserId }) => {
  const { t, language } = useLocalization();
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
          Alert.alert(
            t('profileScreen.alerts.errorTitle'),
            error.message || t('profileScreen.alerts.unfollowFailed')
          );
        } else {
          setIsFollowing(false);
        }
      } else {
        const { error } = await ApiService.followUser(targetUserId);
        if (error) {
          Alert.alert(
            t('profileScreen.alerts.errorTitle'),
            error.message || t('profileScreen.alerts.followFailed')
          );
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
        {loading
          ? t('profileScreen.followButton.loading')
          : isFollowing
            ? t('profileScreen.followButton.unfollow')
            : t('profileScreen.followButton.follow')}
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
  <View style={styles.profileSection}>
    <View style={styles.avatarSection}>
      <SkeletonLoader width={100} height={100} borderRadius={50} />
    </View>
    <View style={styles.statsInfoRow}>
      <View style={styles.socialGrid}>
        <View style={styles.socialStatItem}>
          <SkeletonLoader width={40} height={20} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={50} height={12} />
        </View>
        <View style={styles.socialStatItem}>
          <SkeletonLoader width={40} height={20} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={50} height={12} />
        </View>
      </View>
    </View>
    <View style={styles.userInfoSection}>
      <SkeletonLoader width="60%" height={22} style={{ marginBottom: 8, alignSelf: 'center' }} />
      <SkeletonLoader width="40%" height={15} style={{ marginBottom: 8, alignSelf: 'center' }} />
      <SkeletonLoader width="80%" height={14} style={{ alignSelf: 'center' }} />
    </View>
  </View>
));

// Stats Skeleton
const StatsSkeleton = memo(() => (
  <>
    <View style={styles.statItem}>
      <SkeletonLoader width={40} height={20} style={{ marginBottom: 4 }} />
      <SkeletonLoader width={50} height={12} />
    </View>
    <View style={styles.statItem}>
      <SkeletonLoader width={40} height={20} style={{ marginBottom: 4 }} />
      <SkeletonLoader width={50} height={12} />
    </View>
  </>
));

// Grid Items Skeleton
const GridItemsSkeleton = memo(() => {
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = Math.floor((screenWidth - 60) / 2);
  const cardHeight = Math.round(cardWidth * 1.5);
  const skeletonItems = Array.from({ length: 6 }, (_, i) => i);

  const imageHeight = Math.round(cardHeight * 0.65);

  return (
    <View style={styles.gridListContent}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {skeletonItems.map((item, index) => (
          <View
            key={item}
            style={[
              styles.gridCard,
              { width: cardWidth, height: cardHeight, marginBottom: 18 },
              index % 2 === 0 ? styles.gridCardLeft : styles.gridCardRight,
            ]}
          >
            <SkeletonLoader width="100%" height={imageHeight} borderRadius={18} />
            <View style={{ marginTop: 12, gap: 8 }}>
              <SkeletonLoader width="70%" height={16} borderRadius={8} />
              <SkeletonLoader width="50%" height={14} borderRadius={7} />
              <SkeletonLoader width="80%" height={12} borderRadius={6} />
            </View>
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
  const { t, language } = useLocalization();
  const {
    user,
    profile,
    stats,
    rating,
    userItems,
    savedItems,
    draftItems,
    followCounts,
    loadingProfile,
    loadingMetrics,
    loadingFollowCounts,
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

  const strings = useMemo(() => ({
    stats: {
      followers: t('profileScreen.stats.followers'),
      following: t('profileScreen.stats.following'),
      ratingTitle: t('profileScreen.stats.ratingTitle'),
      reviews: t('profileScreen.stats.reviews'),
    },
    tabs: {
      published: t('profileScreen.tabs.published'),
      saved: t('profileScreen.tabs.saved')
    },
    loading: {
      items: t('profileScreen.loading.items'),
    },
    empty: {
      title: t('profileScreen.empty.title'),
      published: t('profileScreen.empty.published'),
      saved: t('profileScreen.empty.saved'),
      drafts: t('profileScreen.empty.drafts'),
    },
  }), [t]);

  const reviewsLabel = useCallback(
    (count: number) => strings.stats.reviews.replace('{count}', String(count)),
    [strings.stats.reviews]
  );

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



  const renderStatItem = useCallback((title: string, value: string | number, subtitle?: string) => (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  ), []);

  // removed unused renderProfileItem helper

  const handleItemPress = useCallback(
    (item: any) => navigation.navigate('ItemDetails', { itemId: item.id }),
    [navigation]
  );

  const buildFavoriteData = useCallback(
    (item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      currency: item.currency,
      condition: item.condition,
      image_url: item.image_url,
      category: item.category ?? item.categories ?? null,
      categories: item.categories ?? null,
      category_name:
        item.category_name ??
        item?.category_name_en ??
        item?.category_name_ka ??
        (typeof item?.category === 'string' ? item.category : null),
      category_name_en: item?.category_name_en ?? null,
      category_name_ka: item?.category_name_ka ?? null,
      created_at: item.created_at,
    }),
    []
  );

  const renderFavoriteButton = useCallback(
    (item: any) => (
      <FavoriteToggleButton itemId={item.id} item={buildFavoriteData(item)} size={18} />
    ),
    [buildFavoriteData]
  );

  const profileHeader = (
    <View>
      {/* Profile Header with Integrated Stats */}
      {loadingProfile ? (
        <ProfileHeaderSkeleton />
      ) : (
        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
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
          </View>

          {/* Followers & Following */}
          {!loadingFollowCounts && (
            <View style={styles.statsInfoRow}>
              <View style={styles.socialGrid}>
                <TouchableOpacity
                  style={styles.socialStatItem}
                  onPress={() =>
                    navigation.navigate('FollowersFollowing', {
                      userId: viewedUserId || user?.id,
                      initialTab: 'followers',
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.socialStatValue}>{followCounts.followers}</Text>
                  <Text style={styles.socialStatLabel}>{strings.stats.followers}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialStatItem}
                  onPress={() =>
                    navigation.navigate('FollowersFollowing', {
                      userId: viewedUserId || user?.id,
                      initialTab: 'following',
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.socialStatValue}>{followCounts.following}</Text>
                  <Text style={styles.socialStatLabel}>{strings.stats.following}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* User Info */}
          <View style={styles.userInfoSection}>
            <Text style={styles.userName}>
              {profile?.first_name || (user as any)?.user_metadata?.first_name || ''}{' '}
              {profile?.last_name || (user as any)?.user_metadata?.last_name || ''}
            </Text>
            {(
              profile?.username ||
              (user as any)?.user_metadata?.username ||
              (user as any)?.email?.split?.('@')?.[0]
            ) && (
              <Text style={styles.username}>@
                {profile?.username ||
                  (user as any)?.user_metadata?.username ||
                  (user as any)?.email?.split?.('@')?.[0]}
              </Text>
            )}
            {(profile?.email || (user as any)?.email) && (
              <Text style={styles.emailText}>
                {profile?.email || (user as any)?.email}
              </Text>
            )}
            {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          </View>

          {/* Follow button (other users only) */}
          {isViewingOtherUser && (
            <View style={styles.followButtonContainer}>
              <FollowButton targetUserId={viewedUserId!} />
            </View>
          )}

          {/* Favorite Categories */}
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
        </View>
      )}

      {/* Rating */}
      {!loadingMetrics && rating.totalRatings > 0 && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>{strings.stats.ratingTitle}</Text>
          <View style={styles.ratingContent}>
            <Text style={styles.ratingValue}>{formatRating(rating.averageRating)}</Text>
            <Text style={styles.ratingStars}>★★★★★</Text>
            <Text style={styles.ratingCount}>{reviewsLabel(rating.totalRatings)}</Text>
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
                <Text style={[styles.tabText, activeTab === 'published' && styles.tabTextActive]}>
                  {strings.tabs.published}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('saved')}
                style={[styles.tabButton, activeTab === 'saved' && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
                  {strings.tabs.saved}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLoadingCurrentTab ? (
            <View style={styles.loadingItemsContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingItemsText}>{strings.loading.items}</Text>
            </View>
          ) : gridData.length === 0 ? (
            <View style={styles.emptyItemsContainer}>
              <Text style={styles.emptyItemsText}>{strings.empty.title}</Text>
              <Text style={styles.emptyItemsSubtext}>
                {activeTab === 'published'
                  ? strings.empty.published
                  : activeTab === 'saved'
                    ? strings.empty.saved
                    : strings.empty.drafts}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ItemCardCollection
        items={gridData}
        t={t}
        language={language as AppLanguage}
        onItemPress={handleItemPress}
        favoriteButtonRenderer={renderFavoriteButton}
        listHeaderComponent={profileHeader}
        emptyComponent={isLoadingCurrentTab ? <GridItemsSkeleton /> : null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridListContent}
        horizontalPadding={20}
        columnSpacing={20}
        rowSpacing={18}
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
  profileSection: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 20,
    marginBottom: 10,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  statsInfoRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 24,
  },
  statsGrid: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  socialGrid: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  userInfoSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  username: {
    fontSize: 15,
    color: '#737373',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 8,
    textAlign: 'center',
  },
  bio: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 20,
    textAlign: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#737373',
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  socialStatItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  socialStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  socialStatLabel: {
    fontSize: 12,
    color: '#737373',
    fontWeight: '500',
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
  gridListContent: {
    paddingTop: 6,
    paddingBottom: 120,
  },
  gridCard: {
    marginBottom: 18,
  },
  gridCardLeft: {
    marginLeft: 20,
    marginRight: 10,
  },
  gridCardRight: {
    marginLeft: 10,
    marginRight: 20,
  },
  followButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
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
  followCountsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  followCountItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followCountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  followCountLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProfileScreen;