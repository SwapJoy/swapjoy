import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ItemDetailsFormScreenProps } from '../types/navigation';
import { DraftManager } from '../services/draftManager';
import { ImageUploadService } from '../services/imageUpload';
import { ApiService } from '../services/api';
import { ItemDraft, ItemCondition, Category } from '../types/item';

const { width } = Dimensions.get('window');

const CONDITIONS: { value: ItemCondition; label: string; icon: string }[] = [
  { value: 'new', label: 'New', icon: 'sparkles' },
  { value: 'like_new', label: 'Like New', icon: 'star' },
  { value: 'good', label: 'Good', icon: 'thumbs-up' },
  { value: 'fair', label: 'Fair', icon: 'hand-left' },
  { value: 'poor', label: 'Poor', icon: 'hand-right' },
];

const ItemDetailsFormScreen: React.FC<ItemDetailsFormScreenProps> = ({
  navigation,
  route,
}) => {
  const { draftId, imageUris } = route.params;
  
  const [draft, setDraft] = useState<ItemDraft | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [condition, setCondition] = useState<ItemCondition | null>(null);
  const [price, setPrice] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showConditionPicker, setShowConditionPicker] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [allUploaded, setAllUploaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load draft and start image uploads
  useEffect(() => {
    loadDraftAndCategories();
    startImageUploads();
  }, []);

  const loadDraftAndCategories = async () => {
    try {
      // Load draft
      const loadedDraft = await DraftManager.getDraft(draftId);
      if (loadedDraft) {
        setDraft(loadedDraft);
        setTitle(loadedDraft.title);
        setDescription(loadedDraft.description);
        setCategory(loadedDraft.category_id);
        setCondition(loadedDraft.condition);
        setPrice(loadedDraft.price);
      }

      // Load categories
      const { data: categoriesData, error } = await ApiService.getCategories();
      if (error) {
        console.error('Error loading categories:', error);
        // Don't block the UI, just show empty categories
        setCategories([]);
      } else if (categoriesData) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Don't block the UI
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const startImageUploads = async () => {
    if (!imageUris || imageUris.length === 0) return;

    setUploading(true);
    const loadedDraft = await DraftManager.getDraft(draftId);
    if (!loadedDraft) return;

    const imagesToUpload = loadedDraft.images.map((img) => ({
      uri: img.uri,
      id: img.id,
    }));

    await ImageUploadService.uploadMultipleImages(
      imagesToUpload,
      draftId,
      // On progress
      (imageId, progress) => {
        setUploadProgress((prev) => ({ ...prev, [imageId]: progress }));
      },
      // On complete
      async (imageId, url) => {
        await DraftManager.updateDraftImage(draftId, imageId, {
          uploaded: true,
          supabaseUrl: url,
          uploadProgress: 100,
        });
        // Reload draft to update UI
        const updatedDraft = await DraftManager.getDraft(draftId);
        if (updatedDraft) {
          setDraft(updatedDraft);
        }
      },
      // On error
      async (imageId, error) => {
        console.error(`Upload failed for image ${imageId}:`, error);
        await DraftManager.updateDraftImage(draftId, imageId, {
          uploaded: false,
          uploadError: error,
        });
        // Reload draft to update UI
        const updatedDraft = await DraftManager.getDraft(draftId);
        if (updatedDraft) {
          setDraft(updatedDraft);
        }
      }
    );

    setUploading(false);
    setAllUploaded(true);
  };

  // Auto-save draft with debounce
  const saveDraft = async (updates: Partial<ItemDraft>) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      await DraftManager.updateDraft(draftId, updates);
      setIsSaving(false);
    }, 500);
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    saveDraft({ title: text });
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    saveDraft({ description: text });
  };

  const handleCategorySelect = (categoryId: string) => {
    setCategory(categoryId);
    setShowCategoryPicker(false);
    saveDraft({ category_id: categoryId });
  };

  const handleConditionSelect = (cond: ItemCondition) => {
    setCondition(cond);
    setShowConditionPicker(false);
    saveDraft({ condition: cond });
  };

  const handleValueChange = (text: string) => {
    // Allow only numbers and decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    setPrice(filtered);
    saveDraft({ price: filtered });
  };

  const handleNext = async () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a title for your item');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please enter a description');
      return;
    }
    if (!category) {
      Alert.alert('Missing Information', 'Please select a category');
      return;
    }
    if (!condition) {
      Alert.alert('Missing Information', 'Please select the condition');
      return;
    }
    if (!price.trim()) {
      Alert.alert('Missing Information', 'Please enter a price');
      return;
    }
    if (!allUploaded) {
      Alert.alert('Uploading Images', 'Please wait for images to finish uploading');
      return;
    }

    // Final save
    await DraftManager.updateDraft(draftId, {
      title,
      description,
      category_id: category,
      condition,
      price: price,
    });

    // Navigate to preview
    navigation.navigate('ItemPreview', { draftId });
  };

  const handleBack = async () => {
    // Save before going back
    await DraftManager.updateDraft(draftId, {
      title,
      description,
      category_id: category,
      condition,
      price: price,
    });
    navigation.goBack();
  };

  const getCategoryName = () => {
    if (!category) return 'Select Category';
    const cat = categories.find((c) => c.id === category);
    return cat ? cat.name : 'Select Category';
  };

  const getConditionLabel = () => {
    if (!condition) return 'Select Condition';
    const cond = CONDITIONS.find((c) => c.value === condition);
    return cond ? cond.label : 'Select Condition';
  };

  const getOverallProgress = () => {
    if (!draft || draft.images.length === 0) return 0;
    const total = Object.values(uploadProgress).reduce((sum, val) => sum + val, 0);
    return Math.round(total / draft.images.length);
  };

  if (!draft || loadingCategories) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Item Details</Text>
          <View style={styles.savingIndicator}>
            {isSaving && (
              <>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.savingText}>Saving...</Text>
              </>
            )}
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Upload Progress */}
          {uploading && (
            <View style={styles.uploadProgressContainer}>
              <View style={styles.progressHeader}>
                <Ionicons name="cloud-upload" size={20} color="#007AFF" />
                <Text style={styles.uploadProgressText}>
                  Uploading images... {getOverallProgress()}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${getOverallProgress()}%` }]}
                />
              </View>
            </View>
          )}

          {/* Image Thumbnails */}
          <View style={styles.imagePreviewContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {draft.images.map((img, index) => (
                <View key={img.id} style={styles.imagePreview}>
                  <Image source={{ uri: img.uri }} style={styles.imagePreviewImage} />
                  {!img.uploaded && (
                    <View style={styles.imageUploadingOverlay}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  )}
                  {img.uploaded && (
                    <View style={styles.imageUploadedBadge}>
                      <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Title */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., iPhone 13 Pro Max"
                value={title}
                onChangeText={handleTitleChange}
                maxLength={100}
              />
              <Text style={styles.charCount}>{title.length}/100</Text>
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Description <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your item in detail..."
                value={description}
                onChangeText={handleDescriptionChange}
                multiline
                numberOfLines={6}
                maxLength={1000}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length}/1000</Text>
            </View>

            {/* Category */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Category <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text style={[styles.pickerButtonText, !category && styles.placeholder]}>
                  {getCategoryName()}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Condition */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Condition <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowConditionPicker(true)}
              >
                <Text style={[styles.pickerButtonText, !condition && styles.placeholder]}>
                  {getConditionLabel()}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Price */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Price <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.valueInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[styles.textInput, styles.valueInput]}
                  placeholder="0.00"
                  value={price}
                  onChangeText={handleValueChange}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Next Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, uploading && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={uploading}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Category Picker Modal */}
        <Modal
          visible={showCategoryPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.modalItem,
                      category === cat.id && styles.modalItemSelected,
                    ]}
                    onPress={() => handleCategorySelect(cat.id)}
                  >
                    <Text style={styles.modalItemText}>{cat.name}</Text>
                    {category === cat.id && (
                      <Ionicons name="checkmark" size={24} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Condition Picker Modal */}
        <Modal
          visible={showConditionPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowConditionPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Condition</Text>
                <TouchableOpacity onPress={() => setShowConditionPicker(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {CONDITIONS.map((cond) => (
                  <TouchableOpacity
                    key={cond.value}
                    style={[
                      styles.modalItem,
                      condition === cond.value && styles.modalItemSelected,
                    ]}
                    onPress={() => handleConditionSelect(cond.value)}
                  >
                    <View style={styles.conditionItem}>
                      <Ionicons name={cond.icon as any} size={20} color="#666" />
                      <Text style={styles.modalItemText}>{cond.label}</Text>
                    </View>
                    {condition === cond.value && (
                      <Ionicons name="checkmark" size={24} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 80,
    justifyContent: 'flex-end',
  },
  savingText: {
    fontSize: 12,
    color: '#007AFF',
  },
  scrollView: {
    flex: 1,
  },
  uploadProgressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  uploadProgressText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  imagePreviewContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingLeft: 16,
    marginBottom: 8,
  },
  imagePreview: {
    marginRight: 12,
    position: 'relative',
  },
  imagePreviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  imageUploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'right',
    marginTop: 4,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  placeholder: {
    color: '#8e8e93',
  },
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
  },
  valueInput: {
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemSelected: {
    backgroundColor: '#f0f7ff',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

export default ItemDetailsFormScreen;

