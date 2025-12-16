import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, } from 'react-native';
import SJText from '../../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ExpoLocation from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../hooks/useOnboarding';
import { ApiService } from '../../services/api';
import { useLocalization } from '../../localization';
import { useAuth } from '../../contexts/AuthContext';
import type { CityOption, LocationSelection } from '../../types/location';

const LocationScreen: React.FC = () => {
  const { nextStep, previousStep, skipOnboarding, isFirstStep, completeOnboarding, currentStepIndex, totalSteps } = useOnboarding();
  const { user } = useAuth();
  const { t } = useLocalization();
  const [cities, setCities] = useState<CityOption[]>([]);
  const [filtered, setFiltered] = useState<CityOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCities, setLoadingCities] = useState(true);
  const [processingSelection, setProcessingSelection] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationSelection | null>(null);

  // Load cities and existing location
  useEffect(() => {
    const loadData = async () => {
      // Load cities
      try {
        setLoadingCities(true);
        const { data, error } = await ApiService.getActiveCities();
        if (error) {
          throw error;
        }
        setCities(data || []);
        setFiltered(data || []);
      } catch (error: any) {
        console.error('[LocationScreen] Failed to load cities:', error);
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          t('locationSelector.cityLoadError', {
            defaultValue: 'Unable to load city list. Please try again later.',
          })
        );
      } finally {
        setLoadingCities(false);
      }

      // Load existing location
      if (user) {
        try {
          const { data: profile } = await ApiService.getProfile();
          if (profile) {
            // Check if user has manual location or current location
            if (profile.manual_location_lat && profile.manual_location_lng) {
              // Find city for manual location
              const { data: nearest } = await ApiService.findNearestCity(
                profile.manual_location_lat,
                profile.manual_location_lng
              );
              if (nearest) {
                setSelectedCityId(nearest.id);
                setSelectedLocation({
                  lat: profile.manual_location_lat,
                  lng: profile.manual_location_lng,
                  cityName: nearest.name,
                  country: nearest.country,
                  cityId: nearest.id,
                  stateProvince: nearest.state_province ?? null,
                  source: 'city',
                });
              }
            } else if (profile.location_lat && profile.location_lng) {
              const { data: nearest } = await ApiService.findNearestCity(
                profile.location_lat,
                profile.location_lng
              );
              if (nearest) {
                setSelectedCityId(nearest.id);
                setSelectedLocation({
                  lat: profile.location_lat,
                  lng: profile.location_lng,
                  cityName: nearest.name,
                  country: nearest.country,
                  cityId: nearest.id,
                  stateProvince: nearest.state_province ?? null,
                  source: 'device',
                });
              }
            }
          }
        } catch (error) {
          console.error('[LocationScreen] Error loading location:', error);
        }
      }
    };
    loadData();
  }, [user, t]);

  // Filter cities based on search
  useEffect(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) {
      setFiltered(cities);
      return;
    }

    const next = cities.filter((city) => {
      const nameMatch = city.name.toLowerCase().includes(term);
      const countryMatch = city.country.toLowerCase().includes(term);
      const stateMatch = city.state_province?.toLowerCase().includes(term);
      return nameMatch || countryMatch || !!stateMatch;
    });
    setFiltered(next);
  }, [cities, searchQuery]);

  const handleSelectLocation = useCallback(
    async (selection: LocationSelection) => {
      try {
        setProcessingSelection(true);
        setSelectedLocation(selection);
        setSelectedCityId(selection.cityId ?? null);

        // Save location
        await ApiService.updateManualLocation({
          lat: selection.lat,
          lng: selection.lng,
        });
      } catch (error: any) {
        console.error('[LocationScreen] Selection error:', error);
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          error?.message ||
            t('locationSelector.selectionError', {
              defaultValue: 'Could not update location. Please try again.',
            })
        );
      } finally {
        setProcessingSelection(false);
      }
    },
    [t]
  );

  const handleCityPress = useCallback(
    (city: CityOption) => {
      handleSelectLocation({
        lat: city.center_lat,
        lng: city.center_lng,
        cityName: city.name,
        country: city.country,
        cityId: city.id,
        stateProvince: city.state_province ?? null,
        source: 'city',
      });
    },
    [handleSelectLocation]
  );

  const handleUseCurrentLocation = useCallback(async () => {
    try {
      setProcessingSelection(true);
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== ExpoLocation.PermissionStatus.GRANTED) {
        Alert.alert(
          t('locationSelector.permissionDeniedTitle', { defaultValue: 'Permission required' }),
          t('locationSelector.permissionDeniedMessage', {
            defaultValue:
              'Location access is needed to detect your current position. Please enable it in settings.',
          })
        );
        return;
      }

      const position = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Highest,
      });
      const { latitude, longitude } = position.coords;

      const { data: nearest, error } = await ApiService.findNearestCity(latitude, longitude);
      if (error) {
        console.warn('[LocationScreen] findNearestCity error:', error);
      }

      await handleSelectLocation({
        lat: latitude,
        lng: longitude,
        cityName: nearest?.name ?? null,
        country: nearest?.country ?? null,
        cityId: nearest?.id ?? null,
        stateProvince: nearest?.state_province ?? null,
        source: 'device',
        distanceKm: nearest?.distance_km ?? null,
      });
    } catch (error: any) {
      console.error('[LocationScreen] Current location error:', error);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        error?.message ||
          t('locationSelector.locationError', {
            defaultValue: 'Could not determine your current location. Please try again.',
          })
      );
    } finally {
      setProcessingSelection(false);
    }
  }, [handleSelectLocation, t]);

  const handleFinish = () => {
    completeOnboarding();
  };

  const renderCity = useCallback(
    ({ item }: { item: CityOption }) => {
      const isSelected = selectedCityId === item.id;
      return (
        <TouchableOpacity
          style={[styles.cityRow, isSelected && styles.cityRowSelected]}
          onPress={() => handleCityPress(item)}
          disabled={processingSelection}
        >
          <View>
            <SJText style={styles.cityName}>{item.name}</SJText>
            <SJText style={styles.cityMeta}>
              {[item.state_province, item.country].filter(Boolean).join(', ')}
            </SJText>
          </View>
          {isSelected ? <Ionicons name="checkmark-circle" size={20} color="#0ea5e9" /> : null}
        </TouchableOpacity>
      );
    },
    [handleCityPress, processingSelection, selectedCityId]
  );

  const keyExtractor = useCallback((item: CityOption) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            {!isFirstStep && (
              <TouchableOpacity onPress={previousStep} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
            )}
            <View style={styles.headerContent}>
              <SJText style={styles.stepIndicator}>Step {currentStepIndex + 1} of {totalSteps}</SJText>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <SJText style={styles.title}>
              {t('onboarding.location.title', { defaultValue: 'Choose Your Location' })}
            </SJText>
            <SJText style={styles.description}>
              {t('onboarding.location.description', { defaultValue: 'Select your location to find nearby swaps and matches.' })}
            </SJText>

            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
              disabled={processingSelection}
            >
              <Ionicons name="locate" size={18} color="#0ea5e9" />
              <SJText style={styles.currentLocationText}>
                {t('locationSelector.useCurrentLocation', { defaultValue: 'Use my current location' })}
              </SJText>
              {processingSelection ? (
                <ActivityIndicator size="small" color="#0ea5e9" style={styles.currentLocationSpinner} />
              ) : null}
            </TouchableOpacity>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('locationSelector.searchPlaceholder', { defaultValue: 'Search cities' })}
                editable={!processingSelection}
              />
            </View>

            {loadingCities ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0ea5e9" />
                <SJText style={styles.loadingText}>
                  {t('locationSelector.locating', { defaultValue: 'Loading cities...' })}
                </SJText>
              </View>
            ) : filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <SJText style={styles.emptyStateText}>
                  {t('locationSelector.empty', { defaultValue: 'No cities match your search.' })}
                </SJText>
              </View>
            ) : (
              <FlatList
                data={filtered}
                renderItem={renderCity}
                keyExtractor={keyExtractor}
                keyboardShouldPersistTaps="handled"
                style={styles.cityList}
                scrollEnabled={false}
              />
            )}

            {selectedLocation && (
              <View style={styles.selectedLocationContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <SJText style={styles.selectedLocationText}>
                  {selectedLocation.cityName && selectedLocation.country
                    ? `${selectedLocation.cityName}, ${selectedLocation.country}`
                    : t('onboarding.location.selected', { defaultValue: 'Location selected' })}
                </SJText>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipOnboarding}
          >
            <SJText style={styles.skipButtonText}>
              {t('onboarding.common.skip', { defaultValue: 'Skip' })}
            </SJText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleFinish}
          >
            <SJText style={styles.finishButtonText}>
              {t('onboarding.common.finish', { defaultValue: 'Finish' })}
            </SJText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161200',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    marginBottom: 16,
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#0369a1',
    flex: 1,
  },
  currentLocationSpinner: {
    marginLeft: 'auto',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    marginBottom: 16,
  },
  searchInput: {
    marginLeft: 8,
    fontSize: 15,
    flex: 1,
    color: '#0f172a',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#475569',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  cityList: {
    maxHeight: 300,
  },
  cityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  cityRowSelected: {
    backgroundColor: '#f0f9ff',
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  cityMeta: {
    marginTop: 2,
    fontSize: 13,
    color: '#64748b',
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    gap: 8,
  },
  selectedLocationText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  finishButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#161200',
  },
});

export default LocationScreen;

