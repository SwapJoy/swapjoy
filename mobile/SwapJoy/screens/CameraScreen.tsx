import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Platform,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCameraFormat,
} from 'react-native-vision-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { DraftManager } from '../services/draftManager';

const { width, height } = Dimensions.get('window');
const MAX_PHOTOS = 10;

type CameraScreenOwnProps = {
  onNavigateToMain?: () => void;
};

const CameraScreen: React.FC<CameraScreenOwnProps> = ({ onNavigateToMain }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Camera'>>();
  const { hasPermission, requestPermission } = useCameraPermission();
  // Prefer the main wide‑angle back camera, fall back to default back, plus front camera

  const backDefaultDevice = useCameraDevice('back');
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [galleryPermission, setGalleryPermission] = useState<boolean>(false);
  const [lastGalleryImage, setLastGalleryImage] = useState<string | null>(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState<boolean>(false);
  const [galleryPermissionDenied, setGalleryPermissionDenied] = useState<boolean>(false);
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


  return (
    <View style={styles.container}>
      {activeDevice && hasPermission && (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={activeDevice}
          isActive={true}
          photo={true}
          format={format}
          torch={flashMode === 'on' ? 'on' : 'off'}
        />
      )}

      {/* Camera Permission Overlay - only covers camera area, doesn't block controls */}
      {!hasPermission && (
        <View style={styles.permissionOverlay} pointerEvents="box-none">
          <View style={styles.permissionOverlayContent}>
            <Ionicons name="camera-outline" size={64} color="#fff" />
            <Text style={styles.permissionOverlayTitle}>Camera Access Required</Text>
            <Text style={styles.permissionOverlayText}>
              Please grant camera permission to take photos for your listings.
            </Text>
            <TouchableOpacity
              style={styles.permissionOverlayButton}
              onPress={handleRequestCameraPermission}
            >
              <Text style={styles.permissionOverlayButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Overlays on top of camera */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => {
              if (onNavigateToMain) {
                onNavigateToMain();
              } else if (navigation) {
                navigation.goBack();
              }
            }}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          {capturedPhotos.length > 0 && (
            <TouchableOpacity
              style={[styles.topButton, styles.nextButton]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Thumbnail Carousel */}
        {capturedPhotos.length > 0 && (
          <View style={styles.thumbnailContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailScrollContent}
            >
              {capturedPhotos.map((uri, index) => (
                <View key={index} style={styles.thumbnailWrapper}>
                  <Image source={{ uri }} style={styles.thumbnail} />
                  <TouchableOpacity
                    style={styles.removeThumbnail}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Left Gallery Button */}
          <TouchableOpacity
            style={[
              styles.circleButton,
              capturedPhotos.length >= MAX_PHOTOS && styles.circleButtonDisabled
            ]}
            onPress={() => {
              if (capturedPhotos.length >= MAX_PHOTOS) {
                Toast.show({
                  type: 'warning',
                  text1: 'Maximum Photos Reached',
                  text2: `You can only add up to ${MAX_PHOTOS} photos.`,
                  position: 'top',
                });
                return;
              }
              selectFromGallery();
            }}
            disabled={capturedPhotos.length >= MAX_PHOTOS}
          >
            {lastGalleryImage ? (
              <Image
                source={{ uri: lastGalleryImage }}
                style={[
                  styles.circleButtonImage,
                  capturedPhotos.length >= MAX_PHOTOS && styles.circleButtonImageDisabled
                ]}
              />
            ) : (
              <Ionicons 
                name="images-outline" 
                size={24} 
                color={capturedPhotos.length >= MAX_PHOTOS ? 'rgba(255, 255, 255, 0.5)' : '#fff'} 
              />
            )}
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            style={[
              styles.captureButton,
              !hasPermission && styles.captureButtonDisabled
            ]}
            onPress={() => {
              if (!hasPermission) {
                handleRequestCameraPermission();
                return;
              }
              if (capturedPhotos.length >= MAX_PHOTOS) {
                Toast.show({
                  type: 'warning',
                  text1: 'Maximum Photos Reached',
                  text2: `You can only add up to ${MAX_PHOTOS} photos.`,
                  position: 'top',
                });
                return;
              }
              if (!isCapturing) {
                takePicture();
              }
            }}
            disabled={isCapturing || !hasPermission}
          >
            <View style={[
              styles.captureButtonInner,
              (capturedPhotos.length >= MAX_PHOTOS || !hasPermission) && styles.captureButtonInnerDisabled
            ]} />
          </TouchableOpacity>

          {/* Right Flash Button */}
          <TouchableOpacity
            style={[
              styles.circleButton,
              (capturedPhotos.length >= MAX_PHOTOS || !hasPermission) && styles.circleButtonDisabled
            ]}
            onPress={() => {
              if (!hasPermission) {
                handleRequestCameraPermission();
                return;
              }
              if (capturedPhotos.length >= MAX_PHOTOS) {
                Toast.show({
                  type: 'warning',
                  text1: 'Maximum Photos Reached',
                  text2: `You can only add up to ${MAX_PHOTOS} photos.`,
                  position: 'top',
                });
                return;
              }
              toggleFlash();
            }}
            disabled={capturedPhotos.length >= MAX_PHOTOS || !hasPermission}
          >
            <Ionicons 
              name={flashMode === 'on' ? "flash" : "flash-off"} 
              size={24} 
              color={(capturedPhotos.length >= MAX_PHOTOS || !hasPermission) ? 'rgba(255, 255, 255, 0.5)' : '#fff'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  permissionOverlayContent: {
    alignItems: 'center',
    padding: 30,
    maxWidth: 300,
  },
  permissionOverlayTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionOverlayText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionOverlayButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  permissionOverlayButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    width: 'auto',
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 160 : 140,
    left: 0,
    right: 0,
    height: 120,
    paddingHorizontal: 20,
    paddingTop: 12,
    zIndex: 10,
  },
  thumbnailScrollContent: {
    paddingVertical: 12,
    paddingRight: 12,
    paddingLeft: 12,
  },
  thumbnailWrapper: {
    marginRight: 12,
    position: 'relative',
    width: 80,
    height: 80,
    marginTop: 12,
    marginBottom: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
  },
  removeThumbnail: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  photoCount: {
    position: 'absolute',
    top: 10,
    right: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomControls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    zIndex: 10,
  },
  circleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleButtonImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  circleButtonDisabled: {
    opacity: 0.5,
  },
  circleButtonImageDisabled: {
    opacity: 0.5,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInnerDisabled: {
    backgroundColor: '#ccc',
  },
});

export default CameraScreen;