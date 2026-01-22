import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {View, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, Dimensions, TouchableOpacity, } from 'react-native';
import SJText from '../components/SJText';
import { Ionicons } from '@expo/vector-icons';
import { ItemPreviewScreenProps } from '../types/navigation';
import { ApiService } from '../services/api';
import { Category, ItemCondition } from '../types/item';
import { formatCurrency } from '../utils';
import { useLocalization } from '../localization';
import { colors } from '@navigation/MainTabNavigator.styles';
import PrimaryButton from '../components/PrimaryButton';

const { width } = Dimensions.get('window');

const ItemPreviewScreen: React.FC<ItemPreviewScreenProps> = ({
  navigation,
  route,
}) => {
  const { itemData, failedUploads, imageUris } = route.params;
  const { language, t } = useLocalization();
  const strings = useMemo(() => ({
    loading: t('addItem.preview.loading'),
    headerTitle: t('addItem.preview.title'),
    descriptionTitle: t('addItem.preview.descriptionTitle'),
    infoTitle: t('addItem.preview.infoTitle'),
    info: {
      category: t('addItem.preview.info.category'),
      condition: t('addItem.preview.info.condition'),
      price: t('addItem.preview.info.price'),
      location: t('addItem.preview.info.location', { defaultValue: 'Location' }),
    },
    note: t('addItem.preview.note'),
    buttons: {
      submit: t('addItem.preview.buttons.submit'),
      submitting: t('addItem.preview.buttons.submitting'),
    },
    alerts: {
      draftNotFoundTitle: t('addItem.preview.alerts.draftNotFoundTitle'),
      draftNotFoundMessage: t('addItem.preview.alerts.draftNotFoundMessage'),
      loadFailed: t('addItem.preview.alerts.loadFailed'),
      incompleteTitle: t('addItem.preview.alerts.incompleteTitle'),
      incompleteMessage: t('addItem.preview.alerts.incompleteMessage'),
      submitTitle: t('addItem.preview.alerts.submitTitle'),
      submitMessage: t('addItem.preview.alerts.submitMessage'),
      submitConfirm: t('addItem.preview.alerts.submitConfirm'),
      successTitle: t('addItem.preview.alerts.successTitle'),
      successMessage: t('addItem.preview.alerts.successMessage'),
      submitError: t('addItem.preview.alerts.submitError'),
    },
  }), [t]);
  const getConditionLabel = useCallback(
    (value?: ItemCondition | null) =>
      value ? t(`addItem.conditions.${value}` as const) : t('common.notAvailable'),
    [t]
  );

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadCategory = async () => {
      if (itemData.category_id) {
        try {
        const { data: categories } = await ApiService.getCategories(language);
        if (categories) {
            const cat = categories.find((c) => c.id === itemData.category_id);
          setCategory(cat || null);
          }
        } catch (error) {
          console.error('Error loading category:', error);
        }
      }
      setLoading(false);
    };
    loadCategory();
  }, [itemData.category_id, language]);

  const handleSubmit = async () => {
    Alert.alert(
      strings.alerts.submitTitle,
      strings.alerts.submitMessage,
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: strings.alerts.submitConfirm,
          style: 'default',
          onPress: submitItem,
        },
      ]
    );
  };

  const submitItem = async () => {
    setSubmitting(true);

    try {
      // Prepare denormalized images payload
      // itemData.images are already in the correct order (preserved from wizard)
      // Map them with sequential order values (0, 1, 2, ...)
      const images =
        itemData.images && itemData.images.length > 0
          ? itemData.images.map((img, index) => ({
              url: img.supabaseUrl,
              order: index,
            }))
          : [];

      // Create item with denormalized images
      const { data: item, error: itemError } = await ApiService.createItem({
        title: itemData.title,
        description: itemData.description,
        category_id: itemData.category_id,
        condition: itemData.condition,
        price: itemData.price,
        currency: itemData.currency,
        location_lat: itemData.location_lat ?? undefined,
        location_lng: itemData.location_lng ?? undefined,
        images,
      });

      if (itemError || !item) {
        throw new Error(itemError?.message || 'Failed to create item');
      }

      const itemId = (item as any).id;
      // Show success and navigate
      Alert.alert(
        strings.alerts.successTitle,
        strings.alerts.successMessage,
        [
          {
            text: t('common.ok'),
            onPress: () => {
              // Navigate to item details or back to main screen
              navigation.reset({
                index: 1,
                routes: [
                  { name: 'MainTabs' },
                  { name: 'ItemDetails', params: { itemId } },
                ],
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting item:', error);
      Alert.alert(t('common.error'), error.message || strings.alerts.submitError);
    } finally {
      setSubmitting(false);
    }
  };


  if (loading || !itemData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <SJText style={styles.loadingText}>{strings.loading}</SJText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageCarouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {itemData.images.map((img, index) => (
              <Image
                key={img.id}
                source={{ uri: img.supabaseUrl }}
                style={styles.carouselImage}
              />
            ))}
          </ScrollView>
          {itemData.images.length > 1 && (
            <View style={styles.imageIndicatorContainer}>
              {itemData.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageIndicator,
                    currentImageIndex === index && styles.imageIndicatorActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Item Details */}
        <View style={styles.detailsContainer}>
          {/* Title and Price */}
          <View style={styles.titleSection}>
            <SJText style={styles.title}>{itemData.title}</SJText>
            <SJText style={styles.price}>
              {formatCurrency(itemData.price, itemData.currency)}
            </SJText>
          </View>

          {/* Category and Condition */}
          <View style={styles.tagsContainer}>
            {category && (
              <View style={styles.tag}>
                <Ionicons name="pricetag" size={14} color="#007AFF" />
                <SJText style={styles.tagText}>{category.name}</SJText>
              </View>
            )}
            {itemData.condition && (
              <View style={styles.tag}>
                <Ionicons name="checkmark-circle" size={14} color="#34C759" />
                <SJText style={styles.tagText}>
                  {getConditionLabel(itemData.condition)}
                </SJText>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <SJText style={styles.sectionTitle}>{strings.descriptionTitle}</SJText>
            <SJText style={styles.description}>{itemData.description}</SJText>
          </View>

          {/* Item Info */}
          <View style={styles.section}>
            <SJText style={styles.sectionTitle}>{strings.infoTitle}</SJText>
            <View style={styles.infoRow}>
              <SJText style={styles.infoLabel}>{strings.info.category}</SJText>
              <SJText style={styles.infoValue}>{category?.name || t('common.notAvailable')}</SJText>
            </View>
            <View style={styles.infoRow}>
              <SJText style={styles.infoLabel}>{strings.info.location}</SJText>
              <SJText style={styles.infoValue}>
                {itemData.location_label ??
                  (itemData.location_lat !== null && itemData.location_lng !== null
                    ? `${itemData.location_lat.toFixed(4)}, ${itemData.location_lng.toFixed(4)}`
                    : t('common.notAvailable'))}
              </SJText>
            </View>
          </View>

          {/* Note */}
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle" size={20} color="#8e8e93" />
            <SJText style={styles.noteText}>
              {strings.note}
            </SJText>
          </View>

          {/* Failed Uploads Warning */}
          {failedUploads && (
            <View style={styles.failedUploadsContainer}>
              <Ionicons name="alert-circle" size={20} color="#FF3B30" />
              <View style={styles.failedUploadsContent}>
                <SJText style={styles.failedUploadsTitle}>
                  {t('addItem.preview.failedUploadsTitle', { defaultValue: 'Some images failed to upload' })}
                </SJText>
                <SJText style={styles.failedUploadsMessage}>
                  {t('addItem.preview.failedUploadsMessage', { defaultValue: 'Please go back and fix the image uploads before submitting.' })}
                </SJText>
                <TouchableOpacity
                  style={styles.fixUploadsButton}
                  onPress={() => {
                    navigation.navigate('ImageUploadProgress', { imageUris: imageUris || [] });
                  }}
                >
                  <SJText style={styles.fixUploadsButtonText}>
                    {t('addItem.preview.fixUploads', { defaultValue: 'Fix Image Uploads' })}
                  </SJText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <PrimaryButton
        onPress={handleSubmit}
        disabled={submitting}
        label={submitting ? strings.buttons.submitting : strings.buttons.submit}
        showArrow={!submitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  imageCarouselContainer: {
    position: 'relative',
    backgroundColor: '#000',
  },
  carouselImage: {
    width: width,
    height: width,
    resizeMode: 'cover',
  },
  imageIndicatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  imageIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  imageIndicatorActive: {
    backgroundColor: colors.primaryYellow,
    width: 20,
  },
  detailsContainer: {
    backgroundColor: colors.primaryDark,
    padding: 16,
  },
  titleSection: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500'
  },
  noteContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20
  },
  failedUploadsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFF3F3',
    borderWidth: 1,
    borderColor: '#FFE5E5',
    marginTop: 16,
  },
  failedUploadsContent: {
    flex: 1,
  },
  failedUploadsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  failedUploadsMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  fixUploadsButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  fixUploadsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ItemPreviewScreen;

