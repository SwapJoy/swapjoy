import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {View, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Dimensions, } from 'react-native';
import SJText from '../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ItemPreviewScreenProps } from '../types/navigation';
import { ApiService } from '../services/api';
import { Category, ItemCondition } from '../types/item';
import { formatCurrency } from '../utils';
import { useLocalization } from '../localization';

const { width } = Dimensions.get('window');

const ItemPreviewScreen: React.FC<ItemPreviewScreenProps> = ({
  navigation,
  route,
}) => {
  const { itemData } = route.params;
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
      edit: t('addItem.preview.buttons.edit'),
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
      // Create item
      const { data: item, error: itemError } = await ApiService.createItem({
        title: itemData.title,
        description: itemData.description,
        category_id: itemData.category_id,
        condition: itemData.condition,
        price: itemData.price,
        currency: itemData.currency,
        location_lat: itemData.location_lat ?? undefined,
        location_lng: itemData.location_lng ?? undefined,
      });

      if (itemError || !item) {
        throw new Error(itemError?.message || 'Failed to create item');
      }

      const itemId = (item as any).id;

      // Upload images
      if (itemData.images && itemData.images.length > 0) {
        const imageData = itemData.images.map((img, index) => ({
          item_id: itemId,
          image_url: img.supabaseUrl,
          sort_order: index,
          is_primary: index === 0,
        }));

        const { error: imagesError } = await ApiService.createItemImages(imageData);
        if (imagesError) {
          console.error('Error creating item images:', imagesError);
          // Don't fail the whole operation, but log the error
        }
      }

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

  const handleEdit = () => {
    navigation.goBack();
  };

  if (loading || !itemData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <SJText style={styles.loadingText}>{strings.loading}</SJText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleEdit}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <SJText style={styles.headerTitle}>{strings.headerTitle}</SJText>
        <View style={{ width: 40 }} />
      </View>

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
              <SJText style={styles.infoLabel}>{strings.info.condition}</SJText>
              <SJText style={styles.infoValue}>{getConditionLabel(itemData.condition)}</SJText>
            </View>
            <View style={styles.infoRow}>
              <SJText style={styles.infoLabel}>{strings.info.price}</SJText>
              <SJText style={styles.infoValue}>
                {formatCurrency(itemData.price, itemData.currency)}
              </SJText>
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
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          disabled={submitting}
        >
          <SJText style={styles.editButtonText}>{strings.buttons.edit}</SJText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <SJText style={styles.submitButtonText}>{strings.buttons.submitting}</SJText>
            </>
          ) : (
            <>
              <SJText style={styles.submitButtonText}>{strings.buttons.submit}</SJText>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
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
    backgroundColor: '#fff',
    width: 20,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  titleSection: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
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
    color: '#1a1a1a',
    fontWeight: '500',
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
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  noteContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  editButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ItemPreviewScreen;

