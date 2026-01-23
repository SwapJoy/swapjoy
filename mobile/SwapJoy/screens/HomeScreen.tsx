import React, { memo, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@navigation/MainTabNavigator.styles';
import { useLocalization } from '../localization';
import type { AppLanguage } from '../types/language';
import { ExploreScreenProps, ItemDetailsScreenProps } from '../types/navigation';
import { useHome } from '../hooks/useHome';
import ItemCardCollection from '../components/ItemCardCollection';
import FavoriteToggleButton from '../components/FavoriteToggleButton';
import SJText from '../components/SJText';
import CitySelectorPopover from '../components/CitySelectorPopover';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, City } from '../contexts/LocationContext';
import { ApiService } from '../services/api';
import type { LocationSelection } from '../types/location';

const HomeScreen: React.FC<ExploreScreenProps> = () => {
  const navigation = useNavigation<ItemDetailsScreenProps['navigation']>();
  const { t, language } = useLocalization();
  const { user } = useAuth();
  const { items, loading, loadingMore, hasMore, error, refresh, loadMore } = useHome(20, { radiusKm: 50 });
  const [refreshing, setRefreshing] = React.useState(false);
  const [locationSelectorVisible, setLocationSelectorVisible] = useState(false);
  const [currentCityName, setCurrentCityName] = useState<string | null>(null);
  const [loadingCityName, setLoadingCityName] = useState(false);
  const locationButtonRef = useRef<View>(null);
  
  const {
    manualLocation,
    cities,
    citiesLoading,
    setManualLocation: setLocationContextManualLocation,
  } = useLocation();

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    const startTime = Date.now();
    try {
      await refresh();
    } finally {
      // Ensure refresh indicator is visible for at least 500ms
      const elapsed = Date.now() - startTime;
      const minDisplayTime = 500;
      if (elapsed < minDisplayTime) {
        await new Promise(resolve => setTimeout(resolve, minDisplayTime - elapsed));
      }
      setRefreshing(false);
    }
  }, [refresh]);

  const handleLoadMore = React.useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      loadMore();
    }
  }, [hasMore, loadingMore, loading, loadMore]);

  const handleItemPress = useCallback(
    (item: any) => {
      // View event is logged in ItemDetailsScreen when the screen loads
      navigation.navigate('ItemDetails', { itemId: item.id, item });
    },
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
      image_url: item.image_url || item.images?.[0]?.url,
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

  // Load current city name from manual_location
  useEffect(() => {
    const loadCurrentCityName = async () => {
      if (!user?.id) {
        setCurrentCityName(null);
        return;
      }

      try {
        setLoadingCityName(true);
        const { data: profile } = await ApiService.getProfile();
        const profileData = profile as any;
        if (profileData?.manual_location_lat && profileData?.manual_location_lng) {
          const { data: nearest } = await ApiService.findNearestCity(
            profileData.manual_location_lat,
            profileData.manual_location_lng
          );
          const nearestData = nearest as any;
          if (nearestData?.name) {
            setCurrentCityName(nearestData.name);
          } else {
            setCurrentCityName(null);
          }
        } else {
          setCurrentCityName(null);
        }
      } catch (error) {
        console.error('[HomeScreen] Error loading city name:', error);
        setCurrentCityName(null);
      } finally {
        setLoadingCityName(false);
      }
    };

    loadCurrentCityName();
  }, [user?.id, manualLocation]);


  const handleLocationSelected = useCallback(
    async (selection: LocationSelection) => {
      try {
        console.log('[HomeScreen] handleLocationSelected called', { selection });
        
        // Update in database first
        const { error } = await ApiService.updateManualLocation({
          lat: selection.lat,
          lng: selection.lng,
        });

        if (error) {
          throw new Error(error.message || 'Failed to update location');
        }

        console.log('[HomeScreen] Database updated successfully');

        // Update LocationContext (this will update selectedLocation)
        await setLocationContextManualLocation({
          lat: selection.lat,
          lng: selection.lng,
          cityId: selection.cityId ?? undefined,
          cityName: selection.cityName ?? undefined,
        });

        console.log('[HomeScreen] LocationContext updated');

        // Update city name display
        if (selection.cityName) {
          setCurrentCityName(selection.cityName);
        } else {
          // Fallback: try to get city name from findNearestCity
          const { data: nearest } = await ApiService.findNearestCity(selection.lat, selection.lng);
          const nearestData = nearest as any;
          if (nearestData?.name) {
            setCurrentCityName(nearestData.name);
          }
        }

        // Close popover
        setLocationSelectorVisible(false);
        
        // The useHome's useEffect should automatically detect the location change
        // and refetch. The setManualLocationState is synchronous, so the context
        // should update on the next render, which will trigger the useEffect.
        console.log('[HomeScreen] Location updated, useHome useEffect should detect change and refetch');
      } catch (error: any) {
        console.error('[HomeScreen] Error updating location:', error);
        throw error;
      }
    },
    [setLocationContextManualLocation, refresh]
  );

  const handleCitySelect = useCallback(
    async (city: City) => {
      console.log('[HomeScreen] handleCitySelect called', { city });
      try {
        await handleLocationSelected({
          lat: city.center_lat,
          lng: city.center_lng,
          cityName: city.name,
          country: city.country,
          cityId: city.id,
          stateProvince: city.state_province ?? null,
          source: 'city',
        });
        console.log('[HomeScreen] handleCitySelect completed');
      } catch (error) {
        console.error('[HomeScreen] handleCitySelect error:', error);
      }
    },
    [handleLocationSelected]
  );

  const listEmptyComponent = (
    <View style={styles.emptyContainer}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color={colors.primaryYellow} />
          <SJText style={styles.emptyText}>
            {t('homeScreen.loading', { defaultValue: 'Loading recommendations...' })}
          </SJText>
        </>
      ) : error ? (
        <>
          <SJText style={styles.emptyText}>
            {t('homeScreen.error', { defaultValue: 'Could not load recommendations.' })}
          </SJText>
          <SJText style={styles.emptySubText}>
            {t('homeScreen.pullToRefresh', { defaultValue: 'Pull to refresh to try again.' })}
          </SJText>
        </>
      ) : (
        <>
          <SJText style={styles.emptyText}>
            {t('homeScreen.empty', { defaultValue: 'No recommendations yet.' })}
          </SJText>
          <SJText style={styles.emptySubText}>
            {t('homeScreen.emptyHint', {
              defaultValue: 'Start exploring and saving items to improve your matches.',
            })}
          </SJText>
        </>
      )}
    </View>
  );

  const headerComponent = useMemo(
    () => (
      <View style={styles.headerContainer}>
        <SJText style={styles.header}>Top picks</SJText>
        <View ref={locationButtonRef} collapsable={false}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setLocationSelectorVisible(true)}
            activeOpacity={0.7}
          >
          <Ionicons name="location-outline" size={16} color={colors.white} style={styles.locationIcon} />
          {loadingCityName ? (
            <ActivityIndicator size="small" color={colors.white} style={styles.locationSpinner} />
          ) : (
            <SJText style={styles.locationText} numberOfLines={1}>
              {currentCityName || 'Location'}
            </SJText>
          )}
          </TouchableOpacity>
        </View>
      </View>
    ),
    [loadingCityName, currentCityName]
  );

  return (
    <View style={styles.container}>
      <ItemCardCollection
        items={items}
        t={t}
        language={language as AppLanguage}
        onItemPress={handleItemPress}
        favoriteButtonRenderer={renderFavoriteButton}
        emptyComponent={listEmptyComponent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridListContent}
        horizontalPadding={2}
        columnSpacing={4}
        rowSpacing={2}
        listHeaderComponent={headerComponent}
        listFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primaryYellow} />
            </View>
          ) : null
        }
      />
      <CitySelectorPopover
        visible={locationSelectorVisible}
        onClose={() => setLocationSelectorVisible(false)}
        cities={cities}
        loading={citiesLoading}
        selectedCityId={manualLocation?.cityId ?? null}
        onSelectCity={handleCitySelect}
        anchorRef={locationButtonRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.primaryDark,
  },
  header: { 
    color: colors.white, 
    fontSize: 28, 
    fontWeight: '200', 
    opacity: 0.6,
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.8,
    maxWidth: 120,
  },
  locationSpinner: {
    marginLeft: 4,
  },
  gridListContent: {
    paddingTop: 6,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 6,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(HomeScreen);

