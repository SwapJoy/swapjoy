import React from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';

interface CachedImageProps {
  uri: string;
  style?: any;
  placeholder?: string;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  showLoader?: boolean;
  fallbackUri?: string;
}

const CachedImage: React.FC<CachedImageProps> = React.memo(({
  uri,
  style,
  placeholder = 'https://via.placeholder.com/200x150?text=Loading...',
  resizeMode = 'cover',
  showLoader = true,
  fallbackUri = 'https://via.placeholder.com/200x150?text=No+Image'
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Reset loading state when URI changes
  React.useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setImageLoaded(false);
  }, [uri]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    setImageLoaded(true);
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    setImageLoaded(false);
  };

  const imageUri = hasError ? fallbackUri : uri;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      {isLoading && showLoader && !imageLoaded && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

CachedImage.displayName = 'CachedImage';

export default CachedImage;
