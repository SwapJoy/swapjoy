import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Camera } from 'react-native-vision-camera';
import { Ionicons } from '@expo/vector-icons';
import { useCamera, MAX_PHOTOS } from '../hooks/useCamera';

type CameraScreenOwnProps = {
  onNavigateToMain?: () => void;
  isVisible?: boolean; // For MainPageContainer to control camera activation
};

const CameraScreen: React.FC<CameraScreenOwnProps> = ({ onNavigateToMain, isVisible }) => {
  const {
    activeDevice,
    hasPermission,
    format,
    cameraRef,
    isActive,
    flashMode,
    isCapturing,
    capturedPhotos,
    lastGalleryImage,
    lastFrameBase64,
    takePicture,
    handleRequestCameraPermission,
    selectFromGallery,
    removePhoto,
    handleNext,
    toggleFlash,
    handleClose,
  } = useCamera(onNavigateToMain, isVisible);
  
  // Track camera ready state to fade out blurred last frame
  const [isCameraReady, setIsCameraReady] = React.useState(false);
  const readyTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const overlayOpacity = React.useRef(new Animated.Value(1)).current; // Start fully visible
  
  // Handle camera initialization
  const handleCameraInitialized = React.useCallback(() => {
    setIsCameraReady(true);
    // Smoothly fade out the blurred overlay when camera is ready
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [overlayOpacity]);
  
  React.useEffect(() => {
    // When camera becomes active, reset ready state and show overlay
    if (isActive) {
      setIsCameraReady(false);
      // Reset opacity to fully visible
      overlayOpacity.setValue(1);
      
      // Clear any existing timer
      if (readyTimerRef.current) {
        clearTimeout(readyTimerRef.current);
      }
      
      // Fallback: If camera doesn't call onInitialized, mark as ready after delay
      readyTimerRef.current = setTimeout(() => {
        setIsCameraReady(true);
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 300);
      
      return () => {
        if (readyTimerRef.current) {
          clearTimeout(readyTimerRef.current);
        }
      };
    } else {
      // When camera becomes inactive, reset ready state and show overlay
      setIsCameraReady(false);
      overlayOpacity.setValue(1);
      if (readyTimerRef.current) {
        clearTimeout(readyTimerRef.current);
      }
    }
  }, [isActive, overlayOpacity]);
  


  return (
    <View style={styles.container}>
      {/* Always render camera when device and permission are available to prevent flickering */}
      {activeDevice && hasPermission ? (
        <>
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={activeDevice}
            isActive={isActive}
            photo={true}
            format={format}
            torch={flashMode === 'on' ? 'on' : 'off'}
            onInitialized={handleCameraInitialized}
          />
          {/* Last frame with native blur effect - always rendered when available, opacity controls visibility */}
          {lastFrameBase64 ? (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { opacity: overlayOpacity },
              ]}
              pointerEvents="none"
            >
              <Image
                source={{ uri: lastFrameBase64 }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <BlurView
                intensity={70}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          ) : null}
        </>
      ) : null}

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
            onPress={handleClose}
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
            onPress={selectFromGallery}
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
              takePicture();
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