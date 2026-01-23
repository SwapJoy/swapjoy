import React, { useMemo, useEffect, useLayoutEffect, useCallback, useState, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DraggableGrid from 'react-native-draggable-grid';
import SJText from '../../components/SJText';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '@navigation/MainTabNavigator.styles';
import { useLocalization } from '../../localization';
import { ImageUploadProgressScreenProps } from '../../types/navigation';
import { useItemDetails } from '../../hooks/useItemDetails';
import { useWizardForm } from '../../contexts/WizardFormContext';
import { MAX_PHOTOS } from '../../hooks/useCamera';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 64) / 3; // 3 columns with padding

const ImageUploadProgressScreen: React.FC<ImageUploadProgressScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useLocalization();
  const { imageUris: routeImageUris } = route.params;
  const { resetFormData, formData, setImageUris } = useWizardForm();
  // Use context imageUris if available (includes images added via + button), otherwise use route params
  const imageUris = formData.imageUris.length > 0 ? formData.imageUris : routeImageUris;
  const hookData = useItemDetails({ imageUris, navigation, route });
  const { images, uploading, uploadProgress, handleRemoveImage, handleAddImages, handleReorderImages, handleRetryImage, getOverallProgress } = hookData;
  
  // Local state to immediately update grid data when reordering
  // This ensures the library sees the updated data right away
  const [localImages, setLocalImages] = useState(images);
  const lastReorderTimeRef = useRef<number>(0);
  const reorderedIdsRef = useRef<string>('');
  const localImagesRef = useRef(images);
  
  // Update ref when localImages changes
  useEffect(() => {
    localImagesRef.current = localImages;
  }, [localImages]);
  
  // Sync local state with hook state
  // Strategy: Update properties from hook, but preserve order if we recently reordered
  useEffect(() => {
    const now = Date.now();
    const timeSinceReorder = now - lastReorderTimeRef.current;
    const currentLocal = localImagesRef.current;
    const currentLocalIds = currentLocal.map((img: any) => img.id).join(',');
    const hookIds = images.map((img: any) => img.id).join(',');
    
    console.log('[ImageUploadProgress] Sync effect triggered', {
      currentLocalCount: currentLocal.length,
      hookImagesCount: images.length,
      currentLocalIds,
      hookIds,
      timeSinceReorder,
      reorderedIdsRef: reorderedIdsRef.current,
    });
    
    // If we reordered recently (< 2 seconds), preserve the local order
    if (timeSinceReorder < 2000 && reorderedIdsRef.current === currentLocalIds) {
      // Recent reorder - update properties from hook but keep local order
      const orderedImages = currentLocal.map((localImg: any) => {
        const updatedImg = images.find((img: any) => img.id === localImg.id);
        return updatedImg || localImg;
      });
      console.log('[ImageUploadProgress] Preserving reorder, updating properties');
      setLocalImages(orderedImages);
    } else {
      // No recent reorder - check what changed
      if (currentLocalIds === hookIds) {
        // Same IDs, just property updates (e.g., upload status) - preserve current order and update properties
        const orderedImages = currentLocal.map((localImg: any) => {
          const updatedImg = images.find((img: any) => img.id === localImg.id);
          return updatedImg || localImg;
        });
        console.log('[ImageUploadProgress] Same IDs, updating properties');
        setLocalImages(orderedImages);
      } else {
        // IDs changed (add/remove) - use hook order
        console.log('[ImageUploadProgress] IDs changed, updating localImages with hook images', {
          oldCount: currentLocal.length,
          newCount: images.length,
        });
        setLocalImages(images);
        reorderedIdsRef.current = ''; // Reset reorder tracking
      }
    }
    
    // Sync image URIs to context whenever images change
    const currentUris = images.map((img: any) => img.uri);
    setImageUris(currentUris);
  }, [images, setImageUris]);
  
  // Memoize the data array for DraggableGrid
  const gridData = useMemo(() => {
    return localImages.map((img: any) => ({ 
      ...img, 
      key: img.id, // Library requires 'key' property for identification
    }));
  }, [localImages]);

  // Reset form data when starting a new wizard flow
  useEffect(() => {
    resetFormData();
    // Note: We don't clear the imageUploadCache here because we want to preserve
    // upload status when navigating back from preview screen
  }, [resetFormData]);

  const handleAddMoreImages = useCallback(async () => {
    try {
      const remainingSlots = MAX_PHOTOS - images.length;
      if (remainingSlots <= 0) {
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          `You can only add up to ${MAX_PHOTOS} photos.`
        );
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          t('camera.permissionDenied', { defaultValue: 'Permission to access media library is required.' })
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newUris = result.assets.map((asset) => asset.uri);
        handleAddImages(newUris);
        // Context will be updated by the sync effect when images state changes
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('camera.selectError', { defaultValue: 'Failed to select photos. Please try again.' })
      );
    }
  }, [images, handleAddImages, t, setImageUris]);

  // Set up header with + button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        const remainingSlots = MAX_PHOTOS - images.length;
        return (
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={handleAddMoreImages}
            disabled={remainingSlots <= 0}
          >
            <Ionicons
              name="add"
              size={24}
              color={remainingSlots <= 0 ? '#999' : colors.primaryDark}
            />
          </TouchableOpacity>
        );
      },
    });
  }, [navigation, images.length, handleAddMoreImages]);

  const hasImages = useMemo(() => {
    return localImages.length > 0;
  }, [localImages.length]);

  const failedUploads = useMemo(() => {
    return images.filter((img: any) => img.uploadError);
  }, [images]);

  const description = t('addItem.wizard.step1.description', {
    defaultValue: 'Your images are being uploaded. Please wait until all uploads are complete.',
  });


  // Handle drag release - reorder images
  // The library returns the reordered data array directly (with the same objects we passed in)
  const handleDragRelease = useCallback((data: any[]) => {
    console.log('[ImageUploadProgress] onDragRelease - received', data.length, 'items');
    
    // The library returns the same objects we passed in, just reordered
    // Extract the original image objects (without the 'key' property we added)
    const reorderedImages = data.map((item: any) => {
      // Remove the 'key' property we added for the library, keep everything else
      const { key, ...imageData } = item;
      return imageData;
    });
    
    console.log('[ImageUploadProgress] Reordered images:', reorderedImages.map((img: any) => img.id));
    console.log('[ImageUploadProgress] Current local images:', localImagesRef.current.map((img: any) => img.id));
    
    // Verify we have all images
    if (reorderedImages.length !== localImagesRef.current.length) {
      console.error('[ImageUploadProgress] Reorder failed: image count mismatch', {
        received: reorderedImages.length,
        expected: localImagesRef.current.length,
      });
      return;
    }
    
    // Mark that we just reordered (to prevent sync from overwriting)
    const reorderedIds = reorderedImages.map((img: any) => img.id).join(',');
    lastReorderTimeRef.current = Date.now();
    reorderedIdsRef.current = reorderedIds;
    
    console.log('[ImageUploadProgress] Setting reordered images, IDs:', reorderedIds);
    
    // Update local state immediately so the grid reflects the change
    setLocalImages(reorderedImages);
    
    // Also update the hook state to persist the change
    handleReorderImages(reorderedImages);
  }, [handleReorderImages]);

  // Render image item for the grid
  const renderImageItem = useCallback((item: any) => {
    const img = item;
    // Get the latest image state from hook (for upload status)
    const latestImage = images.find((i: any) => i.id === img.id) || img;
    const progress = uploadProgress[latestImage.id];
    
    // Use latest image state for upload status checks
    const isUploading = !latestImage.uploaded && !latestImage.uploadError && progress !== undefined && progress < 100;
    const isUploaded = latestImage.uploaded && latestImage.supabaseUrl;
    const hasError = latestImage.uploadError;

    return (
      <View key={img.id} style={styles.imageWrapper}>
        <Image source={{ uri: img.uri }} style={styles.image} />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveImage(img.id)}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <View style={styles.removeCircle}>
            <Ionicons name="close" size={12} color={colors.primaryDark} />
          </View>
        </TouchableOpacity>
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="small" color={colors.primaryDark} />
            {progress !== undefined && (
              <SJText style={styles.uploadProgressText}>{progress}%</SJText>
            )}
          </View>
        )}
        {isUploaded && (
          <View style={styles.uploadedBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
          </View>
        )}
        {hasError && (
          <View style={styles.errorOverlay}>
            <Ionicons name="alert-circle" size={24} color="#FF3B30" />
            <SJText style={styles.errorText}>Failed</SJText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => handleRetryImage(img.id)}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <View style={styles.retryButtonInner}>
                <Ionicons name="refresh" size={16} color={colors.primaryDark} />
                <SJText style={styles.retryButtonText}>
                  {t('common.retry', { defaultValue: 'Retry' })}
                </SJText>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }, [handleRemoveImage, handleRetryImage, uploadProgress, images, t]);

  return (
    <View style={styles.container}>
        <View style={styles.content}>
          <SJText style={styles.description}>{description}</SJText>

          {uploading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${getOverallProgress()}%` }]}
                />
              </View>
              <SJText style={styles.progressText}>
                {getOverallProgress()}% {t('addItem.wizard.step1.uploading', { defaultValue: 'uploaded' })}
              </SJText>
            </View>
          )}

          <View style={styles.gridContainer}>
            {gridData.length > 0 && (
              <DraggableGrid
                data={gridData}
                renderItem={renderImageItem}
                onDragRelease={handleDragRelease}
                numColumns={3}
                itemHeight={IMAGE_SIZE}
                style={styles.draggableGrid}
              />
            )}
          </View>
        </View>

        <PrimaryButton
          onPress={() => {
            // Use localImages to get the current order (includes any reordering)
            const currentUris = localImages.map((img: any) => img.uri);
            // Update context with current image URIs
            setImageUris(currentUris);
            navigation.navigate('TitleInput', { 
              imageUris: currentUris,
              failedUploads: failedUploads.length > 0,
            });
          }}
          disabled={!hasImages}
          label={t('common.next', { defaultValue: 'Next' })}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryYellow,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  gridContainer: {
    flex: 1,
    paddingBottom: 16,
  },
  draggableGrid: {
    flex: 1,
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 0,
    overflow: 'hidden',
    margin: 0.5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  removeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadProgressText: {
    marginTop: 4,
    fontSize: 10,
    color: '#fff',
  },
  uploadedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 59, 48, 0.7)',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 4,
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 8,
  },
  retryButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryYellow,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
});

export default ImageUploadProgressScreen;
