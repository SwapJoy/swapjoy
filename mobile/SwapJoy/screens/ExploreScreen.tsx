import React, { memo, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExploreScreenProps } from '../types/navigation';
import { SectionView } from '../components/SectionView';
import LocationSelector from '../components/LocationSelector';
import { useExploreScreenState } from '../hooks/useExploreScreenState';
import { DeviceService } from '../services/deviceService';
import SearchModal from '../components/SearchModal';
import { Ionicons } from '@expo/vector-icons';

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
    handleLocationSelect,
    loadingLocation,
    updatingLocation,
    locationCityId,
    sections,
    isFavorite,
    toggleFavorite,
    searchModalVisible,
    setSearchModalVisible,
  } = useExploreScreenState();

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
        {sections.map((section) => (
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
        item?.images?.[0]?.image_url ||
        item?.images?.[0]?.url ||
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
    backgroundColor: '#fff',
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
