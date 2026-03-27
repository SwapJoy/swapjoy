import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import SJText from '../components/SJText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderBackButton } from '@react-navigation/elements';
import { ItemDetailsScreenProps } from '../types/navigation';
import { ListingItem } from '../types/listing-item';
import CachedImage from '../components/CachedImage';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatRelativeTime } from '../utils';
import { useLocalization } from '../localization';
import { useCategories } from '../hooks/useCategories';
import { useFavorites } from '../contexts/FavoritesContext';
import { logView, logSave } from '../services/itemEvents';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@navigation/MainTabNavigator.styles';
import ImageView from 'react-native-image-viewing';
import ConditionChip from '../components/ConditionChip';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = Math.max(320, Math.round(height * 0.45));
const DIVIDER_COLOR = 'rgba(255,255,255,0.1)';
const ACTION_CIRCLE_SIZE = 52;
/** Matches React Navigation default stack header content row height. */
const HEADER_ROW_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const ItemDetailsScreen: React.FC<ItemDetailsScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, isAnonymous } = useAuth();
  const { language, t, localized } = useLocalization();
  const { getCategoryById } = useCategories();
  const { isFavorite, toggleFavorite } = useFavorites();

  const strings = useMemo(
    () => ({
      category: t('addItem.preview.info.category'),
      condition: t('addItem.preview.info.condition'),
      goBack: t('itemDetails.goBack', { defaultValue: 'Go Back' }),
      offer: t('itemDetails.offerButton', { defaultValue: 'Offer' }),
      favourite: t('itemDetails.favouriteButton', { defaultValue: 'Favourite' }),
      share: t('itemDetails.shareButton', { defaultValue: 'Share' }),
      loadFailed: t('itemDetails.loadFailed', { defaultValue: 'Failed to load item' }),
      itemNotFound: t('itemDetails.itemNotFound', { defaultValue: 'Item not found' }),
    }),
    [t],
  );

  const { itemId, item: passedItem } = route.params;
  const [loading, setLoading] = useState(!passedItem);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<ListingItem | null>(passedItem || null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const loggedViewRef = useRef<string | null>(null);

  const isFav = item ? isFavorite(item.id) : false;

  const renderStackStyleBackButton = (tintColor: string) => (
    <View
      pointerEvents="box-none"
      style={[
        styles.headerBackSlot,
        {
          height: insets.top + HEADER_ROW_HEIGHT,
          paddingTop: insets.top,
          paddingLeft: insets.left + 4,
        },
      ]}
    >
      <View style={styles.headerBackRow}>
        {Platform.OS === 'ios' ? (
          <HeaderBackButton
            onPress={() => navigation.goBack()}
            tintColor={tintColor}
            style={{ marginLeft: 0 }}
          />
        ) : (
          <TouchableOpacity
            style={styles.androidBackTouchable}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={tintColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const categoryName = useMemo(() => {
    if (!item) return null;
    if (item.category_id) {
      const cat = getCategoryById(item.category_id);
      if (cat?.name) return cat.name;
    }
    return localized(item.category ?? undefined) || item.category_name || null;
  }, [item, getCategoryById, localized]);

  const favoriteData = useMemo(() => {
    if (!item) return null;
    const firstImg = item.images?.[0] as { url?: string; image_url?: string } | undefined;
    const primaryImage = firstImg ? firstImg.url ?? firstImg.image_url ?? null : null;
    const fromCatalog = item.category_id ? getCategoryById(item.category_id) : undefined;
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price || 0,
      currency: item.currency || 'USD',
      condition: item.condition,
      image_url: primaryImage,
      created_at: item.created_at || item.updated_at || null,
      category_name: fromCatalog?.name ?? localized(item.category ?? undefined) ?? item.category_name ?? null,
      category_name_en: fromCatalog?.title_en ?? item.category?.title_en ?? null,
      category_name_ka: fromCatalog?.title_ka ?? item.category?.title_ka ?? null,
      category: item.category ? ({ ...item.category } as any) : null,
      categories: null,
    };
  }, [item, getCategoryById, localized]);

  useEffect(() => {
    if (loggedViewRef.current === itemId) {
      return;
    }
    if (passedItem) {
      ApiService.trackItemView(itemId, user?.id);
      logView(itemId);
      loggedViewRef.current = itemId;
      return;
    }
    let mounted = true;
    void (async () => {
      setLoading(true);
      const { data, error } = await ApiService.getItemById(itemId, language);
      if (!mounted) return;
      if (error) {
        setError(error.message || strings.loadFailed);
      } else if (data) {
        setItem(data);
        ApiService.trackItemView(itemId, user?.id);
        logView(itemId);
        loggedViewRef.current = itemId;
      } else {
        setItem(null);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [itemId, language, strings, user?.id, passedItem]);

  const images = useMemo(() => {
    if (!item?.images || item.images.length === 0) return [];
    return item.images
      .map((img: any) => ({
        image_url: img.url ?? img.image_url,
        sort_order: img.order ?? img.sort_order ?? 0,
      }))
      .filter((img) => img.image_url)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [item]);

  const previewImages = useMemo(() => {
    return images.map((img) => ({ uri: img.image_url }));
  }, [images]);

  const viewCount = item?.view_count ?? 0;
  const viewCountText = useMemo(() => {
    const count =
      viewCount >= 1000 ? `${(viewCount / 1000).toFixed(1)}K` : String(viewCount);
    return `${count} ${viewCount === 1 ? 'view' : 'views'}`;
  }, [viewCount]);

  const scrollContentStyle = useMemo(
    () => ({ paddingBottom: 40 + insets.bottom }),
    [insets.bottom],
  );

  const openImagePreview = (index: number) => {
    setPreviewImageIndex(index);
    setPreviewVisible(true);
  };

  const handleOffer = useCallback(() => {
    if (!item) return;
    if (!isAuthenticated || isAnonymous) {
      (navigation as any).navigate('EmailSignIn');
      return;
    }
    if (item.user_id === user?.id) return;
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
  }, [item, isAuthenticated, isAnonymous, user?.id, navigation]);

  const handleFavourite = useCallback(() => {
    if (!item || !favoriteData) return;
    const willBeFavorite = !isFav;
    toggleFavorite(item.id, favoriteData);
    if (willBeFavorite) {
      logSave(item.id);
    }
  }, [isFav, item, favoriteData, toggleFavorite]);

  if (loading) {
    return (
      <View style={styles.rootFill}>
        <StatusBar
          translucent={Platform.OS === 'android'}
          backgroundColor="transparent"
          barStyle="light-content"
        />
        {renderStackStyleBackButton('#fff')}
        <View style={styles.centeredInner}>
          <ActivityIndicator size="large" color={colors.primaryYellow} />
        </View>
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.rootFill}>
        <StatusBar
          translucent={Platform.OS === 'android'}
          backgroundColor="transparent"
          barStyle="light-content"
        />
        {renderStackStyleBackButton('#fff')}
        <View style={styles.centeredInner}>
          <SJText style={styles.errorText}>{error || strings.itemNotFound}</SJText>
          <TouchableOpacity style={styles.retry} onPress={() => navigation.goBack()}>
            <SJText style={styles.retryText}>{strings.goBack}</SJText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent={Platform.OS === 'android'}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {renderStackStyleBackButton('#fff')}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={scrollContentStyle}
        nestedScrollEnabled
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.heroCarousel}
          nestedScrollEnabled
        >
          {images.map((img, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={() => openImagePreview(index)}
            >
              <CachedImage
                uri={img.image_url}
                style={styles.heroImage}
                resizeMode="cover"
                fallbackUri="https://picsum.photos/400/300?random=5"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section 1: Created At & Views */}
        <View style={styles.divider} />
        <View style={styles.metaSection}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color="#777" />
            <SJText style={styles.metaText}>
              {formatRelativeTime(item.created_at)}
            </SJText>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="eye-outline" size={13} color="#777" />
            <SJText style={styles.metaText}>{viewCountText}</SJText>
          </View>
        </View>
        <View style={styles.divider} />

        {/* Section 2: Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOffer}
            activeOpacity={0.7}
          >
            <View style={[styles.actionCircle, styles.actionCircleOffer]}>
              <Ionicons name="swap-horizontal" size={22} color={colors.primaryYellow} />
            </View>
            <SJText style={[styles.actionLabel, styles.actionLabelOffer]}>{strings.offer}</SJText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFavourite}
            activeOpacity={0.7}
          >
            <View
              style={[styles.actionCircle, isFav ? styles.actionCircleFavActive : styles.actionCircleFav]}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={22}
                color={isFav ? '#ef4444' : '#f87171'}
              />
            </View>
            <SJText
              style={[styles.actionLabel, isFav ? styles.actionLabelFavActive : styles.actionLabelFav]}
            >
              {strings.favourite}
            </SJText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View style={[styles.actionCircle, styles.actionCircleShare]}>
              <Ionicons name="share-social" size={22} color="#60a5fa" />
            </View>
            <SJText style={[styles.actionLabel, styles.actionLabelShare]}>{strings.share}</SJText>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        {/* Section 3: Item Info */}
        <View style={styles.infoSection}>
          {item.user_id && item.user ? (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => {
                (navigation as any).navigate('UserProfile', {
                  userId: item.user_id,
                });
              }}
              style={styles.sellerRow}
            >
              <Ionicons name="person-outline" size={13} color="#777" />
              <SJText style={styles.sellerText}>@{item.user.username}</SJText>
            </TouchableOpacity>
          ) : null}

          <SJText style={styles.itemTitle}>{item.title}</SJText>

          {categoryName ? (
            <View style={styles.categoryChip}>
              {item.category?.icon ? (
                <SJText style={styles.categoryIcon}>{item.category.icon}</SJText>
              ) : (
                <Ionicons name="pricetag-outline" size={11} color="#aaa" />
              )}
              <SJText style={styles.categoryChipText}>{categoryName}</SJText>
            </View>
          ) : null}

          <SJText style={styles.price}>
            {formatCurrency(item.price || 0, item.currency || 'USD')}
          </SJText>

          {item.condition ? (
            <ConditionChip
              condition={item.condition}
              compact
              style={styles.conditionChip}
            />
          ) : null}
        </View>
        <View style={styles.divider} />

        {/* Section 4: Description */}
        {item.description ? (
          <View style={styles.descriptionSection}>
            <SJText style={styles.description}>{item.description}</SJText>
          </View>
        ) : null}
      </ScrollView>

      <ImageView
        images={previewImages}
        imageIndex={previewImageIndex}
        visible={previewVisible}
        onRequestClose={() => setPreviewVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  heroCarousel: {
    backgroundColor: colors.primaryDark,
  },
  rootFill: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  headerBackSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    ...Platform.select({
      android: { elevation: 10 },
    }),
  },
  headerBackRow: {
    height: HEADER_ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  androidBackTouchable: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
  },
  centeredInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    height: HERO_HEIGHT,
  },

  divider: {
    height: 1,
    backgroundColor: DIVIDER_COLOR,
    marginHorizontal: 16,
  },

  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#777',
    fontWeight: '300',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#555',
    marginHorizontal: 4,
  },

  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 18,
    gap: 36,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionCircle: {
    width: ACTION_CIRCLE_SIZE,
    height: ACTION_CIRCLE_SIZE,
    borderRadius: ACTION_CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  actionCircleOffer: {
    backgroundColor: 'rgba(255,222,33,0.12)',
    borderColor: 'rgba(255,222,33,0.35)',
  },
  actionCircleFav: {
    backgroundColor: 'rgba(248,113,113,0.10)',
    borderColor: 'rgba(248,113,113,0.30)',
  },
  actionCircleFavActive: {
    backgroundColor: 'rgba(239,68,68,0.18)',
    borderColor: 'rgba(239,68,68,0.45)',
  },
  actionCircleShare: {
    backgroundColor: 'rgba(96,165,250,0.10)',
    borderColor: 'rgba(96,165,250,0.30)',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '400',
  },
  actionLabelOffer: {
    color: colors.primaryYellow,
  },
  actionLabelFav: {
    color: '#f87171',
  },
  actionLabelFavActive: {
    color: '#ef4444',
  },
  actionLabelShare: {
    color: '#60a5fa',
  },

  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  sellerText: {
    fontSize: 13,
    color: '#777',
    fontWeight: '300',
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
    marginBottom: 10,
  },
  categoryIcon: {
    fontSize: 12,
  },
  categoryChipText: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '400',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  conditionChip: {
    alignSelf: 'flex-start',
  },

  descriptionSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#bbb',
    fontWeight: '300',
  },
});

export default ItemDetailsScreen;
