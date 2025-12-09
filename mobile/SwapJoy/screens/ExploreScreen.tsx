import React, { memo, useEffect, useLayoutEffect, useState, useMemo, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExploreScreenProps, RootStackParamList } from '../types/navigation';
import { SectionType } from '../types/section';
import { SectionView } from '../components/SectionView';
import LocationSelector from '../components/LocationSelector';
import type { LocationSelection } from '../types/location';
import { useExploreScreenState } from '../hooks/useExploreScreenState';
import { DeviceService } from '../services/deviceService';
import SearchModal from '../components/SearchModal';
import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp } from '@react-navigation/native';
import { ApiService } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOP_MATCH_CARD_WIDTH = SCREEN_WIDTH * 0.75;

const ExploreScreen: React.FC<ExploreScreenProps> = memo(({ navigation }) => {
  // Request push notification permission when user reaches the main Explore screen (post-onboarding)
  useEffect(() => {
    const requestPushPermission = async () => {
      if (Platform.OS !== 'ios') {
        return;
      }

      try {
        await DeviceService.requestNotificationPermissions();
      } catch (error) {
        console.warn('Failed to request push notification permission on main screen:', error);
      }
    };

    void requestPushPermission();
  }, []);

  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {
    t,
    language,
    strings,
    searchStrings,
    user,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    searchError,
    handleClearSearch,
    performSearch,
    hasSearchQuery,
    locationModalVisible,
    handleOpenLocationSelector,
    handleLocationModalClose,
    handleManualLocationSelect,
    loadingLocation,
    updatingLocation,
    locationCoords,
    locationRadius,
    locationCityId,
    isFavorite,
    toggleFavorite,
  } = useExploreScreenState();

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [userLocationParams, setUserLocationParams] = useState<{
    p_user_id?: string;
    p_user_lat?: number | null;
    p_user_lng?: number | null;
    p_radius_km?: number;
  }>({});

  // Load user location parameters
  useEffect(() => {
    const loadUserLocationParams = async () => {
      if (!user?.id) {
        setUserLocationParams({});
        return;
      }

      try {
        const { data: profile } = await ApiService.getProfile();
        if (profile) {
          const lat = (profile as any).manual_location_lat ?? locationCoords.lat ?? null;
          const lng = (profile as any).manual_location_lng ?? locationCoords.lng ?? null;
          const radius = (profile as any).preferred_radius_km ?? locationRadius ?? 50;

          setUserLocationParams({
            p_user_id: user.id,
            p_user_lat: lat,
            p_user_lng: lng,
            p_radius_km: radius,
          });
        }
      } catch (error) {
        console.error('[ExploreScreen] Failed to load user location params:', error);
        setUserLocationParams({
          p_user_id: user.id,
          p_user_lat: locationCoords.lat,
          p_user_lng: locationCoords.lng,
          p_radius_km: locationRadius ?? 50,
        });
      }
    };

    void loadUserLocationParams();
  }, [user?.id, locationCoords.lat, locationCoords.lng, locationRadius]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: undefined,
      headerShown: !searchModalVisible,
      headerRight: () =>
        !searchModalVisible ? (
          <View style={styles.navRightGroup}>
            <TouchableOpacity
              style={styles.navIconButton}
              onPress={() => setSearchModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="search-outline" size={18} color="#0369a1" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navIconButton, styles.navLocationButton]}
              onPress={handleOpenLocationSelector}
              disabled={updatingLocation || loadingLocation}
              activeOpacity={0.8}
            >
              <Ionicons name="location-outline" size={18} color="#0369a1" />
            </TouchableOpacity>
          </View>
        ) : null,
    });
  }, [
    navigation,
    handleOpenLocationSelector,
    loadingLocation,
    updatingLocation,
    searchModalVisible,
  ]);

  useEffect(() => {
    const parent = navigation.getParent?.();
    if (!parent) return;

    parent.setOptions({
      // Hide tab bar while the search overlay is visible
      tabBarStyle: searchModalVisible ? { display: 'none' } : undefined,
    });
  }, [navigation, searchModalVisible]);

  const handleLocationSelect = useCallback(
    async (selection: LocationSelection) => {
      try {
        await handleManualLocationSelect(selection);
        // Reload location params after update
        if (user?.id) {
          setUserLocationParams({
            p_user_id: user.id,
            p_user_lat: selection.lat,
            p_user_lng: selection.lng,
            p_radius_km: locationRadius ?? 50,
          });
        }
      } catch (error: any) {
        console.error('[ExploreScreen] Failed to update manual location:', error);
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          error?.message || 'Failed to update location'
        );
      }
    },
    [handleManualLocationSelect, locationRadius, user?.id, t]
  );

  // Define all sections with their parameters
  const sections = useMemo(() => {
    // Don't create sections until we have user ID and location params are loaded
    if (!user?.id || !userLocationParams.p_user_id) return [];

    const baseParams = {
      p_user_id: userLocationParams.p_user_id,
      p_user_lat: userLocationParams.p_user_lat ?? null,
      p_user_lng: userLocationParams.p_user_lng ?? null,
      p_limit: 10,
    };

    return [
      {
        type: SectionType.NearYou,
        functionParams: {
          ...baseParams,
          p_radius_km: userLocationParams.p_radius_km ?? 50
        },
      },
      {
        type: SectionType.FreshFinds,
        functionParams: {
          ...baseParams,
        },
      },
      {
        type: SectionType.FavouriteCategories,
        functionParams: {
          ...baseParams,
        },
      },
      {
        type: SectionType.BestDeals,
        functionParams: {
          ...baseParams,
        },
      },
      {
        type: SectionType.TopPicksForYou,
        functionParams: {
          ...baseParams,
        },
      },
      {
        type: SectionType.TrendingCategories,
        functionParams: {
          p_user_id: userLocationParams.p_user_id,
          p_user_lat: userLocationParams.p_user_lat ?? null,
          p_user_lng: userLocationParams.p_user_lng ?? null,
          p_days_interval: 7,
          p_categories_limit: 10,
          p_items_per_category: 5,
        },
      },
      {
        type: SectionType.BudgetPicks,
        functionParams: {
          ...baseParams,
        },
      },
    ];
  }, [user?.id, userLocationParams]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          {/* Show loading or sign-in prompt */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {user?.id && userLocationParams.p_user_id && sections.map((section) => (
          <SectionView
            key={section.type}
            sectionType={section.type}
            functionParams={section.functionParams}
            autoFetch={true}
            cardWidth={TOP_MATCH_CARD_WIDTH}
          />
        ))}
      </ScrollView>

      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchStrings={searchStrings}
        strings={strings}
        t={t}
        language={language}
        searchResults={searchResults}
        searchLoading={searchLoading}
        searchError={searchError}
        hasSearchQuery={hasSearchQuery}
        onClearSearch={handleClearSearch}
        onItemPress={(item: any) => (navigation as any).navigate('ItemDetails', { itemId: item.id })}
        renderFavoriteButton={(item: any) => {
          const imageUrl =
            item?.image_url ||
            item?.item_images?.[0]?.image_url ||
            item?.images?.[0]?.image_url ||
            null;
          const favoriteData = {
            id: item?.id,
            title: item?.title,
            description: item?.description,
            price: item?.price || item?.estimated_value || 0,
            currency: item?.currency || 'USD',
            condition: item?.condition,
            image_url: imageUrl,
            created_at: item?.created_at || item?.updated_at || null,
            category_name: item?.category_name ?? item?.category_name_en ?? item?.category_name_ka ?? null,
            category_name_en: item?.category_name_en ?? null,
            category_name_ka: item?.category_name_ka ?? null,
            category: item?.category ?? item?.categories ?? null,
            categories: item?.categories ?? null,
          };
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const FavoriteToggleButton = require('../components/FavoriteToggleButton').default;
          return <FavoriteToggleButton itemId={item?.id} item={favoriteData} size={18} />;
        }}
        resolveSimilarityLabel={(item: any) =>
          typeof item?.similarity === 'number' ? `${Math.round((item.similarity || 0) * 100)}%` : null
        }
      />

      <LocationSelector
        visible={locationModalVisible}
        onClose={handleLocationModalClose}
        onSelectLocation={handleLocationSelect}
        initialCityId={locationCityId}
      />
    </View>
  );
});

ExploreScreen.displayName = 'ExploreScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  navRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  navIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  navLocationButton: {
    marginLeft: 8,
  },
});

export default ExploreScreen;
