import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

const DEFAULT_REGION: Region = {
  latitude: 41.7151,
  longitude: 44.8271,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

interface InlineLocationMapProps {
  location: { lat: number; lng: number } | null;
  cityName?: string;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const InlineLocationMap: React.FC<InlineLocationMapProps> = ({ location, cityName, t }) => {
  const mapRef = useRef<MapView | null>(null);
  const isAndroid = Platform.OS === 'android';

  const targetRegion = useMemo<Region>(() => {
    if (location) {
      return {
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return DEFAULT_REGION;
  }, [location]);

  useEffect(() => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion(targetRegion, 300);
    }
  }, [location, targetRegion]);

  return (
    <View style={styles.mapContainer} pointerEvents="none">
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={isAndroid ? PROVIDER_GOOGLE : undefined}
        initialRegion={targetRegion}
        liteMode={isAndroid}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {location && (
          <Marker
            coordinate={{ latitude: location.lat, longitude: location.lng }}
            title={cityName || t('search.currentLocation', { defaultValue: 'Current location' })}
            pinColor={cityName ? '#ef4444' : '#0ea5e9'}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    marginTop: 12,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default InlineLocationMap;
