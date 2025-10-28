import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ItemPreviewScreenProps } from '../types/navigation';
import { DraftManager } from '../services/draftManager';
import { ApiService } from '../services/api';
import { ItemDraft, Category } from '../types/item';

const { width } = Dimensions.get('window');

const CONDITIONS_DISPLAY: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

const ItemPreviewScreen: React.FC<ItemPreviewScreenProps> = ({
  navigation,
  route,
}) => {
  const { draftId } = route.params;

  const [draft, setDraft] = useState<ItemDraft | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadDraft();
  }, []);

  const loadDraft = async () => {
    try {
      const loadedDraft = await DraftManager.getDraft(draftId);
      if (!loadedDraft) {
        Alert.alert('Error', 'Draft not found');
        navigation.goBack();
        return;
      }

      setDraft(loadedDraft);

      // Load category details
      if (loadedDraft.category_id) {
        const { data: categories } = await ApiService.getCategories();
        if (categories) {
          const cat = categories.find((c) => c.id === loadedDraft.category_id);
          setCategory(cat || null);
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      Alert.alert('Error', 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!draft) return;

    // Final validation
    if (!DraftManager.isDraftComplete(draft)) {
      Alert.alert('Incomplete', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Submit Item',
      'Are you ready to list this item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          style: 'default',
          onPress: submitItem,
        },
      ]
    );
  };

  const submitItem = async () => {
    if (!draft) return;

    setSubmitting(true);

    try {
      // Create item
      const { data: item, error: itemError } = await ApiService.createItem({
        title: draft.title,
        description: draft.description,
        category_id: draft.category_id,
        condition: draft.condition!,
        price: parseFloat(draft.price),
        currency: draft.currency,
      });

      if (itemError || !item) {
        throw new Error(itemError?.message || 'Failed to create item');
      }

      // Create item images
      const imageData = draft.images
        .filter((img) => img.uploaded && img.supabaseUrl)
        .map((img, index) => ({
          item_id: item.id,
          image_url: img.supabaseUrl!,
          sort_order: index,
          is_primary: index === 0,
        }));

      const { error: imagesError } = await ApiService.createItemImages(imageData);

      if (imagesError) {
        console.error('Error creating images:', imagesError);
        // Item is created but images failed - still show success
      }

      // Delete draft
      await DraftManager.deleteDraft(draftId);

      // Note: Embedding generation is now handled automatically by database trigger
      console.log('Item created - embedding will be generated automatically by trigger');

      // Invalidate recently listed cache so new item appears immediately
      try {
        const { RedisCache } = await import('../services/redisCache');
        await RedisCache.invalidatePattern('recently-listed*');
        console.log('Cache invalidated for recently-listed items');
      } catch (error) {
        console.warn('Failed to invalidate cache:', error);
      }

      // Show success and navigate
      Alert.alert(
        'Success!',
        'Your item has been listed successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to item details or back to main screen
              navigation.reset({
                index: 1,
                routes: [
                  { name: 'MainTabs' },
                  { name: 'ItemDetails', params: { itemId: item.id } },
                ],
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting item:', error);
      Alert.alert('Error', error.message || 'Failed to submit item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    navigation.goBack();
  };

  if (loading || !draft) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading preview...</Text>
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
        <Text style={styles.headerTitle}>Preview</Text>
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
            {draft.images.map((img, index) => (
              <Image
                key={img.id}
                source={{ uri: img.uri }}
                style={styles.carouselImage}
              />
            ))}
          </ScrollView>
          {draft.images.length > 1 && (
            <View style={styles.imageIndicatorContainer}>
              {draft.images.map((_, index) => (
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
            <Text style={styles.title}>{draft.title}</Text>
            <Text style={styles.price}>
              ${parseFloat(draft.price).toFixed(2)}
            </Text>
          </View>

          {/* Category and Condition */}
          <View style={styles.tagsContainer}>
            {category && (
              <View style={styles.tag}>
                <Ionicons name="pricetag" size={14} color="#007AFF" />
                <Text style={styles.tagText}>{category.name}</Text>
              </View>
            )}
            {draft.condition && (
              <View style={styles.tag}>
                <Ionicons name="checkmark-circle" size={14} color="#34C759" />
                <Text style={styles.tagText}>
                  {CONDITIONS_DISPLAY[draft.condition]}
                </Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{draft.description}</Text>
          </View>

          {/* Item Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Item Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{category?.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Condition</Text>
              <Text style={styles.infoValue}>
                {draft.condition ? CONDITIONS_DISPLAY[draft.condition] : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>
                ${parseFloat(draft.price).toFixed(2)} {draft.currency}
              </Text>
            </View>
          </View>

          {/* Note */}
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle" size={20} color="#8e8e93" />
            <Text style={styles.noteText}>
              Review your listing carefully. You can edit it later from your profile.
            </Text>
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
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.submitButtonText}>Submitting...</Text>
            </>
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit</Text>
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

