import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { getCurrencySymbol } from '../utils';
import { useLocalization } from '../localization';
import LocationSelector from '../components/LocationSelector';
import type { LocationSelection } from '../types/location';

const { width } = Dimensions.get('window');

type NearestCityData = {
  name?: string | null;
  country?: string | null;
};

const CONDITION_DEFS: { value: ItemCondition; icon: string }[] = [
  { value: 'new', icon: 'sparkles' },
  { value: 'like_new', icon: 'star' },
  { value: 'good', icon: 'thumbs-up' },
  { value: 'fair', icon: 'hand-left' },
  { value: 'poor', icon: 'hand-right' },
];

const CURRENCY_DEFS: { code: string; symbol: string }[] = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GEL', symbol: '₾' },
];

const ItemDetailsFormScreen: React.FC<ItemDetailsFormScreenProps> = ({
  navigation,
  route,
}) => {
  const { draftId, imageUris } = route.params;
  const { language, t } = useLocalization();
  const strings = useMemo(() => ({
    headerTitle: t('addItem.details.title'),
    saving: t('addItem.details.saving'),
    uploading: t('addItem.details.uploading'),
    loading: t('addItem.details.loading'),
    labels: {
      title: t('addItem.details.labels.title'),
      description: t('addItem.details.labels.description'),
      category: t('addItem.details.labels.category'),
      condition: t('addItem.details.labels.condition'),
      currency: t('addItem.details.labels.currency'),
      price: t('addItem.details.labels.price'),
      location: t('addItem.details.labels.location', { defaultValue: 'Location' }),
    },
    placeholders: {
      title: t('addItem.details.placeholders.title'),
      description: t('addItem.details.placeholders.description'),
      category: t('addItem.details.placeholders.category'),
      condition: t('addItem.details.placeholders.condition'),
      currency: t('addItem.details.placeholders.currency'),
      value: t('addItem.details.placeholders.value'),
      location: t('addItem.details.placeholders.location', { defaultValue: 'Select location' }),
    },
    buttons: {
      next: t('addItem.details.buttons.next'),
    },
    modals: {
      selectCategory: t('addItem.details.modals.selectCategory'),
      selectCondition: t('addItem.details.modals.selectCondition'),
      selectCurrency: t('addItem.details.modals.selectCurrency'),
    },
    alerts: {
      missingInfoTitle: t('addItem.alerts.missingInfoTitle'),
      missingTitle: t('addItem.alerts.missingTitle'),
      missingDescription: t('addItem.alerts.missingDescription'),
      missingCategory: t('addItem.alerts.missingCategory'),
      missingCondition: t('addItem.alerts.missingCondition'),
      missingPrice: t('addItem.alerts.missingPrice'),
      uploadingImagesTitle: t('addItem.alerts.uploadingImagesTitle'),
      uploadingImagesMessage: t('addItem.alerts.uploadingImagesMessage'),
      missingLocation: t('addItem.alerts.missingLocation', { defaultValue: 'Please choose a location for your item.' }),
    },
    location: {
      resolving: t('addItem.details.locationResolving', { defaultValue: 'Resolving nearest city…' }),
    },
  }), [t]);
  const uploadingText = useCallback(
    (progress: number) => strings.uploading.replace('{progress}', String(progress)),
    [strings.uploading]
  );
  const conditionOptions = useMemo(
    () =>
      CONDITION_DEFS.map((def) => ({
        ...def,
        label: t(`addItem.conditions.${def.value}` as const),
      })),
    [t]
  );
  const currencyOptions = useMemo(
    () =>
      CURRENCY_DEFS.map((curr) => ({
        ...curr,
        label: t(`addItem.currencies.${curr.code}` as const),
      })),
    [t]
  );
  
  const [draft, setDraft] = useState<ItemDraft | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [condition, setCondition] = useState<ItemCondition | null>(null);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<string>('USD');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [locationCoords, setLocationCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });
  const [resolvingLocation, setResolvingLocation] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showConditionPicker, setShowConditionPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadDraftAndCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      // Load draft
      const loadedDraft = await DraftManager.getDraft(draftId);
      if (loadedDraft) {
        setDraft(loadedDraft);
        setTitle(loadedDraft.title);
        setDescription(loadedDraft.description);
        setCategory(loadedDraft.category_id);
        setCondition(loadedDraft.condition);
        setPrice(loadedDraft.price);
        setCurrency(loadedDraft.currency || 'USD');
        setLocationCoords({
          lat: loadedDraft.location_lat,
          lng: loadedDraft.location_lng,
        });
        if (loadedDraft.location_label) {
          setLocationLabel(loadedDraft.location_label);
        } else if (loadedDraft.location_lat !== null && loadedDraft.location_lng !== null) {
          try {
            setResolvingLocation(true);
            const { data } = await ApiService.findNearestCity(
              loadedDraft.location_lat,
              loadedDraft.location_lng
            );
            if (data) {
              const cityData = data as NearestCityData;
              const label =
                [cityData.name, cityData.country].filter(Boolean).join(', ') || null;
              setLocationLabel(label);
              if (label) {
                await DraftManager.updateDraft(draftId, { location_label: label });
              }
            } else {
              setLocationLabel(null);
            }
          } catch (error) {
            console.warn('Error resolving draft location:', error);
            setLocationLabel(null);
          } finally {
            setResolvingLocation(false);
          }
        } else {
          setLocationLabel(null);
        }
      }
      if (!loadedDraft) {
        setLocationCoords({ lat: null, lng: null });
        setLocationLabel(null);
      }

      // Load categories
      const { data: categoriesData, error } = await ApiService.getCategories(language);
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
  }, [draftId, language]);

  const startImageUploads = useCallback(async () => {
    if (!imageUris || imageUris.length === 0) return;

    setUploading(true);
    const loadedDraft = await DraftManager.getDraft(draftId);
    if (!loadedDraft) return;

    const imagesToUpload = loadedDraft.images
      .filter((img) => !img.uploaded || !img.supabaseUrl)
      .map((img) => ({
        uri: img.uri,
        id: img.id,
      }));

    if (imagesToUpload.length === 0) {
      setUploading(false);
      return;
    }

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

    const latestDraft = await DraftManager.getDraft(draftId);
    if (latestDraft) {
      setDraft(latestDraft);
    }
    setUploading(false);
  }, [draftId, imageUris]);

  useEffect(() => {
    loadDraftAndCategories();
  }, [loadDraftAndCategories]);

  useEffect(() => {
    startImageUploads();
  }, [startImageUploads]);

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

  const handleCurrencySelect = (curr: string) => {
    setCurrency(curr);
    setShowCurrencyPicker(false);
    saveDraft({ currency: curr });
  };

  const handleValueChange = (text: string) => {
    // Allow only numbers and decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    setPrice(filtered);
    saveDraft({ price: filtered });
  };

  const handleLocationSelected = useCallback(
    async (selection: LocationSelection) => {
      const labelParts = [selection.cityName, selection.country].filter(Boolean);
      const fallbackLabel = t('locationSelector.coordinatesFallback', {
        defaultValue: 'Exact location',
      });
      const label = labelParts.length > 0 ? labelParts.join(', ') : fallbackLabel;

      setLocationCoords({ lat: selection.lat, lng: selection.lng });
      setLocationLabel(label);
      setDraft((prev) =>
        prev
          ? {
              ...prev,
              location_lat: selection.lat,
              location_lng: selection.lng,
              location_label: label,
            }
          : prev
      );
      saveDraft({
        location_lat: selection.lat,
        location_lng: selection.lng,
        location_label: label,
      });
    },
    [saveDraft, t]
  );

  const handleRemoveImage = useCallback(
    async (imageId: string) => {
      const currentDraft = draft;
      const imageToRemove = currentDraft?.images.find((img) => img.id === imageId);
      if (!imageToRemove) {
        return;
      }

      if (imageToRemove.uploaded && imageToRemove.supabaseUrl) {
        const deleted = await ImageUploadService.deleteImage(imageToRemove.supabaseUrl);
        if (!deleted) {
          Alert.alert(
            t('addItem.alerts.removeImageErrorTitle', { defaultValue: 'Could not remove image' }),
            t('addItem.alerts.removeImageErrorMessage', {
              defaultValue: 'We were unable to delete this image from storage. Please try again.',
            })
          );
          return;
        }
      }

      try {
        const updatedDraft = await DraftManager.removeDraftImage(draftId, imageId);
        if (updatedDraft) {
          setDraft(updatedDraft);
          setUploadProgress((prev) => {
            const { [imageId]: _removed, ...rest } = prev;
            return rest;
          });
        }
      } catch (error) {
        console.error('Error removing draft image:', error);
        Alert.alert(
          t('addItem.alerts.removeImageErrorTitle', { defaultValue: 'Could not remove image' }),
          t('addItem.alerts.removeImageErrorMessage', {
            defaultValue: 'We were unable to remove this image. Please try again.',
          })
        );
      }
    },
    [draft, draftId, t]
  );

  const handleNext = async () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert(strings.alerts.missingInfoTitle, strings.alerts.missingTitle);
      return;
    }
    if (!description.trim()) {
      Alert.alert(strings.alerts.missingInfoTitle, strings.alerts.missingDescription);
      return;
    }
    if (!category) {
      Alert.alert(strings.alerts.missingInfoTitle, strings.alerts.missingCategory);
      return;
    }
    if (!condition) {
      Alert.alert(strings.alerts.missingInfoTitle, strings.alerts.missingCondition);
      return;
    }
    if (!price.trim()) {
      Alert.alert(strings.alerts.missingInfoTitle, strings.alerts.missingPrice);
      return;
    }
    if (locationCoords.lat === null || locationCoords.lng === null) {
      Alert.alert(strings.alerts.missingInfoTitle, strings.alerts.missingLocation);
      return;
    }
    const hasImages =
      draft?.images && draft.images.length > 0;
    const pendingUploads =
      draft?.images?.some((img) => !img.uploaded || !img.supabaseUrl) ?? true;

    if (!hasImages || pendingUploads) {
      Alert.alert(strings.alerts.uploadingImagesTitle, strings.alerts.uploadingImagesMessage);
      return;
    }

    // Final save
    await DraftManager.updateDraft(draftId, {
      title,
      description,
      category_id: category,
      condition,
      price: price,
      currency: currency,
      location_lat: locationCoords.lat,
      location_lng: locationCoords.lng,
      location_label: locationLabel,
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
      currency: currency,
      location_lat: locationCoords.lat,
      location_lng: locationCoords.lng,
      location_label: locationLabel,
    });
    navigation.goBack();
  };

  const getCategoryName = () => {
    if (!category) return strings.placeholders.category;
    const cat = categories.find((c) => c.id === category);
    return cat ? cat.name : strings.placeholders.category;
  };

  const getConditionLabel = () => {
    if (!condition) return strings.placeholders.condition;
    const cond = conditionOptions.find((c) => c.value === condition);
    return cond ? cond.label : strings.placeholders.condition;
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
          <Text style={styles.loadingText}>{strings.loading}</Text>
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
          <Text style={styles.headerTitle}>{strings.headerTitle}</Text>
          <View style={styles.savingIndicator}>
            {isSaving && (
              <>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.savingText}>{strings.saving}</Text>
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
                  {uploadingText(getOverallProgress())}
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagePreviewList}
            >
              {draft.images.map((img, index) => (
                <View key={img.id} style={styles.imagePreview}>
                  <Image source={{ uri: img.uri }} style={styles.imagePreviewImage} />
                  <TouchableOpacity
                    style={styles.imageRemoveButton}
                    onPress={() => handleRemoveImage(img.id)}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  >
                    <View style={styles.imageRemoveCircle}>
                      <Ionicons name="close" size={12} color="#fff" />
                    </View>
                  </TouchableOpacity>
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
                {strings.labels.title} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={strings.placeholders.title}
                value={title}
                onChangeText={handleTitleChange}
                maxLength={100}
              />
              <Text style={styles.charCount}>{title.length}/100</Text>
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {strings.labels.description} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder={strings.placeholders.description}
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
                {strings.labels.category} <Text style={styles.required}>*</Text>
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
                {strings.labels.condition} <Text style={styles.required}>*</Text>
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

            {/* Currency */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {strings.labels.currency} <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowCurrencyPicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {currencyOptions.find(c => c.code === currency)?.label || strings.placeholders.currency}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Price */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {strings.labels.price} <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.valueInputContainer}>
                <Text style={styles.currencySymbol}>{getCurrencySymbol(currency)}</Text>
                <TextInput
                  style={[styles.textInput, styles.valueInput]}
                  placeholder={strings.placeholders.value}
                  value={price}
                  onChangeText={handleValueChange}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {strings.labels.location} <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowLocationSelector(true)}
              >
                <Text style={[styles.pickerButtonText, !locationLabel && styles.placeholder]}>
                  {locationLabel || strings.placeholders.location}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {resolvingLocation ? (
                <Text style={styles.locationStatus}>{strings.location.resolving}</Text>
              ) : locationCoords.lat !== null && locationCoords.lng !== null ? (
                <Text style={styles.locationCoordinates}>
                  {locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)}
                </Text>
              ) : null}
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
            <Text style={styles.nextButtonText}>{strings.buttons.next}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <LocationSelector
          visible={showLocationSelector}
          onClose={() => setShowLocationSelector(false)}
          onSelectLocation={handleLocationSelected}
          mode="item"
        />

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
                <Text style={styles.modalTitle}>{strings.modals.selectCategory}</Text>
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
                <Text style={styles.modalTitle}>{strings.modals.selectCondition}</Text>
                <TouchableOpacity onPress={() => setShowConditionPicker(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {conditionOptions.map((cond) => (
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

        {/* Currency Picker Modal */}
        <Modal
          visible={showCurrencyPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCurrencyPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{strings.modals.selectCurrency}</Text>
                <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {currencyOptions.map((curr) => (
                  <TouchableOpacity
                    key={curr.code}
                    style={[
                      styles.modalItem,
                      currency === curr.code && styles.modalItemSelected,
                    ]}
                    onPress={() => handleCurrencySelect(curr.code)}
                  >
                    <View style={styles.conditionItem}>
                      <Text style={styles.modalItemText}>{curr.symbol}</Text>
                      <Text style={styles.modalItemText}>{curr.label}</Text>
                    </View>
                    {currency === curr.code && (
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
    overflow: 'visible',
  },
  imagePreviewList: {
    paddingRight: 16,
    overflow: 'visible',
  },
  imagePreview: {
    marginRight: 12,
    position: 'relative',
    overflow: 'visible',
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
  imageRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  imageRemoveCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
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
  locationStatus: {
    marginTop: 6,
    fontSize: 12,
    color: '#0ea5e9',
  },
  locationCoordinates: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748b',
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

