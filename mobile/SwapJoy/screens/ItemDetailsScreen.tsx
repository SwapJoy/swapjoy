import React, { useEffect, useMemo, useState } from 'react';
import {View, StyleSheet, TouchableOpacity, FlatList, Dimensions, ActivityIndicator} from 'react-native';
import SJText from '../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemDetailsScreenProps } from '../types/navigation';
import { ListingItem } from '../types/listing-item';
import CachedImage from '../components/CachedImage';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils';
import { useLocalization } from '../localization';
import FavoriteToggleButton from '../components/FavoriteToggleButton';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@navigation/MainTabNavigator.styles';

const { width } = Dimensions.get('window');

const ItemDetailsScreen: React.FC<ItemDetailsScreenProps> = ({ navigation, route }) => {
  const { user, isAuthenticated, isAnonymous } = useAuth();
  const { language, t } = useLocalization();
  const strings = useMemo(
    () => ({
      category: t('addItem.preview.info.category'),
      condition: t('addItem.preview.info.condition'),
      seller: t('itemDetails.sellerTitle', { defaultValue: 'Seller' }),
      goBack: t('itemDetails.goBack', { defaultValue: 'Go Back' }),
      offer: t('itemDetails.offerButton', { defaultValue: 'Offer' }),
      loadFailed: t('itemDetails.loadFailed', { defaultValue: 'Failed to load item' }),
      itemNotFound: t('itemDetails.itemNotFound', { defaultValue: 'Item not found' }),
    }),
    [t]
  );
  const { itemId, item: passedItem } = route.params;
  const [loading, setLoading] = useState(!passedItem); // No loading if item is passed
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<ListingItem | null>(passedItem || null);

  const favoriteData = useMemo(() => {
    if (!item) return null;
    const primaryImage = item.images && item.images.length > 0 ? item.images[0].url : null;
    const categoryName = item.category
      ? (language === 'ka' ? item.category.title_ka : item.category.title_en)
      : null;
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price || 0,
      currency: item.currency || 'USD',
      condition: item.condition,
      image_url: primaryImage,
      created_at: item.created_at || item.updated_at || null,
      category_name: categoryName,
      category_name_en: item.category?.title_en ?? null,
      category_name_ka: item.category?.title_ka ?? null,
      category: item.category ? { ...item.category } as any : null,
      categories: null,
    };
  }, [item, language]);

  useEffect(() => {
    // If item was passed, skip fetching
    if (passedItem) {
      // Track view asynchronously (non-blocking)
      ApiService.trackItemView(itemId, user?.id);
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await ApiService.getItemById(itemId, language);
      if (!mounted) return;
      if (error) {
        setError(error.message || strings.loadFailed);
      } else {
        if (data) {
          setItem(data);
          ApiService.trackItemView(itemId, user?.id);
        } else {
          setItem(null);
        }
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [itemId, language, strings, user?.id, passedItem]);

  const showOffer = useMemo(() => {
    if (!item?.user_id) return false;
    // Show offer button if user is authenticated and not the owner, or if anonymous user
    if (!isAuthenticated || isAnonymous) return true;
    if (!user?.id) return false;
    return item.user_id !== user.id;
  }, [item?.user_id, user?.id, isAuthenticated, isAnonymous]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryYellow} />
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.centered}>
        <SJText style={styles.errorText}>{error || strings.itemNotFound}</SJText>
        <TouchableOpacity style={styles.retry} onPress={() => navigation.goBack()}>
          <SJText style={styles.retryText}>{strings.goBack}</SJText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const images = useMemo(() => {
    console.log('[ItemDetailsScreen] Processing images:', {
      has_item: !!item,
      has_images: !!item?.images,
      images_type: typeof item?.images,
      images_is_array: Array.isArray(item?.images),
      images_length: Array.isArray(item?.images) ? item?.images.length : 'N/A',
      images_sample: Array.isArray(item?.images) && item.images.length > 0 ? item.images[0] : null,
    });
    
    if (!item?.images || item.images.length === 0) {
      console.log('[ItemDetailsScreen] No images found, returning empty array');
      return [];
    }
    
    const normalized = item.images
      .map((img) => ({
        image_url: img.url,
        sort_order: img.order,
      }))
      .filter((img) => img.image_url) // Filter out images without URLs
      .sort((a, b) => a.sort_order - b.sort_order);
    
    console.log('[ItemDetailsScreen] Normalized images:', {
      count: normalized.length,
      sample: normalized[0],
    });
    
    return normalized;
  }, [item]);

  return (
    <View style={styles.container}>
      <FlatList
        data={[{ key: 'header' }, { key: 'details' }, { key: 'spacer' }]}
        keyExtractor={(i) => i.key}
        renderItem={({ item: section }) => {
          if (section.key === 'header') {
            return (
              <View style={styles.heroSection}>
                <FlatList
                  data={images}
                  keyExtractor={(_, idx) => String(idx)}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item: img }) => (
                    <CachedImage
                      uri={img.image_url}
                      style={styles.heroImage}
                      resizeMode="cover"
                      fallbackUri="https://picsum.photos/400/300?random=5"
                    />
                  )}
                />
                {favoriteData ? (
                  <FavoriteToggleButton
                    itemId={favoriteData.id}
                    item={favoriteData}
                    size={24}
                    style={styles.detailsFavoriteButton}
                  />
                ) : null}
              </View>
            );
          }
          if (section.key === 'details') {
            return (
              <View style={styles.details}>
                <SJText style={styles.itemTitle}>{item.title}</SJText>
                <SJText style={styles.price}>{formatCurrency(item.price || 0, item.currency || 'USD')}</SJText>
                {item.view_count !== undefined && item.view_count > 0 && (
                  <View style={styles.viewCountRow}>
                    <Ionicons name="eye-outline" size={14} color="#666" />
                    <SJText style={styles.viewCountText}>
                      {item.view_count >= 1000 ? `${(item.view_count / 1000).toFixed(1)}K` : item.view_count} {item.view_count === 1 ? 'view' : 'views'}
                    </SJText>
                  </View>
                )}
                {item.category ? (
                  <SJText style={styles.meta}>
                    {strings.category}: {language === 'ka' ? item.category.title_ka : item.category.title_en}
                  </SJText>
                ) : item.category_name ? (
                  <SJText style={styles.meta}>
                    {strings.category}: {item.category_name}
                  </SJText>
                ) : null}
                {item.condition ? (
                  <SJText style={styles.meta}>
                    {strings.condition}: {item.condition}
                  </SJText>
                ) : null}
                <SJText style={styles.description}>{item.description}</SJText>

                {item.user_id && item.user ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.sellerBox}
                    onPress={() => {
                      (navigation as any).navigate('UserProfile', { userId: item.user_id });
                    }}
                  >
                    <SJText style={styles.sellerTitle}>{strings.seller}</SJText>
                    <SJText style={styles.sellerName}>
                      {(item.user.firstname || (item.user as any).first_name || '').trim()} {(item.user.lastname || (item.user as any).last_name || '').trim()} @{item.user.username}
                    </SJText>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          }
          return <View style={{ height: 100 }} />;
        }}
        contentContainerStyle={{ paddingBottom: showOffer ? 100 : 16 }}
      />

      {showOffer && (
        <View style={styles.offerBar}>
          <TouchableOpacity
            style={styles.offerButton}
            onPress={() => {
              // Check if user is authenticated (not anonymous)
              if (!isAuthenticated || isAnonymous) {
                (navigation as any).navigate('EmailSignIn');
                return;
              }
              // Navigate to offer creation
              (navigation as any).navigate('OfferCreate', {
                receiverId: item.user_id,
                requestedItems: [
                  {
                    id: item.id,
                    title: item.title,
                    price: item.price || 0,
                    image_url: item.images && item.images.length > 0 ? item.images[0].url : null,
                    condition: item.condition,
                  },
                ],
                contextTitle: item.title,
              });
            }}
          >
            <SJText style={styles.offerText}>{strings.offer}</SJText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark
  },
  errorText: {
    fontSize: 16,
    marginBottom: 12,
  },
  retry: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroImage: {
    width,
    height: Math.min(300, Math.round(width * 0.75))
  },
  heroSection: {
    position: 'relative',
  },
  detailsFavoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 5,
    backgroundColor: '#fff'
  },
  details: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: '700',
    
  },
  price: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '700',
  },
  meta: {
    marginTop: 6,
    fontSize: 13
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 21,
  },
  sellerBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
  },
  sellerTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '600'
  },
  offerBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    paddingHorizontal: 64,
    paddingBottom: 16,
  },
  offerButton: {
    backgroundColor: colors.primaryYellow,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  offerText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  viewCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  viewCountText: {
    fontSize: 13
  },
});

export default ItemDetailsScreen;
