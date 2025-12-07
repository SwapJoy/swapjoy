import 'react-native-get-random-values';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { ImageUploadService } from '../services/imageUpload';
import { ImageAnalysisService } from '../services/imageAnalysis';
import { ApiService } from '../services/api';
import { UserService } from '../services/userService';
import { AuthService } from '../services/auth';
import { ItemCondition } from '../types/item';
import { useLocalization } from '../localization';
import type { LocationSelection } from '../types/location';
import { useCategories } from './useCategories';
import { v4 as uuidv4 } from 'uuid';

type NearestCityData = {
  name?: string | null;
  country?: string | null;
};

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
  route?: any; // Route prop to access params
}

export const useItemDetails = ({ imageUris, navigation, route }: UseItemDetailsParams) => {
  const { language, t } = useLocalization();
  const { categories, loading: loadingCategories } = useCategories();

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

  // State
  const [images, setImages] = useState<ImageUploadState[]>([]);
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
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showConditionPicker, setShowConditionPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [originalValues, setOriginalValues] = useState<{
    title: string;
    description: string;
    category_id: string | null;
    condition: ItemCondition | null;
  } | null>(null);
  const isUploadingRef = useRef(false);
  const analysisTriggeredRef = useRef(false);
  const categoriesRef = useRef<typeof categories>(categories);
  const uploadsCompletedRef = useRef(false);
  const imageUrisProcessedRef = useRef<string>('');
  const [uploadsCompleted, setUploadsCompleted] = useState(false);

  // Initialize images from imageUris (only once per unique set of imageUris)
  useEffect(() => {
    if (!imageUris || imageUris.length === 0) return;
    
    // Create a unique key for this set of imageUris
    const imageUrisKey = imageUris.sort().join('|');
    
    // Only initialize if this is a new set of imageUris
    if (imageUrisProcessedRef.current === imageUrisKey && images.length > 0) {
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
      analysisTriggeredRef.current = false;
      isUploadingRef.current = false;
      uploadsCompletedRef.current = false;
      setUploadsCompleted(false);
    }
  }, [imageUris, images.length]);

  // Load user preferred currency
  useEffect(() => {
    const loadPreferredCurrency = async () => {
      try {
        const profileResult = await UserService.getProfile();
        if (profileResult?.data && typeof profileResult.data === 'object') {
          const profileData = profileResult.data as any;
          if (
            typeof profileData.preferred_currency === 'string' &&
            profileData.preferred_currency
          ) {
            setCurrency(profileData.preferred_currency);
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
      
      // Check if all images are uploaded and trigger analysis (only if categories are loaded)
      // But only if analysis hasn't been triggered yet
      const allUploaded = images.filter((img) => img.uploaded && img.supabaseUrl);
      if (allUploaded.length > 0 && !analyzing && !analysisTriggeredRef.current && categories.length > 0) {
        analysisTriggeredRef.current = true;
        triggerImageAnalysis(allUploaded);
      } else if (allUploaded.length > 0 && categories.length === 0) {
        console.warn('[ItemDetailsForm] Categories not loaded yet, will retry analysis when categories are available');
      } else if (analysisTriggeredRef.current) {
        console.log('[ItemDetailsForm] Analysis already triggered, skipping');
      }
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
          // Analysis will be triggered by the useEffect when images state updates
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
  }, [images, categories, analyzing]);

  const triggerImageAnalysis = useCallback(async (uploadedImages: ImageUploadState[]) => {
    if (uploadedImages.length === 0) {
      return;
    }

    // Check if analysis was already triggered
    if (analyzing) {
      console.log('[ItemDetailsForm] Analysis already in progress, skipping');
      return;
    }

    console.log(
      '[ItemDetailsForm] Auto-triggering AI analysis for',
      uploadedImages.length,
      'uploaded images'
    );
    setAnalyzing(true);
    try {
      // Check if categories are loaded
      if (!categories || categories.length === 0) {
        console.warn('[ItemDetailsForm] Categories not loaded yet, skipping analysis');
        analysisTriggeredRef.current = false; // Reset so it can retry
        setAnalyzing(false);
        return;
      }

      const imageUrls = uploadedImages.map((img) => img.supabaseUrl!);
      // Prepare categories for analysis (only active ones with required fields)
      const categoriesForAnalysis = categories
        .filter((cat) => cat && cat.is_active !== false && cat.parent_id !== null)
        .map((cat) => ({
          id: cat.id,
          title_en: cat.title_en || cat.name || '',
          is_active: cat.is_active !== false,
        }))
        .filter((cat) => cat.id && cat.title_en); // Ensure required fields exist
      
      if (categoriesForAnalysis.length === 0) {
        console.warn('[ItemDetailsForm] No valid categories available for analysis');
        analysisTriggeredRef.current = false; // Reset so it can retry
        setAnalyzing(false);
        return;
      }

      console.log(`[ItemDetailsForm] Analyzing with ${categoriesForAnalysis.length} categories`);
      const analysisResult = await ImageAnalysisService.analyzeImages(imageUrls, categoriesForAnalysis);

      if (analysisResult.error) {
        console.error('[ItemDetailsForm] Auto-analysis failed:', analysisResult.error);
        analysisTriggeredRef.current = false; // Reset so it can retry
        setAnalyzing(false);
        return;
      }

      if (analysisResult.title) {
        setTitle(analysisResult.title);
      }

      if (analysisResult.categoryId) {
        setCategory(analysisResult.categoryId);
        const categoryExists = categories.find((cat) => cat.id === analysisResult.categoryId);
        if (!categoryExists) {
          console.warn(
            '[ItemDetailsForm] Auto-analysis: Category ID not found in categories list yet (may be timing issue):',
            analysisResult.categoryId
          );
        }
      }
    } catch (error) {
      console.error('[ItemDetailsForm] Auto-analysis failed:', error);
      analysisTriggeredRef.current = false; // Reset so it can retry on error
    } finally {
      setAnalyzing(false);
    }
  }, [categories, analyzing]);

  // Trigger analysis when all images are uploaded and categories are available
  // Only trigger once per unique set of images
  useEffect(() => {
    // Check if all images are uploaded
    const allUploaded = images.filter((img) => img.uploaded && img.supabaseUrl);
    if (allUploaded.length === 0 || allUploaded.length !== images.length) {
      console.log('[ItemDetailsForm] Analysis check: Not all images uploaded yet', {
        allUploaded: allUploaded.length,
        total: images.length,
        uploadsCompleted: uploadsCompletedRef.current,
        uploadsCompletedState: uploadsCompleted,
      });
      return;
    }
    
    // Only proceed if uploads are completed (check both ref and state)
    if (!uploadsCompletedRef.current && !uploadsCompleted) {
      console.log('[ItemDetailsForm] Analysis check: Uploads not marked as completed yet');
      return;
    }
    
    // Only proceed if analysis hasn't been triggered and we're not analyzing
    if (analysisTriggeredRef.current || analyzing) {
      console.log('[ItemDetailsForm] Analysis check: Already triggered or in progress', {
        triggered: analysisTriggeredRef.current,
        analyzing,
      });
      return;
    }
    
    // Wait for categories to be loaded
    if (categories.length === 0 || loadingCategories) {
      console.log('[ItemDetailsForm] Analysis check: Categories not ready', {
        categoriesCount: categories.length,
        loading: loadingCategories,
      });
      return;
    }
    
    // Trigger analysis once
    console.log('[ItemDetailsForm] Triggering analysis...');
    const timeoutId = setTimeout(() => {
      // Double-check refs inside timeout to prevent race conditions
      if (!analyzing && !analysisTriggeredRef.current && (uploadsCompletedRef.current || uploadsCompleted) && categories.length > 0 && allUploaded.length > 0) {
        console.log('[ItemDetailsForm] Executing analysis trigger');
        analysisTriggeredRef.current = true;
        triggerImageAnalysis(allUploaded);
      } else {
        console.log('[ItemDetailsForm] Analysis trigger cancelled in timeout', {
          analyzing,
          triggered: analysisTriggeredRef.current,
          uploadsCompleted: uploadsCompletedRef.current,
          uploadsCompletedState: uploadsCompleted,
          categoriesCount: categories.length,
          allUploadedCount: allUploaded.length,
        });
      }
    }, 500);
    return () => clearTimeout(timeoutId);
    // Depend on uploadsCompleted state to trigger when uploads complete
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadsCompleted, images.length, categories.length, loadingCategories, analyzing]);

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
    setCategory(categoryId);
  }, [setCategory]);

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
    setTitle(text);
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setDescription(text);
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setCategory(categoryId);
    setShowCategoryPicker(false);
  }, []);

  const handleConditionSelect = useCallback((cond: ItemCondition) => {
    setCondition(cond);
    setShowConditionPicker(false);
  }, []);

  const handleCurrencySelect = useCallback((curr: string) => {
    setCurrency(curr);
    setShowCurrencyPicker(false);
  }, []);

  const handleValueChange = useCallback((text: string) => {
    const filtered = text.replace(/[^0-9.]/g, '');
    setPrice(filtered);
  }, []);

  const handleLocationSelected = useCallback(
    async (selection: LocationSelection) => {
      const labelParts = [selection.cityName, selection.country].filter(Boolean);
      const fallbackLabel = t('locationSelector.coordinatesFallback', {
        defaultValue: 'Exact location',
      });
      const label = labelParts.length > 0 ? labelParts.join(', ') : fallbackLabel;

      setLocationCoords({ lat: selection.lat, lng: selection.lng });
      setLocationLabel(label);
    },
    [t]
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
    
    const pendingUploads = images?.some((img) => !img.uploaded || !img.supabaseUrl) ?? true;

    if (pendingUploads) {
      Alert.alert(strings.alerts.uploadingImagesTitle, strings.alerts.uploadingImagesMessage);
      return;
    }

    // Navigate to preview with all data
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
        images: images.map((img) => ({
          id: img.id,
          uri: img.uri,
          supabaseUrl: img.supabaseUrl!,
        })),
      },
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
    analyzing,
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
    handleNext,
    handleBack,
    handleCategorySelected,
    // Helpers
    getCategoryName,
    getConditionLabel,
    getOverallProgress,
  };
};
