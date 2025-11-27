import { useState, useRef, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import {
  useCameraDevice,
  useCameraPermission,
  useCameraFormat,
  Camera,
} from 'react-native-vision-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { useNavigation, NavigationProp, useIsFocused } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { DraftManager } from '../services/draftManager';

export const MAX_PHOTOS = 10;

export const useCamera = (onNavigateToMain?: () => void, isVisible?: boolean) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Camera'>>();
  const isFocused = useIsFocused(); // For stack navigation
  const { hasPermission, requestPermission } = useCameraPermission();
  const backDefaultDevice = useCameraDevice('back');
  
  // Determine if camera should be active
  // If isVisible prop is provided (from MainPageContainer), use it
  // Otherwise, use isFocused (from stack navigation)
  const shouldBeActive = isVisible !== undefined ? isVisible : isFocused;
  
  const [isActive, setIsActive] = useState(shouldBeActive);
  const prevShouldBeActiveRef = useRef(shouldBeActive);
  
  // Capture last frame before camera is paused and store in memory (base64)
  const captureLastFrame = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
          qualityPrioritization: 'speed',
        });
        const uri = (photo as any).path ?? (photo as any).uri;
        if (uri) {
          // Read file into base64 (memory)
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
          });
          
          // Try to delete the file from disk (silently fail if not possible)
          // The file is in a temp directory and will be cleaned up by the system
          try {
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (fileInfo.exists && !fileInfo.isDirectory) {
              await FileSystem.deleteAsync(uri, { idempotent: true });
            }
          } catch (deleteError) {
            // Silently ignore - temp files will be cleaned up by the system
          }
          
          // Store base64 data URI in memory
          setLastFrameBase64(`data:image/jpeg;base64,${base64}`);
        }
      } catch (error) {
        console.log('Could not capture last frame:', error);
      }
    }
  };
  
  useEffect(() => {
    const wasActive = prevShouldBeActiveRef.current;
    const isBecomingInactive = wasActive && !shouldBeActive;
    
    // If camera is about to be paused, capture last frame before updating state
    // Camera is still active at this point, so we can capture
    if (isBecomingInactive) {
      captureLastFrame();
    }
    
    prevShouldBeActiveRef.current = shouldBeActive;
    setIsActive(shouldBeActive);
  }, [shouldBeActive]);
  
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [galleryPermission, setGalleryPermission] = useState<boolean>(false);
  const [lastGalleryImage, setLastGalleryImage] = useState<string | null>(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState<boolean>(false);
  const [galleryPermissionDenied, setGalleryPermissionDenied] = useState<boolean>(false);
  const [lastFrameBase64, setLastFrameBase64] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);
  const activeDevice = backDefaultDevice;

  const format = useCameraFormat(activeDevice, [
    { photoResolution: { width: 1920, height: 1080 } },
  ]);

  // Reset denied state when permission is granted (e.g., user granted from settings)
  useEffect(() => {
    if (hasPermission && cameraPermissionDenied) {
      setCameraPermissionDenied(false);
    }
  }, [hasPermission, cameraPermissionDenied]);

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      if (capturedPhotos.length >= MAX_PHOTOS) {
        Toast.show({
          type: 'warning',
          text1: 'Maximum Photos Reached',
          text2: `You can only add up to ${MAX_PHOTOS} photos.`,
          position: 'top',
        });
        return;
      }

      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: flashMode === 'on' ? 'on' : 'off',
        });

        const uri = (photo as any).path ?? (photo as any).uri;
        if (!uri) {
          throw new Error('No photo path returned');
        }

        const newPhotos = [...capturedPhotos, uri];
        setCapturedPhotos(newPhotos);

        // Show toast when reaching the limit
        if (newPhotos.length >= MAX_PHOTOS) {
          Toast.show({
            type: 'warning',
            text1: 'Maximum Photos Reached',
            text2: `You can only add up to ${MAX_PHOTOS} photos.`,
            position: 'top',
          });
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleRequestCameraPermission = async () => {
    // If permission was previously denied, show alert immediately
    if (cameraPermissionDenied) {
      Alert.alert(
        'Camera Permission Required',
        'To take photos, please enable camera access in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: handleOpenSettings },
        ]
      );
      return;
    }

    try {
      const result = await requestPermission();
      if (!result) {
        // Permission was denied, mark as denied but don't show alert yet
        setCameraPermissionDenied(true);
      } else {
        setCameraPermissionDenied(false);
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      // Mark as denied but don't show alert
      setCameraPermissionDenied(true);
    }
  };

  const selectFromGallery = async () => {
    try {
      const remainingSlots = MAX_PHOTOS - capturedPhotos.length;
      if (remainingSlots <= 0) {
        Toast.show({
          type: 'warning',
          text1: 'Maximum Photos Reached',
          text2: `You can only add up to ${MAX_PHOTOS} photos.`,
          position: 'top',
        });
        return;
      }

      // Check current permission status first
      const { status: currentStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      
      // If permission was previously denied (either from state or current status), show alert immediately
      if (galleryPermissionDenied || currentStatus === 'denied') {
        setGalleryPermissionDenied(true);
        Alert.alert(
          'Gallery Permission Required',
          'To select photos from your gallery, please enable photo library access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: handleOpenSettings },
          ]
        );
        return;
      }
      
      if (currentStatus !== 'granted') {
        // Request media library permissions (status is 'undetermined')
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setGalleryPermission(status === 'granted');
        
        if (status === 'denied') {
          // Permission was denied, mark as denied but don't show alert yet
          setGalleryPermissionDenied(true);
          return;
        } else if (status !== 'granted') {
          // Permission request was cancelled or failed
          return;
        } else {
          setGalleryPermissionDenied(false);
        }
      } else {
        setGalleryPermission(true);
        setGalleryPermissionDenied(false);
      }

      // Get last gallery image if we have permission
      try {
        const { status: mediaStatus } = await MediaLibrary.getPermissionsAsync();
        if (mediaStatus === 'granted') {
          const assets = await MediaLibrary.getAssetsAsync({
            mediaType: MediaLibrary.MediaType.photo,
            sortBy: MediaLibrary.SortBy.creationTime,
            first: 1,
          });
          if (assets.assets.length > 0) {
            setLastGalleryImage(assets.assets[0].uri);
          }
        }
      } catch (error) {
        // Ignore error for getting last gallery image
        console.log('Could not get last gallery image:', error);
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
        setCapturedPhotos([...capturedPhotos, ...newUris]);
        // Update last gallery image to the most recent selection
        if (result.assets.length > 0) {
          setLastGalleryImage(result.assets[result.assets.length - 1].uri);
        }
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      Alert.alert('Error', 'Failed to select photos. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    setCapturedPhotos(capturedPhotos.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    if (capturedPhotos.length === 0) {
      Alert.alert('No Photos', 'Please take at least one photo to continue.');
      return;
    }

    try {
      // Create draft and navigate to form
      const draft = await DraftManager.createDraft(capturedPhotos);
      navigation.navigate('ItemDetailsForm', {
        draftId: draft.id,
        imageUris: capturedPhotos,
      });
    } catch (error) {
      console.error('Error creating draft:', error);
      Alert.alert('Error', 'Failed to create draft. Please try again.');
    }
  };

  const toggleFlash = () => {
    setFlashMode(current => 
      current === 'off' ? 'on' : 'off'
    );
  };

  const handleClose = () => {
    if (onNavigateToMain) {
      onNavigateToMain();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  return {
    // Camera device and permission
    activeDevice,
    hasPermission,
    format,
    cameraRef,
    isActive, // Camera active state based on visibility
    
    // States
    flashMode,
    isCapturing,
    capturedPhotos,
    galleryPermission,
    lastGalleryImage,
    lastFrameBase64, // Last captured frame before pause (stored in memory as base64)
    cameraPermissionDenied,
    galleryPermissionDenied,
    
    // Functions
    takePicture,
    handleRequestCameraPermission,
    selectFromGallery,
    removePhoto,
    handleNext,
    toggleFlash,
    handleClose,
  };
};

