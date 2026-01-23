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

// Module-level cache to preserve upload status across hook instances
// Maps image URI to upload state
const imageUploadCache = new Map<string, {
  id: string;
  uploaded: boolean;
  supabaseUrl?: string;
  uploadProgress?: number;
  uploadError?: string;
}>();

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
  const removedImageUrisRef = useRef<Set<string>>(new Set()); // Track URIs that were explicitly removed
  const previousImageUrisRef = useRef<string>(''); // Track previous imageUris to detect external changes
  const [uploadsCompleted, setUploadsCompleted] = useState(false);

  // Initialize images from imageUris (only on mount or when imageUris changes from route)
  // Strategy: Preserve existing image state (upload status, IDs) when possible
  // IMPORTANT: Don't reset images when they're added via handleAddImages - that updates images state directly
  useEffect(() => {
    if (!imageUris || imageUris.length === 0) {
      // If imageUris is empty and we have images, clear them (but only if not already empty)
      if (images.length > 0) {
        setImages([]);
      }
      previousImageUrisRef.current = '';
      return;
    }
    
    // Create a unique key for this set of imageUris (sorted for comparison)
    const imageUrisKey = [...imageUris].sort().join('|');
    const imageUrisOrderKey = imageUris.join('|'); // Preserve order for comparison
    const currentImageUrisKey = imageUrisOrderKey;
    
    // Only run initialization if imageUris actually changed from outside (not from sync effect)
    // If imageUris is the same as previous, skip (this prevents loops from sync effects)
    if (previousImageUrisRef.current === currentImageUrisKey && previousImageUrisRef.current !== '') {
      // imageUris hasn't changed - this is likely a re-render from images state change
      return;
    }
    
    // Update the previous ref
    previousImageUrisRef.current = currentImageUrisKey;
    
    // Check if we already have images with these URIs
    const currentOrderKey = images.map((img) => img.uri).join('|');
    const currentUrisSet = new Set(images.map((img) => img.uri));
    const imageUrisSet = new Set(imageUris);
    
    // If we have more images than what's in imageUris, it means images were added via handleAddImages
    // Don't reset in that case - only initialize if we have fewer or different images
    const hasMoreImages = images.length > imageUris.length;
    const imageUrisIsSubset = imageUris.every((uri) => currentUrisSet.has(uri));
    
    // CRITICAL: If current images are a subset of imageUris (meaning images were removed),
    // and imageUris was just updated from the sync effect, skip to prevent infinite loop
    // This happens when: delete image -> images state updates -> sync effect updates imageUris -> this effect runs
    const currentIsSubsetOfImageUris = images.length > 0 && 
                                       images.length <= imageUris.length &&
                                       images.every((img) => imageUrisSet.has(img.uri));
    
    if (currentIsSubsetOfImageUris && imageUrisProcessedRef.current !== '' && imageUrisProcessedRef.current !== imageUrisKey) {
      // This is likely a sync update after deletion - update the processed ref but don't re-initialize
      console.log('[useItemDetails] Detected sync update after deletion, updating processed ref only');
      imageUrisProcessedRef.current = imageUrisKey;
      return;
    }
    
    // If we have images and the URIs match (same set), just reorder if needed
    if (images.length > 0 && imageUrisProcessedRef.current === imageUrisKey) {
      // If imageUris is a subset of current images (images were added), don't reset
      if (hasMoreImages && imageUrisIsSubset) {
        console.log('[useItemDetails] imageUris is subset of current images (images added via + button), skipping reset');
        return;
      }
      
      // If current images contain more URIs than imageUris, images were removed - don't re-initialize
      if (images.length > imageUris.length && imageUris.every((uri) => currentUrisSet.has(uri))) {
        console.log('[useItemDetails] Images were removed (current has more than imageUris), skipping re-initialization');
        return;
      }
      
      if (currentOrderKey === imageUrisOrderKey) {
        // Same URIs in same order - no change needed
        return;
      }
      // Order changed - reorder existing images to match imageUris order
      const reorderedImages = imageUris
        .map((uri) => images.find((img) => img.uri === uri))
        .filter((img): img is ImageUploadState => img !== undefined);
      
      // Add any new images that weren't in the existing set
      const existingUris = new Set(images.map((img) => img.uri));
      const newUris = imageUris.filter((uri) => !existingUris.has(uri) && !removedImageUrisRef.current.has(uri));
      const newImages: ImageUploadState[] = newUris.map((uri) => ({
        id: uuidv4(),
        uri,
        uploaded: false,
        uploadProgress: 0,
      }));
      
      if (reorderedImages.length !== images.length || newImages.length > 0) {
        setImages([...reorderedImages, ...newImages]);
      }
      return;
    }
    
    // New set of imageUris - check if we can preserve state from existing images or cache
    const existingImagesByUri = new Map(images.map((img) => [img.uri, img]));
    
    // If current images contain all imageUris plus more, don't reset (images were added)
    if (hasMoreImages && imageUrisIsSubset) {
      console.log('[useItemDetails] Current images contain imageUris plus more, skipping initialization');
      // Still mark as processed to prevent re-initialization
      imageUrisProcessedRef.current = imageUrisKey;
      return;
    }
    
    // If current images have more URIs than imageUris, and imageUris is a subset, images were removed
    // Don't re-initialize in this case to prevent loops
    if (images.length > imageUris.length && imageUris.every((uri) => currentUrisSet.has(uri))) {
      console.log('[useItemDetails] Images were removed (detected in new set check), skipping initialization to prevent loop');
      // Update the processed ref to the new key to prevent re-running
      imageUrisProcessedRef.current = imageUrisKey;
      return;
    }
    
    // Mark this set as processed
    imageUrisProcessedRef.current = imageUrisKey;
    
    // Initialize images, preserving state from existing images or cache
    // Filter out URIs that were explicitly removed
    const validImageUris = imageUris.filter((uri) => !removedImageUrisRef.current.has(uri));
    
    const initialImages: ImageUploadState[] = validImageUris.map((uri) => {
      // First check if we have this image in current state
      const existing = existingImagesByUri.get(uri);
      if (existing) {
        // Update cache with current state
        imageUploadCache.set(uri, {
          id: existing.id,
          uploaded: existing.uploaded,
          supabaseUrl: existing.supabaseUrl,
          uploadProgress: existing.uploadProgress,
          uploadError: existing.uploadError,
        });
        return existing;
      }
      
      // Check cache for previously uploaded images
      const cached = imageUploadCache.get(uri);
      if (cached) {
        // Restore from cache (preserves upload status when navigating back)
        // If upload is in progress (progress > 0 and < 100), mark as uploading
        const isUploading = cached.uploadProgress !== undefined && 
                           cached.uploadProgress > 0 && 
                           cached.uploadProgress < 100 && 
                           !cached.uploaded;
        
        if (isUploading) {
          // Upload is in progress - don't reset flags, let it continue
          console.log(`[useItemDetails] Image ${cached.id} upload in progress (${cached.uploadProgress}%), preserving state`);
        }
        
        return {
          id: cached.id,
          uri,
          uploaded: cached.uploaded,
          supabaseUrl: cached.supabaseUrl,
          uploadProgress: cached.uploadProgress,
          uploadError: cached.uploadError,
        };
      }
      
      // New image - create fresh
      const newId = uuidv4();
      const newImage: ImageUploadState = {
        id: newId,
        uri,
        uploaded: false,
        uploadProgress: 0,
      };
      
      // Cache the new image
      imageUploadCache.set(uri, {
        id: newId,
        uploaded: false,
        uploadProgress: 0,
      });
      
      return newImage;
    });
    
    // Only update if images actually changed
    // But skip if current images are a subset of initialImages (meaning images were removed)
    // This prevents re-initialization when images are deleted
    const currentUrisSetForCheck = new Set(images.map((img) => img.uri));
    const initialUrisSet = new Set(initialImages.map((img) => img.uri));
    const currentIsSubsetOfInitial = images.length > 0 && 
                                     images.every((img) => initialUrisSet.has(img.uri)) &&
                                     images.length <= initialImages.length;
    
    // If current images are a subset (some were removed), don't re-initialize
    if (currentIsSubsetOfInitial && images.length < initialImages.length) {
      console.log('[useItemDetails] Images were removed, skipping re-initialization to prevent loop');
      return;
    }
    
    const currentIds = images.map((img) => img.id).join(',');
    const newIds = initialImages.map((img) => img.id).join(',');
    
    if (currentIds !== newIds || images.length !== initialImages.length) {
      console.log('[useItemDetails] Initializing images from imageUris', {
        currentCount: images.length,
        newCount: initialImages.length,
      });
      setImages(initialImages);
      
      // Check if any images are currently uploading (from cache)
      const hasUploadsInProgress = initialImages.some((img) => {
        const cached = imageUploadCache.get(img.uri);
        return cached && 
               cached.uploadProgress !== undefined && 
               cached.uploadProgress > 0 && 
               cached.uploadProgress < 100 && 
               !cached.uploaded &&
               !cached.uploadError;
      });
      
      // Only reset flags if this is truly a new set (not just reordering) AND no uploads are in progress
      if (!hasUploadsInProgress && (images.length === 0 || !imageUris.every((uri) => existingImagesByUri.has(uri) || imageUploadCache.has(uri)))) {
        isUploadingRef.current = false;
        uploadsCompletedRef.current = false;
        setUploadsCompleted(false);
      } else if (hasUploadsInProgress) {
        // Uploads are in progress - mark as uploading to prevent duplicate triggers
        console.log('[useItemDetails] Uploads in progress detected, preserving upload state');
        isUploadingRef.current = true;
        setUploading(true);
      }
    }
  }, [imageUris]); // Only depend on imageUris, not images - prevents loops when images are deleted

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

    // Only upload images that aren't uploaded yet AND don't have errors
    // Images with errors need manual retry via handleRetryImage
    const imagesToUpload = images
      .filter((img) => (!img.uploaded || !img.supabaseUrl) && !img.uploadError)
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
        // Update cache with progress
        setImages((currentImages) => {
          const img = currentImages.find((i) => i.id === imageId);
          if (img) {
            imageUploadCache.set(img.uri, {
              id: img.id,
              uploaded: img.uploaded || false,
              supabaseUrl: img.supabaseUrl,
              uploadProgress: progress,
              uploadError: img.uploadError,
            });
          }
          return currentImages;
        });
      },
      // On complete
      async (imageId, url) => {
        uploadedUrls.push(url);
        uploadedImageMap.set(imageId, url);
        completedCount++;
        setImages((prev) => {
          const updated = prev.map((img) => {
            if (img.id === imageId) {
              const updatedImg = { ...img, uploaded: true, supabaseUrl: url, uploadProgress: 100 };
              // Update cache with upload status
              imageUploadCache.set(img.uri, {
                id: img.id,
                uploaded: true,
                supabaseUrl: url,
                uploadProgress: 100,
              });
              return updatedImg;
            }
            return img;
          });
          return updated;
        });
        
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
        setImages((prev) => {
          const updated = prev.map((img) => {
            if (img.id === imageId) {
              const updatedImg = { ...img, uploaded: false, uploadError: error };
              // Update cache with error status
              imageUploadCache.set(img.uri, {
                id: img.id,
                uploaded: false,
                uploadError: error,
              });
              return updatedImg;
            }
            return img;
          });
          return updated;
        });
        
        // Even if some fail, check if we're done
        if (completedCount === totalToUpload) {
          isUploadingRef.current = false;
          setUploading(false);
        }
      }
    );
  }, [images]);

  const handleRetryImage = useCallback(async (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image || !image.uploadError) {
      return; // Only retry if there's an error
    }

    // Get authenticated user
    const user = await AuthService.getCurrentUser();
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }
    const userId = user.id;

    // Clear error state and start upload
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, uploadError: undefined, uploadProgress: 0 }
          : img
      )
    );

    // Retry upload
    const result = await ImageUploadService.retryUploadImage(
      image.uri,
      image.id,
      userId,
      (progress) => {
        setUploadProgress((prev) => ({ ...prev, [imageId]: progress }));
        setImages((currentImages) => {
          const img = currentImages.find((i) => i.id === imageId);
          if (img) {
            imageUploadCache.set(img.uri, {
              id: img.id,
              uploaded: img.uploaded || false,
              supabaseUrl: img.supabaseUrl,
              uploadProgress: progress,
              uploadError: img.uploadError,
            });
          }
          return currentImages;
        });
      }
    );

    if (result.url && !result.error) {
      // Success
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, uploaded: true, supabaseUrl: result.url, uploadProgress: 100, uploadError: undefined }
            : img
        )
      );
      imageUploadCache.set(image.uri, {
        id: image.id,
        uploaded: true,
        supabaseUrl: result.url,
        uploadProgress: 100,
      });
    } else {
      // Failed again
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, uploadError: result.error || 'Upload failed' }
            : img
        )
      );
      imageUploadCache.set(image.uri, {
        id: image.id,
        uploaded: false,
        uploadError: result.error || 'Upload failed',
      });
    }
  }, [images]);


  // Trigger uploads when images are set (only if not already uploaded or completed)
  useEffect(() => {
    console.log('[useItemDetails] Upload trigger effect', {
      imagesCount: images.length,
      isUploading: isUploadingRef.current,
      uploadsCompleted: uploadsCompletedRef.current,
    });
    
    if (images.length === 0) {
      return;
    }
    
    // If already uploading, don't start another upload
    if (isUploadingRef.current) {
      console.log('[useItemDetails] Already uploading, skipping');
      return;
    }
    
    // Check if any images are currently uploading (from cache) - this handles navigation back during upload
    const hasUploadsInProgress = images.some((img) => {
      const cached = imageUploadCache.get(img.uri);
      return cached && 
             cached.uploadProgress !== undefined && 
             cached.uploadProgress > 0 && 
             cached.uploadProgress < 100 && 
             !cached.uploaded &&
             !cached.uploadError;
    });
    
    if (hasUploadsInProgress) {
      console.log('[useItemDetails] Uploads in progress detected from cache, skipping new upload trigger');
      isUploadingRef.current = true;
      setUploading(true);
      return;
    }
    
    // Check if all images are already uploaded
    const allUploaded = images.every((img) => img.uploaded && img.supabaseUrl);
    if (allUploaded) {
      console.log('[useItemDetails] All images already uploaded');
      isUploadingRef.current = false;
      setUploading(false);
      uploadsCompletedRef.current = true;
      setUploadsCompleted(true);
      return;
    }
    
    // Only trigger if there are images that need uploading
    // Skip images that have upload errors (they need manual retry)
    const needsUpload = images.some((img) => 
      (!img.uploaded || !img.supabaseUrl) && !img.uploadError
    );
    console.log('[useItemDetails] Needs upload:', needsUpload, {
      imagesNeedingUpload: images.filter((img) => (!img.uploaded || !img.supabaseUrl) && !img.uploadError).length,
      imagesWithErrors: images.filter((img) => img.uploadError).length,
    });
    
    if (needsUpload) {
      console.log('[useItemDetails] Starting image uploads...');
      startImageUploads();
    }
  }, [images, startImageUploads]);

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

      // Remove from cache
      imageUploadCache.delete(imageToRemove.uri);
      
      // Mark this URI as removed to prevent re-initialization
      removedImageUrisRef.current.add(imageToRemove.uri);
      
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
      console.log('[useItemDetails] handleAddImages called with', newUris.length, 'new URIs');
      const newImages: ImageUploadState[] = newUris.map((uri) => ({
        id: uuidv4(),
        uri,
        uploaded: false,
        uploadProgress: 0,
      }));
      console.log('[useItemDetails] Created', newImages.length, 'new image objects');
      setImages((prev) => {
        const updated = [...prev, ...newImages];
        console.log('[useItemDetails] Updated images count:', updated.length);
        return updated;
      });
      // Reset upload completion flags to allow new uploads
      isUploadingRef.current = false;
      uploadsCompletedRef.current = false;
      setUploadsCompleted(false);
      console.log('[useItemDetails] Reset upload flags, uploads should trigger');
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
    
    // Calculate average progress only for images that are being tracked
    // Cap each image's progress at 100% to prevent >100% overall progress
    let total = 0;
    let count = 0;
    
    images.forEach((img) => {
      const progress = uploadProgress[img.id];
      if (progress !== undefined) {
        // Cap at 100% to prevent overflow
        total += Math.min(progress, 100);
        count++;
      }
    });
    
    // If no images have progress tracked yet, return 0
    if (count === 0) return 0;
    
    // Calculate average and cap at 100%
    const average = Math.round(total / count);
    return Math.min(average, 100);
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
    handleRetryImage,
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
