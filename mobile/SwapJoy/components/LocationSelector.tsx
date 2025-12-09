import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {ActivityIndicator, Alert, FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View, } from 'react-native';
import SJText from '../components/SJText';
import * as ExpoLocation from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import { useLocalization } from '../localization';
import { ApiService } from '../services/api';
import type { CityOption, LocationSelection } from '../types/location';

interface LocationSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (selection: LocationSelection) => Promise<void> | void;
  initialCityId?: string | null;
  mode?: 'user' | 'item';
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  visible,
  onClose,
  onSelectLocation,
  initialCityId = null,
  mode = 'user',
}) => {
  const { t } = useLocalization();
  const [cities, setCities] = useState<CityOption[]>([]);
  const [filtered, setFiltered] = useState<CityOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCities, setLoadingCities] = useState(false);
  const [processingSelection, setProcessingSelection] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(initialCityId);

  const headerTitle = useMemo(
    () =>
      mode === 'item'
        ? t('locationSelector.itemTitle', { defaultValue: 'Select item location' })
        : t('locationSelector.title', { defaultValue: 'Choose your location' }),
    [mode, t]
  );

  const searchPlaceholder = t('locationSelector.searchPlaceholder', {
    defaultValue: 'Search cities',
  });
  const useCurrentLocationLabel = t('locationSelector.useCurrentLocation', {
    defaultValue: 'Use my current location',
  });
  const locatingLabel = t('locationSelector.locating', {
    defaultValue: 'Determining your location…',
  });
  const noCitiesLabel = t('locationSelector.empty', {
    defaultValue: 'No cities match your search.',
  });
  const cancelLabel = t('common.cancel', { defaultValue: 'Cancel' });

  useEffect(() => {
    if (!visible) {
      return;
    }

    let isMounted = true;

    const loadCities = async () => {
      try {
        setLoadingCities(true);
        const { data, error } = await ApiService.getActiveCities();
        if (error) {
          throw error;
        }
        if (isMounted) {
          setCities(data || []);
        }
      } catch (error: any) {
        console.error('[LocationSelector] Failed to load cities:', error);
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          t('locationSelector.cityLoadError', {
            defaultValue: 'Unable to load city list. Please try again later.',
          })
        );
      } finally {
        if (isMounted) {
          setLoadingCities(false);
        }
      }
    };

    if (cities.length === 0) {
      loadCities();
    }

    return () => {
      isMounted = false;
    };
  }, [cities.length, t, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }
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
  }, [cities, searchQuery, visible]);

  useEffect(() => {
    if (visible) {
      setSelectedCityId(initialCityId);
    }
  }, [initialCityId, visible]);

  const handleSelect = useCallback(
    async (selection: LocationSelection) => {
      try {
        setProcessingSelection(true);
        await onSelectLocation(selection);
        setSelectedCityId(selection.cityId ?? null);
        onClose();
      } catch (error: any) {
        console.error('[LocationSelector] Selection error:', error);
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
    [onClose, onSelectLocation, t]
  );

  const handleCityPress = useCallback(
    (city: CityOption) => {
      handleSelect({
        lat: city.center_lat,
        lng: city.center_lng,
        cityName: city.name,
        country: city.country,
        cityId: city.id,
        stateProvince: city.state_province ?? null,
        source: 'city',
      });
    },
    [handleSelect]
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
        console.warn('[LocationSelector] findNearestCity error:', error);
      }

      await onSelectLocation(
        {
          lat: latitude,
          lng: longitude,
          cityName: nearest?.name ?? null,
          country: nearest?.country ?? null,
          cityId: nearest?.id ?? null,
          stateProvince: nearest?.state_province ?? null,
          source: 'device',
          distanceKm: nearest?.distance_km ?? null,
        }
      );
      onClose();
    } catch (error: any) {
      console.error('[LocationSelector] Current location error:', error);
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
  }, [onClose, onSelectLocation, t]);

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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <SJText style={styles.headerTitle}>{headerTitle}</SJText>
            <TouchableOpacity onPress={onClose} disabled={processingSelection}>
              <SJText style={styles.cancelText}>{cancelLabel}</SJText>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
              disabled={processingSelection}
            >
              <Ionicons name="locate" size={18} color="#0ea5e9" />
              <SJText style={styles.currentLocationText}>{useCurrentLocationLabel}</SJText>
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
                placeholder={searchPlaceholder}
                editable={!processingSelection}
              />
            </View>

            {loadingCities ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0ea5e9" />
                <SJText style={styles.loadingText}>{locatingLabel}</SJText>
              </View>
            ) : filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <SJText style={styles.emptyStateText}>{noCitiesLabel}</SJText>
              </View>
            ) : (
              <FlatList
                data={filtered}
                renderItem={renderCity}
                keyExtractor={keyExtractor}
                keyboardShouldPersistTaps="handled"
                style={styles.cityList}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  cancelText: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#0369a1',
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
    maxHeight: 360,
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
});

export default LocationSelector;

