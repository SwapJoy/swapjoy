import React, { memo, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions, Image } from 'react-native';
import { colors } from '@navigation/MainTabNavigator.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExploreScreenProps } from '../types/navigation';
import { SectionView } from '../components/SectionView';
import { useExploreScreenState } from '../hooks/useExploreScreenState';
import { DeviceService } from '../services/deviceService';
import SearchModal from '../components/SearchModal';
import { Ionicons } from '@expo/vector-icons';
import { getItemImageUri } from '../utils/imageUtils';

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
    hasSearchQuery,
    sections,
    searchModalVisible,
    setSearchModalVisible,
  } = useExploreScreenState();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Image
          source={require('../assets/swapjoy-logo.png')}
          style={styles.logo}
          resizeMode='contain'
        />
      ),
      headerShown: !searchModalVisible,
      headerRight: () =>
        !searchModalVisible ? (
          <View style={styles.navRightGroup}>
            <TouchableOpacity
              style={styles.navIconButton}
              onPress={() => setSearchModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="search-outline" size={18} color="#000" />
            </TouchableOpacity>
            
          </View>
        ) : null,
    });
  }, [
    navigation,
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
        nestedScrollEnabled={true}
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
        onItemPress={(item: any) => (navigation as any).navigate('ItemDetails', { itemId: item.id, item })}
        renderFavoriteButton={(item: any) => {
          const imageUrl = getItemImageUri(item);
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
    </View>
  );
});

ExploreScreen.displayName = 'ExploreScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLocationButton: {
    marginLeft: 8,
  },
  logo: {
    width: 100,
    height: 24,
  },
});

export default ExploreScreen;
