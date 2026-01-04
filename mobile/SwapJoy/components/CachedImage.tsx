import React from 'react';
import { View, ActivityIndicator, Image, ImageURISource } from 'react-native';
import { styles } from './CachedImage.styles';

// Track URIs we have already loaded to avoid re-showing loader/flicker across mounts
const loadedUriSet = new Set<string>();

interface CachedImageProps {
  uri: string;
  style?: any;
  placeholder?: string;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  showLoader?: boolean;
  fallbackUri?: string;
  defaultSource?: number | ImageURISource; // RN typing
}

const CachedImage: React.FC<CachedImageProps> = React.memo(({
  uri,
  style,
  placeholder = 'https://via.placeholder.com/200x150?text=Loading...',
  resizeMode = 'cover',
  showLoader = true,
  fallbackUri = 'https://via.placeholder.com/200x150?text=No+Image',
  defaultSource,
}) => {
  const previouslyLoaded = React.useMemo(() => loadedUriSet.has(uri), [uri]);
  const [isLoading, setIsLoading] = React.useState(!previouslyLoaded);
  const [hasError, setHasError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(previouslyLoaded);

  // Only reset when URI truly changes; if this URI was seen before, keep as loaded to avoid flicker
  React.useEffect(() => {
    const seen = loadedUriSet.has(uri);
    setIsLoading(!seen);
    setHasError(false);
    setImageLoaded(seen);
  }, [uri]);

  const handleLoadStart = () => {
    if (!loadedUriSet.has(uri)) {
      setIsLoading(true);
      setHasError(false);
    }
  };

  const handleLoadEnd = () => {
    loadedUriSet.add(uri);
    setIsLoading(false);
    setImageLoaded(true);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setImageLoaded(false);
  };

  // If no uri provided, use placeholder; on error, use fallbackUri
  const imageUri = hasError ? fallbackUri : (uri || placeholder);
  const source = React.useMemo(() => ({ uri: imageUri } as ImageURISource), [imageUri]);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={styles.image}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        defaultSource={defaultSource as any}
      />
      {isLoading && showLoader && !imageLoaded && (
        <View style={styles.loaderContainer} pointerEvents="none">
          <ActivityIndicator size="small" color="#666" />
        </View>
      )}
    </View>
  );
});

CachedImage.displayName = 'CachedImage';

export default CachedImage;
