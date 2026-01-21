import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as ExpoLocation from 'expo-location';
import SJText from '../../components/SJText';
import PrimaryButton from '../../components/PrimaryButton';
import InlineLocationInput from '../../components/wizard/InlineLocationInput';
import InlineLocationMap from '../../components/wizard/InlineLocationMap';
import { colors } from '@navigation/MainTabNavigator.styles';
import { useLocalization } from '../../localization';
import { useLocation, City } from '../../hooks/useLocation';
import { ApiService } from '../../services/api';
import type { LocationSelection } from '../../types/location';
import { LocationInputScreenProps } from '../../types/navigation';
import { useItemDetails } from '../../hooks/useItemDetails';

const LocationInputScreen: React.FC<LocationInputScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useLocalization();
  const { imageUris } = route.params;
  const hookData = useItemDetails({ imageUris, navigation, route });
  const {
    currentLocation,
    manualLocation,
    selectedLocation,
    cities,
    filterCitiesByName,
    refreshLocation,
    setManualLocation,
    clearManualLocation,
  } = useLocation();

  const { locationLabel, locationCoords, handleLocationSelected, handleNext } = hookData;

  const [locationInputValue, setLocationInputValue] = useState<string>('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  useEffect(() => {
    if (manualLocation?.cityName) {
      const city = cities.find((c) => c.id === manualLocation.cityId);
      setLocationInputValue(
        city ? `${city.name}, ${city.country}` : manualLocation.cityName
      );
    } else if (locationLabel) {
      setLocationInputValue(locationLabel);
    }
  }, [manualLocation, locationLabel, cities]);

  const filteredCities = useMemo(() => {
    if (locationInputValue.trim().length === 0) return [];
    return filterCitiesByName(locationInputValue);
  }, [locationInputValue, filterCitiesByName]);

  const handleLocationInputChange = useCallback(
    (text: string) => {
      setLocationInputValue(text);
      if (text.trim().length > 0) {
        setShowCitySuggestions(true);
      } else {
        setShowCitySuggestions(false);
        clearManualLocation();
      }
    },
    [clearManualLocation]
  );

  const handleCitySelect = useCallback(
    async (city: City) => {
      const cityDisplayName = `${city.name}, ${city.country}`;
      setLocationInputValue(cityDisplayName);
      setShowCitySuggestions(false);
      setManualLocation({
        lat: city.center_lat,
        lng: city.center_lng,
        cityId: city.id,
        cityName: city.name,
      });
      await handleLocationSelected({
        lat: city.center_lat,
        lng: city.center_lng,
        cityName: city.name,
        country: city.country,
        cityId: city.id,
        stateProvince: city.state_province ?? null,
        source: 'city',
      });
    },
    [setManualLocation, handleLocationSelected]
  );

  const handleUseCurrentLocation = useCallback(async () => {
    await clearManualLocation();
    setLocationInputValue('');
    setShowCitySuggestions(false);
    if (!currentLocation) {
      await refreshLocation();
    }
    if (currentLocation) {
      try {
        const { data: nearest } = await ApiService.findNearestCity(
          currentLocation.lat,
          currentLocation.lng
        );
        await handleLocationSelected({
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          cityName: nearest?.name ?? null,
          country: nearest?.country ?? null,
          cityId: nearest?.id ?? null,
          stateProvince: nearest?.state_province ?? null,
          source: 'device',
          distanceKm: nearest?.distance_km ?? null,
        });
      } catch (error) {
        console.error('Error using current location:', error);
      }
    }
  }, [currentLocation, refreshLocation, clearManualLocation, handleLocationSelected]);

  const isValid = useMemo(() => {
    return locationCoords.lat !== null && locationCoords.lng !== null;
  }, [locationCoords]);

  const description = t('addItem.wizard.step6.description', {
    defaultValue: 'Select the location for your item.',
  });

  const locationPlaceholder = useMemo(() => {
    if (selectedLocation && !manualLocation) {
      return t('search.currentLocation', { defaultValue: 'Current location' });
    }
    return t('search.locationPlaceholder', { defaultValue: 'Enter city or address' });
  }, [selectedLocation, manualLocation, t]);

  const mapLocation = useMemo(() => {
    if (!selectedLocation) return null;
    return { lat: selectedLocation.lat, lng: selectedLocation.lng };
  }, [selectedLocation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <SJText style={styles.description}>{description}</SJText>

          <View style={styles.locationSection}>
            <InlineLocationInput
              value={locationInputValue}
              onChangeText={handleLocationInputChange}
              onFocus={() => {
                if (selectedLocation && !manualLocation && !locationInputValue.trim()) {
                  setLocationInputValue('');
                }
                if (locationInputValue.trim().length > 0) {
                  setShowCitySuggestions(true);
                }
              }}
              onBlur={() => {}}
              onUseCurrentLocation={handleUseCurrentLocation}
              placeholder={locationPlaceholder}
              hasCurrentLocation={!!currentLocation}
              showSuggestions={showCitySuggestions}
              suggestions={filteredCities}
              onSelectCity={handleCitySelect}
              t={t}
            />

            <InlineLocationMap
              location={mapLocation}
              cityName={manualLocation?.cityName}
              t={t}
            />
          </View>
      </ScrollView>

      <PrimaryButton
        onPress={handleNext}
        disabled={!isValid}
        label={t('common.next', { defaultValue: 'Next' })}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  locationSection: {
    flex: 1,
  },
});

export default LocationInputScreen;
