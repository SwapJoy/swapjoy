import 'react-native-get-random-values';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { ImageUploadService } from '../services/imageUpload';
import { UserService } from '../services/userService';
import { AuthService } from '../services/auth';
import { ItemCondition } from '../types/item';
import { useLocalization } from '../localization';
import type { LocationSelection } from '../types/location';
import { useCategories } from './useCategories';
import { useWizardForm } from '../contexts/WizardFormContext';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploadState {
  id: string;
  uri: string;
  uploaded: boolean;
  supabaseUrl?: string;
  uploadProgress?: number;
  uploadError?: string;
}

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

interface UseItemDetailsParams {
  imageUris: string[];
  navigation: NavigationProp<any>;
  route?: any; // Route prop (kept for compatibility but not used for form data)
}

export const useItemDetails = ({ imageUris, navigation, route }: UseItemDetailsParams) => {
  const { t } = useLocalization();
  const { categories, loading: loadingCategories } = useCategories();
  const { formData, updateFormData, getFormData: getContextFormData } = useWizardForm();

  const strings = useMemo(
    () => ({
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
        missingLocation: t('addItem.alerts.missingLocation', {
          defaultValue: 'Please choose a location for your item.',
        }),
      },
      location: {
        resolving: t('addItem.details.locationResolving', { defaultValue: 'Resolving nearest city…' }),
      },
    }),
    [t]
  );

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

  // State - use context for form data, local state for UI and images
  const [images, setImages] = useState<ImageUploadState[]>([]);
  
  // Get form data from context
  const title = formData.title;
  const description = formData.description;
  const category = formData.category;
  const condition = formData.condition;
  const price = formData.price;
  const currency = formData.currency;
  const locationLabel = formData.locationLabel;
  const locationCoords = formData.locationCoords;
  
  // Local UI state
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showConditionPicker, setShowConditionPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const isUploadingRef = useRef(false);
  const categoriesRef = useRef<typeof categories>(categories);
  const uploadsCompletedRef = useRef(false);
  const imageUrisProcessedRef = useRef<string>('');
  const [uploadsCompleted, setUploadsCompleted] = useState(false);

  // Initialize images from imageUris (only once per unique set of imageUris)
  // Note: We preserve the order of imageUris as it represents the user's desired order
  useEffect(() => {
    if (!imageUris || imageUris.length === 0) return;
    
    // Create a unique key for this set of imageUris (sorted for comparison, but preserve order)
    const imageUrisKey = [...imageUris].sort().join('|');
    const imageUrisOrderKey = imageUris.join('|'); // Preserve order for comparison
    
    // Only initialize if this is a new set of imageUris OR if the order changed
    if (imageUrisProcessedRef.current === imageUrisKey && images.length > 0) {
      // Check if order changed (same URIs but different order)
      const currentOrderKey = images.map((img) => img.uri).join('|');
      if (currentOrderKey === imageUrisOrderKey) {
        return; // Same URIs in same order, no need to reinitialize
      }
      // Order changed - reorder existing images to match imageUris order
      const reorderedImages = imageUris
        .map((uri) => images.find((img) => img.uri === uri))
        .filter((img): img is ImageUploadState => img !== undefined);
      
      // Add any new images that weren't in the existing set
      const existingUris = new Set(images.map((img) => img.uri));
      const newUris = imageUris.filter((uri) => !existingUris.has(uri));
      const newImages: ImageUploadState[] = newUris.map((uri) => ({
        id: uuidv4(),
        uri,
        uploaded: false,
        uploadProgress: 0,
      }));
      
      setImages([...reorderedImages, ...newImages]);
      return;
    }
    
    // Mark this set as processed
    imageUrisProcessedRef.current = imageUrisKey;
    
    // Only initialize if images haven't been set yet
    if (images.length === 0) {
      const initialImages: ImageUploadState[] = imageUris.map((uri) => ({
        id: uuidv4(),
        uri,
        uploaded: false,
        uploadProgress: 0,
      }));
      setImages(initialImages);
      
      // Reset flags for new image set
      isUploadingRef.current = false;
      uploadsCompletedRef.current = false;
      setUploadsCompleted(false);
    }
  }, [imageUris, images]);

  // Load user preferred currency on mount if not set
  useEffect(() => {
    if (formData.currency && formData.currency !== 'USD') return; // Don't override if already set
    
    const loadPreferredCurrency = async () => {
      try {
        const profileResult = await UserService.getProfile();
        if (profileResult?.data && typeof profileResult.data === 'object') {
          const profileData = profileResult.data as any;
          if (
            typeof profileData.preferred_currency === 'string' &&
            profileData.preferred_currency
          ) {
            updateFormData({ currency: profileData.preferred_currency });
            console.log('[ItemDetailsForm] Loaded preferred currency from profile:', profileData.preferred_currency);
          }
        }
      } catch (error) {
        console.warn('[ItemDetailsForm] Failed to load user profile for preferred currency:', error);
      }
    };
    loadPreferredCurrency();
  }, []);

  const startImageUploads = useCallback(async () => {
    if (!images || images.length === 0) {
      isUploadingRef.current = false;
      return;
    }

    // Prevent concurrent uploads
    if (isUploadingRef.current) {
      return;
    }

    const imagesToUpload = images
      .filter((img) => !img.uploaded || !img.supabaseUrl)
      .map((img) => ({
        uri: img.uri,
        id: img.id,
      }));

    if (imagesToUpload.length === 0) {
      isUploadingRef.current = false;
      setUploading(false);
      return;
    }

    isUploadingRef.current = true;
    setUploading(true);
    
    // Get authenticated user
    const user = await AuthService.getCurrentUser();
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      isUploadingRef.current = false;
      setUploading(false);
      return;
    }
    const userId = user.id;

    // Track upload completion
    let completedCount = 0;
    const totalToUpload = imagesToUpload.length;
    const uploadedUrls: string[] = [];
    const uploadedImageMap = new Map<string, string>(); // imageId -> supabaseUrl

    await ImageUploadService.uploadMultipleImages(
      imagesToUpload,
      userId,
      // On progress
      (imageId, progress) => {
        setUploadProgress((prev) => ({ ...prev, [imageId]: progress }));
      },
      // On complete
      async (imageId, url) => {
        uploadedUrls.push(url);
        uploadedImageMap.set(imageId, url);
        completedCount++;
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, uploaded: true, supabaseUrl: url, uploadProgress: 100 }
              : img
          )
        );
        
        // When all uploads complete
        if (completedCount === totalToUpload) {
          isUploadingRef.current = false;
          setUploading(false);
          uploadsCompletedRef.current = true;
          setUploadsCompleted(true);
          console.log('[ItemDetailsForm] All uploads completed, uploadsCompletedRef set to true');
        }
      },
      // On error
      async (imageId, error) => {
        console.error(`Upload failed for image ${imageId}:`, error);
        completedCount++;
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId ? { ...img, uploaded: false, uploadError: error } : img
          )
        );
        
        // Even if some fail, check if we're done
        if (completedCount === totalToUpload) {
          isUploadingRef.current = false;
          setUploading(false);
        }
      }
    );
  }, [images]);


  // Trigger uploads when images are set (only if not already uploaded or completed)
  useEffect(() => {
    if (images.length === 0 || isUploadingRef.current || uploadsCompletedRef.current) {
      return;
    }
    
    // Check if all images are already uploaded
    const allUploaded = images.every((img) => img.uploaded && img.supabaseUrl);
    if (allUploaded) {
      isUploadingRef.current = false;
      setUploading(false);
      uploadsCompletedRef.current = true;
      setUploadsCompleted(true);
      return;
    }
    
    // Only trigger if there are images that need uploading
    const needsUpload = images.some((img) => !img.uploaded || !img.supabaseUrl);
    if (needsUpload) {
      startImageUploads();
    }
  }, [images.length, startImageUploads]);

  // Keep categoriesRef in sync with categories
  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  // Category selection callback - will be passed to CategorySelectorScreen
  const handleCategorySelected = useCallback((categoryId: string) => {
    console.log('[ItemDetailsForm] Category selected via callback:', categoryId);
    updateFormData({ category: categoryId });
  }, [updateFormData]);

  // Re-validate category when categories are loaded
  useEffect(() => {
    if (category && categories.length > 0) {
      const categoryExists = categories.find((cat) => cat.id === category);
      if (!categoryExists) {
        console.warn('[ItemDetailsForm] Category ID not found after categories loaded:', category);
      } else {
        console.log('[ItemDetailsForm] Category validated after categories loaded:', categoryExists.name);
      }
    }
  }, [category, categories]);

  const handleTitleChange = useCallback((text: string) => {
    updateFormData({ title: text });
  }, [updateFormData]);

  const handleDescriptionChange = useCallback((text: string) => {
    updateFormData({ description: text });
  }, [updateFormData]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    updateFormData({ category: categoryId });
    setShowCategoryPicker(false);
  }, [updateFormData]);

  const handleConditionSelect = useCallback((cond: ItemCondition) => {
    updateFormData({ condition: cond });
    setShowConditionPicker(false);
  }, [updateFormData]);

  const handleCurrencySelect = useCallback((curr: string) => {
    updateFormData({ currency: curr });
    setShowCurrencyPicker(false);
  }, [updateFormData]);

  const handleValueChange = useCallback((text: string) => {
    const filtered = text.replace(/[^0-9.]/g, '');
    updateFormData({ price: filtered });
  }, [updateFormData]);

  const handleLocationSelected = useCallback(
    async (selection: LocationSelection) => {
      const labelParts = [selection.cityName, selection.country].filter(Boolean);
      const fallbackLabel = t('locationSelector.coordinatesFallback', {
        defaultValue: 'Exact location',
      });
      const label = labelParts.length > 0 ? labelParts.join(', ') : fallbackLabel;

      updateFormData({
        locationCoords: { lat: selection.lat, lng: selection.lng },
        locationLabel: label,
      });
    },
    [t, updateFormData]
  );

  const handleRemoveImage = useCallback(
    async (imageId: string) => {
      const imageToRemove = images.find((img) => img.id === imageId);
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

      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setUploadProgress((prev) => {
        const { [imageId]: _removed, ...rest } = prev;
        return rest;
      });
    },
    [images, t]
  );

  const handleAddImages = useCallback(
    (newUris: string[]) => {
      const newImages: ImageUploadState[] = newUris.map((uri) => ({
        id: uuidv4(),
        uri,
        uploaded: false,
        uploadProgress: 0,
      }));
      setImages((prev) => [...prev, ...newImages]);
      // Reset upload completion flags to allow new uploads
      isUploadingRef.current = false;
      uploadsCompletedRef.current = false;
      setUploadsCompleted(false);
    },
    []
  );

  const handleReorderImages = useCallback(
    (reorderedImages: ImageUploadState[]) => {
      setImages(reorderedImages);
    },
    []
  );

  const handleNext = useCallback(async () => {
    // Validate images first
    const hasImages = images && images.length > 0;
    if (!hasImages) {
      Alert.alert(
        strings.alerts.missingInfoTitle,
        t('addItem.alerts.missingImages', { defaultValue: 'Please add at least one image to continue.' })
      );
      return;
    }

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
    
    // Only block if there are images actively uploading (not just waiting)
    // Allow navigation if all images are either uploaded or failed
    const hasActiveUploads = images?.some((img) => 
      !img.uploaded && !img.supabaseUrl && !img.uploadError && (uploadProgress[img.id] !== undefined && uploadProgress[img.id] < 100)
    ) ?? false;

    if (hasActiveUploads) {
      Alert.alert(strings.alerts.uploadingImagesTitle, strings.alerts.uploadingImagesMessage);
      return;
    }

    // Filter out failed uploads and get current image URIs
    // Use the current order of images array (which reflects reordering)
    const successfulImages = images.filter((img) => img.uploaded && img.supabaseUrl);
    const hasFailedUploads = images.some((img) => img.uploadError);
    const currentImageUris = images.map((img) => img.uri);

    // Navigate to preview with all data, preserving the current order
    navigation.navigate('ItemPreview', {
      itemData: {
        title,
        description,
        category_id: category,
        condition: condition!,
        price: parseFloat(price),
        currency,
        location_lat: locationCoords.lat,
        location_lng: locationCoords.lng,
        location_label: locationLabel,
        // Preserve the order from the images array (which reflects reordering)
        images: successfulImages.map((img, index) => ({
          id: img.id,
          uri: img.uri,
          supabaseUrl: img.supabaseUrl!,
          order: index, // Add order field to maintain order
        })),
      },
      failedUploads: hasFailedUploads,
      imageUris: currentImageUris,
    });
  }, [
    title,
    description,
    category,
    condition,
    price,
    currency,
    locationCoords,
    locationLabel,
    images,
    strings,
    navigation,
  ]);

  const handleBack = useCallback(async () => {
    navigation.goBack();
  }, [navigation]);

  const getCategoryName = useCallback(() => {
    if (!category) {
      return strings.placeholders.category;
    }
    const cat = categories.find((c) => c.id === category);
    if (cat) {
      return cat.name;
    } else {
      console.warn(
        '[ItemDetailsForm] getCategoryName: Category not found. ID:',
        category,
        'Categories loaded:',
        categories.length
      );
      return strings.placeholders.category;
    }
  }, [category, categories, strings.placeholders.category]);

  const getConditionLabel = useCallback(() => {
    if (!condition) return strings.placeholders.condition;
    const cond = conditionOptions.find((c) => c.value === condition);
    return cond ? cond.label : strings.placeholders.condition;
  }, [condition, conditionOptions, strings.placeholders.condition]);

  const getOverallProgress = useCallback(() => {
    if (!images || images.length === 0) return 0;
    const total = Object.values(uploadProgress).reduce((sum, val) => sum + val, 0);
    return Math.round(total / images.length);
  }, [images, uploadProgress]);

  const getFormData = useCallback(() => {
    // Simply return the form data from context - it's the single source of truth
    return getContextFormData();
  }, [getContextFormData]);

  return {
    // State
    images,
    title,
    description,
    category,
    condition,
    price,
    currency,
    showLocationSelector,
    locationLabel,
    locationCoords,
    resolvingLocation,
    showCategoryPicker,
    showConditionPicker,
    showCurrencyPicker,
    uploading,
    uploadProgress,
    loadingCategories,
    categories,
    // Computed values
    strings,
    uploadingText,
    conditionOptions,
    currencyOptions,
    // Handlers
    setTitle: handleTitleChange,
    setDescription: handleDescriptionChange,
    setCategory: handleCategorySelect,
    setCondition: handleConditionSelect,
    setCurrency: handleCurrencySelect,
    setPrice: handleValueChange,
    setShowLocationSelector,
    setShowCategoryPicker,
    setShowConditionPicker,
    setShowCurrencyPicker,
    handleLocationSelected,
    handleRemoveImage,
    handleAddImages,
    handleReorderImages,
    handleNext,
    handleBack,
    handleCategorySelected,
    // Helpers
    getCategoryName,
    getConditionLabel,
    getOverallProgress,
    getFormData,
  };
};
