import React, { memo, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {View, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, } from 'react-native';
import SJText from '../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileScreenProps } from '../types/navigation';
import { useProfileData } from '../hooks/useProfileData';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import CachedImage from '../components/CachedImage';
import FavoriteToggleButton from '../components/FavoriteToggleButton';
import ItemCardCollection from '../components/ItemCardCollection';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Dimensions, Alert } from 'react-native';
import { ApiService } from '../services/api';
import { useLocalization } from '../localization';
import type { AppLanguage } from '../types/language';
import { DEFAULT_LANGUAGE } from '../types/language';
import { colors } from '@navigation/MainTabNavigator.styles';

const FollowButton: React.FC<{ targetUserId: string | undefined }> = ({ targetUserId }) => {
  const { t, language } = useLocalization();
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Strict validation before making API call
      if (!targetUserId || typeof targetUserId !== 'string' || targetUserId.trim() === '') {
        console.warn('[FollowButton] Invalid targetUserId, skipping isFollowing check:', targetUserId);
        if (mounted) setIsFollowing(false);
        return;
      }
      // UUID format validation
      const trimmed = targetUserId.trim();
      if (trimmed.length < 36 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
        console.warn('[FollowButton] targetUserId is not a valid UUID, skipping:', trimmed);
        if (mounted) setIsFollowing(false);
        return;
      }
      const { data, error } = await ApiService.isFollowing(targetUserId);
      if (error) {
        console.error('[FollowButton] Error checking follow status:', error);
      }
      if (mounted) setIsFollowing(Boolean(data));
    })();
    return () => {
      mounted = false;
    };
  }, [targetUserId]);

  const toggleFollow = async () => {
    if (loading) return;
    // Validate targetUserId before proceeding
    if (!targetUserId || typeof targetUserId !== 'string' || targetUserId.trim() === '') {
      console.warn('[FollowButton] Cannot toggle follow: invalid targetUserId:', targetUserId);
      return;
    }
    const trimmed = targetUserId.trim();
    if (trimmed.length < 36 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
      console.warn('[FollowButton] Cannot toggle follow: targetUserId is not a valid UUID:', trimmed);
      return;
    }
    setLoading(true);
    try {
      if (isFollowing) {
        const { error } = await ApiService.unfollowUser(trimmed);
        if (error) {
          Alert.alert(
            t('profileScreen.alerts.errorTitle'),
            error.message || t('profileScreen.alerts.unfollowFailed')
          );
        } else {
          setIsFollowing(false);
        }
      } else {
        const { error } = await ApiService.followUser(trimmed);
        if (error) {
          Alert.alert(
            t('profileScreen.alerts.errorTitle'),
            error.message || t('profileScreen.alerts.followFailed')
          );
        } else {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error('[FollowButton] Error toggling follow:', error);
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
      <SJText
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
      </SJText>
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
    <View style={styles.profileContentRow}>
      <View style={styles.avatarSection}>
        <SkeletonLoader width={100} height={100} borderRadius={50} />
      </View>
      <View style={styles.profileRightContent}>
        <SkeletonLoader width="60%" height={15} style={styles.skeletonTitleLine} />
        <View style={styles.statsInfoRow}>
          <View style={styles.socialGrid}>
              <View style={styles.socialStatItem}>
                <SkeletonLoader width={40} height={20} style={styles.skeletonStatNumber} />
              <SkeletonLoader width={50} height={12} />
            </View>
            <View style={styles.socialStatItem}>
                <SkeletonLoader width={40} height={20} style={styles.skeletonStatNumber} />
              <SkeletonLoader width={50} height={12} />
            </View>
          </View>
        </View>
      </View>
    </View>
    <View style={styles.userNameSection}>
      <SkeletonLoader width="50%" height={22} />
    </View>
    <View style={styles.bioSection}>
      <SkeletonLoader width="80%" height={14} />
    </View>
  </View>
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
      <View style={styles.gridListRow}>
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
            <View style={styles.gridCardDetails}>
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
  const { user: currentUser } = useAuth();
  const isViewingOtherUser = Boolean(viewedUserId && currentUser?.id !== viewedUserId);
  
  // Use global ProfileContext for current user, useProfileData for other users
  const globalProfile = useProfile();
  const otherUserProfile = useProfileData(viewedUserId);
  
  // Select the appropriate profile data based on whether viewing other user
  // For current user, use global profile context; for other users, use useProfileData
  const profileData = isViewingOtherUser ? otherUserProfile : {
    ...otherUserProfile,
    // Override with global profile data for current user
    profile: globalProfile.profile,
    stats: globalProfile.stats,
    rating: globalProfile.rating,
    favoriteCategories: globalProfile.favoriteCategories,
    favoriteCategoryNames: globalProfile.favoriteCategoryNames,
    loadingProfile: globalProfile.loading,
    loadingMetrics: globalProfile.loading,
  };
  
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
  } = profileData;

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

  // removed unused renderProfileItem helper
  const handleItemPress = useCallback(
    (item: any) => navigation.navigate('ItemDetails', { itemId: item.id, item }),
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
          <View style={styles.profileContentRow}>
            {/* Avatar - Left Edge */}
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

            {/* Right Content */}
            <View style={styles.profileRightContent}>
              {/* Username - Top */}
              {(
                profile?.username ||
                (user as any)?.user_metadata?.username ||
                (user as any)?.email?.split?.('@')?.[0]
              ) && (
                <SJText style={styles.username}>@
                  {profile?.username ||
                    (user as any)?.user_metadata?.username ||
                    (user as any)?.email?.split?.('@')?.[0]}
                </SJText>
              )}

              {/* Followers & Following - Under Username */}
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
                      <SJText style={styles.socialStatValue}>{followCounts.followers}</SJText>
                      <SJText style={styles.socialStatLabel}>{strings.stats.followers}</SJText>
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
                      <SJText style={styles.socialStatValue}>{followCounts.following}</SJText>
                      <SJText style={styles.socialStatLabel}>{strings.stats.following}</SJText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Full Name - Under Avatar */}
          <View style={styles.userNameSection}>
            <SJText style={styles.userName}>
              {profile?.first_name || (user as any)?.user_metadata?.first_name || ''}{' '}
              {profile?.last_name || (user as any)?.user_metadata?.last_name || ''}
            </SJText>
          </View>

          {/* Bio - Under Full Name */}
          {profile?.bio && (
            <View style={styles.bioSection}>
              <SJText style={styles.bio}>{profile.bio}</SJText>
            </View>
          )}

          {/* Follow button (other users only) */}
          {isViewingOtherUser && viewedUserId && typeof viewedUserId === 'string' && viewedUserId.trim() !== '' && (
            <View style={styles.followButtonContainer}>
              <FollowButton targetUserId={viewedUserId} />
            </View>
          )}
        </View>
      )}

      {/* Rating */}
      {!loadingMetrics && rating.totalRatings > 0 && (
        <View style={styles.ratingContainer}>
          <SJText style={styles.ratingTitle}>{strings.stats.ratingTitle}</SJText>
          <View style={styles.ratingContent}>
            <SJText style={styles.ratingValue}>{formatRating(rating.averageRating)}</SJText>
            <SJText style={styles.ratingStars}>★★★★★</SJText>
            <SJText style={styles.ratingCount}>{reviewsLabel(rating.totalRatings)}</SJText>
          </View>
        </View>
      )}

      {/* Tabs (hide for other users) */}
      {!isViewingOtherUser && (
        <View>
          <View>
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                onPress={() => setActiveTab('published')}
                style={[styles.tabButton, activeTab === 'published' && styles.tabButtonActive]}
              >
                <SJText style={[styles.tabText, activeTab === 'published' && styles.tabTextActive]}>
                  {strings.tabs.published}
                </SJText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('saved')}
                style={[styles.tabButton, activeTab === 'saved' && styles.tabButtonActive]}
              >
                <SJText style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
                  {strings.tabs.saved}
                </SJText>
              </TouchableOpacity>
            </View>
          </View>

          {isLoadingCurrentTab ? (
            <View style={styles.loadingItemsContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <SJText style={styles.loadingItemsText}>{strings.loading.items}</SJText>
            </View>
          ) : gridData.length === 0 ? (
            <View style={styles.emptyItemsContainer}>
              <SJText style={styles.emptyItemsText}>{strings.empty.title}</SJText>
              <SJText style={styles.emptyItemsSubtext}>
                {activeTab === 'published'
                  ? strings.empty.published
                  : activeTab === 'saved'
                    ? strings.empty.saved
                    : strings.empty.drafts}
              </SJText>
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
        horizontalPadding={0}
        columnSpacing={1}
        rowSpacing={2}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
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
    backgroundColor: colors.primaryDark,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  profileContentRow: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  avatarSection: {
    alignItems: 'flex-start',
    marginLeft: 0,
    marginRight: 12,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primaryDark,
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
  profileRightContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  statsInfoRow: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    marginTop: 8,
    marginBottom: 0,
    gap: 8,
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
  userNameSection: {
    paddingHorizontal: 0,
    marginTop: 8,
    marginBottom: 8,
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
    marginBottom: 0,
    textAlign: 'left',
  },
  username: {
    fontSize: 15,
    marginBottom: 0,
    textAlign: 'left',
  },
  emailText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  bioSection: {
    paddingHorizontal: 0,
    marginTop: 4,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  socialStatItem: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 70,
  },
  socialStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  socialStatLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  ratingContainer: {
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
    backgroundColor: colors.primaryDark,
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
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.primaryDark,
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
    backgroundColor: colors.primaryDark,
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
    backgroundColor: colors.primaryDark,
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
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0,
    borderBottomColor: colors.primaryYellow,
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
    borderBottomColor: colors.primaryYellow,
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primaryYellow,
    fontWeight: '700',
  },
  gridListContent: {
    paddingTop: 6,
    paddingBottom: 120,
  },
  gridListRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    marginBottom: 18,
  },
  gridCardDetails: {
    marginTop: 12,
    gap: 8,
  },
  skeletonTitleLine: {
    marginBottom: 8,
  },
  skeletonStatNumber: {
    marginBottom: 4,
  },
  gridCardLeft: {
    marginLeft: 0,
    marginRight: 10,
  },
  gridCardRight: {
    marginLeft: 10,
    marginRight: 0,
  },
  followButtonContainer: {
    paddingHorizontal: 0,
    marginTop: 8,
    marginBottom: 8,
  },
  followButton: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  followButtonPrimary: {
    backgroundColor: colors.primaryYellow,
  },
  followButtonFollowing: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  followButtonTextPrimary: {
    color: colors.primaryDark,
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
    backgroundColor: colors.primaryDark,
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