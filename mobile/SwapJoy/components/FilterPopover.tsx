import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  PanResponder,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import SJText from './SJText';
import { useCategories } from '../hooks/useCategories';
import { useLocation, City } from '../hooks/useLocation';
import { useFilters, FilterState } from '../contexts/FiltersContext';
import { formatCurrency } from '../utils';
import { colors } from '@navigation/MainTabNavigator.styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PRICE_MAX = 10000;
const DISTANCE_OPTIONS = [5, 10, 25, 50, 100, null] as const;
const DEFAULT_REGION: Region = {
  latitude: 41.7151,
  longitude: 44.8271,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

interface FilterPopoverProps {
  visible: boolean;
  onClose: () => void;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

// ============================================================================
// Header Component
// ============================================================================

interface FilterPopoverHeaderProps {
  onClose: () => void;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const FilterPopoverHeader: React.FC<FilterPopoverHeaderProps> = ({ onClose, t }) => (
  <View style={styles.header}>
    <SJText style={styles.headerTitle}>
      {t('search.filters', { defaultValue: 'Filters' })}
    </SJText>
    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
      <Ionicons name="close" size={24} color="#fff" />
    </TouchableOpacity>
  </View>
);

// ============================================================================
// Price Range Slider Component
// ============================================================================

interface PriceRangeSliderProps {
  minValue: number;
  maxValue: number | null; // null means infinite/no upper bound
  onMinChange: (value: number) => void;
  onMaxChange: (value: number | null) => void;
  currency: string;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  currency,
  t,
}) => {
  const sliderWidth = SCREEN_WIDTH - 64;
  const thumbSize = 24;
  const trackRef = useRef<View>(null);
  const [trackX, setTrackX] = useState(0);
  const INFINITE_THRESHOLD = 0.95; // 95% of slider width = infinite

  useEffect(() => {
    trackRef.current?.measureInWindow((x) => setTrackX(x));
  }, []);

  const valueToPosition = (value: number | null) => {
    if (value === null) return sliderWidth;
    return (value / PRICE_MAX) * sliderWidth;
  };
  
  const positionToValue = (position: number): number | null => {
    // If position is at or near the end (95%+), return null (infinite)
    if (position >= sliderWidth * INFINITE_THRESHOLD) {
      return null;
    }
    return Math.round((position / sliderWidth) * PRICE_MAX);
  };

  const updateMinValue = useCallback(
    (pageX: number) => {
      const relativeX = pageX - trackX;
      const clampedX = Math.max(0, Math.min(sliderWidth, relativeX));
      const newValue = positionToValue(clampedX);
      if (newValue === null) {
        // Can't set min to infinite, set to max - 100 or PRICE_MAX - 100
        const effectiveMax = maxValue ?? PRICE_MAX;
        onMinChange(Math.max(0, effectiveMax - 100));
      } else {
        const effectiveMax = maxValue ?? PRICE_MAX;
        onMinChange(Math.min(newValue, effectiveMax - 100));
      }
    },
    [trackX, maxValue, onMinChange]
  );

  const updateMaxValue = useCallback(
    (pageX: number) => {
      const relativeX = pageX - trackX;
      const clampedX = Math.max(0, Math.min(sliderWidth, relativeX));
      const newValue = positionToValue(clampedX);
      onMaxChange(newValue);
    },
    [trackX, onMaxChange]
  );

  const minPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        trackRef.current?.measureInWindow((x) => {
          setTrackX(x);
          updateMinValue(evt.nativeEvent.pageX);
        });
      },
      onPanResponderMove: (evt) => updateMinValue(evt.nativeEvent.pageX),
    })
  ).current;

  const maxPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        trackRef.current?.measureInWindow((x) => {
          setTrackX(x);
          updateMaxValue(evt.nativeEvent.pageX);
        });
      },
      onPanResponderMove: (evt) => updateMaxValue(evt.nativeEvent.pageX),
    })
  ).current;

  const handleTrackPress = (event: any) => {
    const touchX = event.nativeEvent.pageX;
    const relativeX = touchX - trackX;
    const value = positionToValue(relativeX);
    const effectiveMax = maxValue ?? PRICE_MAX;
    const minDist = Math.abs((value ?? 0) - minValue);
    const maxDist = Math.abs((value ?? effectiveMax) - effectiveMax);
    if (minDist < maxDist) {
      updateMinValue(touchX);
    } else {
      updateMaxValue(touchX);
    }
  };

  const minPosition = valueToPosition(minValue);
  const maxPosition = valueToPosition(maxValue);
  const effectiveMaxValue = maxValue ?? PRICE_MAX;

  return (
    <View style={styles.priceSliderContainer}>
      <View style={styles.priceDisplayRow}>
        <View style={styles.priceDisplay}>
          <SJText style={styles.priceLabel}>{t('search.min', { defaultValue: 'Min' })}</SJText>
          <SJText style={styles.priceValue}>{formatCurrency(minValue, currency)}</SJText>
        </View>
        <View style={styles.priceDisplay}>
          <SJText style={styles.priceLabel}>{t('search.max', { defaultValue: 'Max' })}</SJText>
          <SJText style={styles.priceValue}>
            {maxValue === null 
              ? t('search.noLimit', { defaultValue: 'No limit' })
              : formatCurrency(maxValue, currency)}
          </SJText>
        </View>
      </View>
      <TouchableOpacity activeOpacity={1} onPress={handleTrackPress} style={styles.sliderTrackContainer}>
        <View ref={trackRef} style={[styles.sliderTrack, { width: sliderWidth }]}>
          <View style={styles.sliderTrackBackground} />
          <View
            style={[
              styles.sliderTrackFill,
              { 
                left: minPosition, 
                width: maxValue === null ? sliderWidth - minPosition : maxPosition - minPosition 
              },
            ]}
          />
          <View
            {...minPanResponder.panHandlers}
            style={[styles.sliderThumb, { left: minPosition - thumbSize / 2 }]}
          />
          <View
            {...maxPanResponder.panHandlers}
            style={[
              styles.sliderThumb, 
              { 
                left: maxValue === null 
                  ? sliderWidth - thumbSize / 2 
                  : maxPosition - thumbSize / 2 
              }
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

// ============================================================================
// Category Section Component
// ============================================================================

interface CategorySectionProps {
  categories: Array<{ id: string; name: string; icon?: string | null }>;
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  loading: boolean;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  selectedCategories,
  onToggleCategory,
  onSelectAll,
  onClearAll,
  loading,
  t,
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayedCategories = showAll ? categories : categories.slice(0, 5);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <SJText style={styles.sectionTitle}>
          {t('search.categories', { defaultValue: 'Categories' })}
        </SJText>
        <View style={styles.sectionActions}>
          <TouchableOpacity onPress={onSelectAll}>
            <SJText style={styles.actionText}>{t('common.selectAll', { defaultValue: 'All' })}</SJText>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity onPress={onClearAll}>
            <SJText style={styles.actionText}>{t('common.clear', { defaultValue: 'Clear' })}</SJText>
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <SJText style={styles.loadingText}>{t('common.loading', { defaultValue: 'Loading...' })}</SJText>
        </View>
      ) : (
        <>
          <View style={styles.categoryChipsContainer}>
            {displayedCategories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                  onPress={() => onToggleCategory(category.id)}
                >
                  {category.icon && <SJText style={styles.categoryIcon}>{category.icon}</SJText>}
                  <SJText style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                    {category.name}
                  </SJText>
                </TouchableOpacity>
              );
            })}
          </View>
          {categories.length > 10 && (
            <TouchableOpacity style={styles.seeMoreButton} onPress={() => setShowAll(!showAll)}>
              <SJText style={styles.seeMoreText}>
                {showAll
                  ? t('common.seeLess', { defaultValue: 'See less' })
                  : t('common.seeMore', { defaultValue: 'See more' })}
              </SJText>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

// ============================================================================
// Distance Section Component
// ============================================================================

interface DistanceSectionProps {
  selectedDistance: number | null;
  onSelectDistance: (distance: number | null) => void;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const DistanceSection: React.FC<DistanceSectionProps> = ({ selectedDistance, onSelectDistance, t }) => (
  <View style={styles.section}>
    <SJText style={styles.sectionTitle}>{t('search.distance', { defaultValue: 'Distance' })}</SJText>
    <View style={styles.distanceOptionsContainer}>
      {DISTANCE_OPTIONS.map((distance) => {
        const isSelected = selectedDistance === distance;
        const label =
          distance === null ? t('search.anyDistance', { defaultValue: 'Any distance' }) : `${distance} km`;
        return (
          <TouchableOpacity
            key={distance === null ? 'any' : distance}
            style={[styles.distanceOption, isSelected && styles.distanceOptionSelected]}
            onPress={() => onSelectDistance(distance === selectedDistance ? null : distance)}
          >
            <SJText
              style={[styles.distanceOptionText, isSelected && styles.distanceOptionTextSelected]}
            >
              {label}
            </SJText>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// ============================================================================
// City Suggestions Component – onPressOut hack
// ============================================================================

interface CitySuggestionsProps {
  cities: City[];
  onSelectCity: (city: City) => void;
}

const CitySuggestions: React.FC<CitySuggestionsProps> = ({ cities, onSelectCity }) => (
  <View style={styles.citySuggestionsContainer}>
    {cities.slice(0, 5).map((city) => (
      <TouchableOpacity
        key={city.id}
        style={styles.citySuggestionItem}
        // ⬇️ Use onPressOut so first tap still selects even if keyboard blurs
        onPressOut={() => onSelectCity(city)}
        activeOpacity={0.7}
      >
        <Ionicons name="location" size={16} color="#64748b" />
        <View style={styles.citySuggestionText}>
          <SJText style={styles.citySuggestionName}>{city.name}</SJText>
          <SJText style={styles.citySuggestionCountry}>
            {city.state_province ? `${city.state_province}, ` : ''}
            {city.country}
          </SJText>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

// ============================================================================
// Location Input Component
// ============================================================================

interface LocationInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onUseCurrentLocation: () => void;
  placeholder: string;
  hasCurrentLocation: boolean;
  showSuggestions: boolean;
  suggestions: City[];
  onSelectCity: (city: City) => void;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChangeText,
  onFocus,
  onBlur,
  onUseCurrentLocation,
  placeholder,
  hasCurrentLocation,
  showSuggestions,
  suggestions,
  onSelectCity,
  t,
}) => (
  <View style={styles.locationInputContainer}>
    <View style={styles.locationInputWrapper}>
      <Ionicons name="location-outline" size={18} color="#64748b" />
      <TextInput
        style={styles.locationInput}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={onUseCurrentLocation}
        accessibilityLabel={t('search.useCurrentLocation', { defaultValue: 'Use current location' })}
      >
        <Ionicons name="navigate" size={18} color={hasCurrentLocation ? '#0ea5e9' : '#94a3b8'} />
      </TouchableOpacity>
    </View>
    {showSuggestions && suggestions.length > 0 && (
      <CitySuggestions cities={suggestions} onSelectCity={onSelectCity} />
    )}
  </View>
);

// ============================================================================
// Location Map Component (safe for ScrollView)
// ============================================================================

interface LocationMapProps {
  location: { lat: number; lng: number } | null;
  cityName?: string;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const LocationMap: React.FC<LocationMapProps> = ({ location, cityName, t }) => {
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
            title={
              cityName ||
              t('search.currentLocation', { defaultValue: 'Current location' })
            }
            pinColor={cityName ? '#ef4444' : '#0ea5e9'}
          />
        )}
      </MapView>
    </View>
  );
};

// ============================================================================
// Footer Component
// ============================================================================

interface FilterPopoverFooterProps {
  onClearAll: () => void;
  onApply: () => void;
  bottomInset: number;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const FilterPopoverFooter: React.FC<FilterPopoverFooterProps> = ({
  onClearAll,
  onApply,
  bottomInset,
  t,
}) => (
  <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, 16) }]}>
    <TouchableOpacity style={styles.clearButton} onPress={onClearAll}>
      <SJText style={styles.clearButtonText}>
        {t('common.clearAll', { defaultValue: 'Clear All' })}
      </SJText>
    </TouchableOpacity>
    <TouchableOpacity style={styles.applyButton} onPress={onApply}>
      <SJText style={styles.applyButtonText}>
        {t('search.applyFilters', { defaultValue: 'Apply Filters' })}
      </SJText>
    </TouchableOpacity>
  </View>
);

// ============================================================================
// Main FilterPopover Component
// ============================================================================

const FilterPopover: React.FC<FilterPopoverProps> = ({
  visible,
  onClose,
  t,
}) => {
  const insets = useSafeAreaInsets();
  const { categories, loading: categoriesLoading } = useCategories();
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
  const { filters, updateFilters, setFilters, clearFilters } = useFilters();

  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [locationInputValue, setLocationInputValue] = useState<string>('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  useEffect(() => {
    if (visible) {
      // Ensure currency is synced from global filters
      console.log('[FilterPopover] Modal opened - filters.currency:', filters.currency, 'localFilters.currency:', localFilters.currency);
      setLocalFilters(filters);
      console.log('[FilterPopover] Modal opened with currency:', filters.currency);
      if (manualLocation?.cityName) {
        const city = cities.find((c) => c.id === manualLocation.cityId);
        setLocationInputValue(
          city ? `${city.name}, ${city.country}` : manualLocation.cityName
        );
      } else {
        setLocationInputValue('');
      }
    }
  }, [visible, filters, manualLocation, cities]);

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
    (city: City) => {
      const cityDisplayName = `${city.name}, ${city.country}`;
      setLocationInputValue(cityDisplayName);
      setShowCitySuggestions(false);
      setManualLocation({
        lat: city.center_lat,
        lng: city.center_lng,
        cityId: city.id,
        cityName: city.name,
      });
      // keyboard stays open – if you want to close it:
      // Keyboard.dismiss();
    },
    [setManualLocation]
  );

  const handleUseCurrentLocation = useCallback(async () => {
    await clearManualLocation();
    setLocationInputValue('');
    setShowCitySuggestions(false);
    if (!currentLocation) {
      await refreshLocation();
    }
  }, [currentLocation, refreshLocation, clearManualLocation]);

  const handleApply = useCallback(async () => {
    const loc = selectedLocation;
    const updatedFilters: FilterState = {
      ...localFilters,
      location: manualLocation?.cityName
        ? `${manualLocation.cityName}, ${
            cities.find((c) => c.id === manualLocation.cityId)?.country || ''
          }`.replace(/,\s*$/, '')
        : selectedLocation
        ? t('search.currentLocation', { defaultValue: 'Current location' })
        : null,
      locationLat: loc ? loc.lat : null,
      locationLng: loc ? loc.lng : null,
      locationCityId: manualLocation?.cityId || null,
    };
    console.log('[FilterPopover] Applying filters:', updatedFilters);
    
    try {
      await setFilters(updatedFilters);
      console.log('[FilterPopover] ✅ Filters applied and saved successfully');
    } catch (error) {
      console.error('[FilterPopover] ❌ Failed to save filters:', error);
      // Don't close modal if save failed - let user retry
      return;
    }
    
    onClose();
  }, [localFilters, selectedLocation, manualLocation, cities, setFilters, onClose, t]);

  const handleClearAll = useCallback(async () => {
    await clearFilters();
    setLocalFilters({
      priceMin: 0,
      priceMax: PRICE_MAX,
      currency: filters.currency, // Keep current currency
      categories: [],
      distance: null,
      location: null,
      locationLat: null,
      locationLng: null,
      locationCityId: null,
    });
    await clearManualLocation();
    setLocationInputValue('');
    setShowCitySuggestions(false);
  }, [clearFilters, clearManualLocation, filters.currency]);

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

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.popoverContainer}>
            <FilterPopoverHeader onClose={onClose} t={t} />

            <View style={styles.scrollWrapper}>
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator
                nestedScrollEnabled
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                removeClippedSubviews={false}
              >
                {/* Price Range */}
                <View style={styles.section}>
                  <SJText style={styles.sectionTitle}>
                    {t('search.priceRange', { defaultValue: 'Price Range' })}
                  </SJText>
                  <PriceRangeSlider
                    minValue={localFilters.priceMin}
                    maxValue={localFilters.priceMax}
                    currency={localFilters.currency}
                    onMinChange={(value) =>
                      setLocalFilters((prev) => {
                        const effectiveMax = prev.priceMax ?? PRICE_MAX;
                        return {
                          ...prev,
                          priceMin: Math.min(value, effectiveMax - 100),
                        };
                      })
                    }
                    onMaxChange={(value) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        priceMax: value,
                      }))
                    }
                    t={t}
                  />
                </View>

                {/* Categories */}
                <CategorySection
                  categories={categories}
                  selectedCategories={localFilters.categories}
                  onToggleCategory={(id) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      categories: prev.categories.includes(id)
                        ? prev.categories.filter((cid) => cid !== id)
                        : [...prev.categories, id],
                    }))
                  }
                  onSelectAll={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      categories: categories.map((c) => c.id),
                    }))
                  }
                  onClearAll={() =>
                    setLocalFilters((prev) => ({ ...prev, categories: [] }))
                  }
                  loading={categoriesLoading}
                  t={t}
                />

                {/* Distance */}
                <DistanceSection
                  selectedDistance={localFilters.distance}
                  onSelectDistance={(distance) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      distance: prev.distance === distance ? null : distance,
                    }))
                  }
                  t={t}
                />

                {/* Location */}
                <View style={styles.section}>
                  <SJText style={styles.sectionTitle}>
                    {t('search.location', { defaultValue: 'Location' })}
                  </SJText>
                  <LocationInput
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
                    // ⬇️ no-op: we hide suggestions only on clear / select
                    onBlur={() => {}}
                    onUseCurrentLocation={handleUseCurrentLocation}
                    placeholder={locationPlaceholder}
                    hasCurrentLocation={!!currentLocation}
                    showSuggestions={showCitySuggestions}
                    suggestions={filteredCities}
                    onSelectCity={handleCitySelect}
                    t={t}
                  />

                  <LocationMap
                    location={mapLocation}
                    cityName={manualLocation?.cityName}
                    t={t}
                  />
                </View>
              </ScrollView>
            </View>

            <FilterPopoverFooter
              onClearAll={handleClearAll}
              onApply={handleApply}
              bottomInset={insets.bottom}
              t={t}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  popoverContainer: {
    backgroundColor: colors.primaryDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.9,
    height: SCREEN_HEIGHT * 0.9,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollWrapper: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#e2e8f0',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  categoryChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#0ea5e9',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#0f172a',
  },
  categoryChipTextSelected: {
    color: '#0ea5e9',
    fontWeight: '500',
  },
  seeMoreButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  distanceOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distanceOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  distanceOptionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#0ea5e9',
  },
  distanceOptionText: {
    fontSize: 14,
    color: '#0f172a',
  },

  distanceOptionTextSelected: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  locationInputContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 14,
    color: '#0f172a',
    paddingRight: 32,
  },
  currentLocationButton: {
    position: 'absolute',
    right: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  citySuggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: 200,
    zIndex: 2000,
  },
  citySuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f5f9',
  },
  citySuggestionText: {
    flex: 1,
    marginLeft: 10,
  },
  citySuggestionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  citySuggestionCountry: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
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
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  mapPlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    gap: 12,
    backgroundColor: colors.primaryDark,
    flexShrink: 0,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primaryYellow,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  priceSliderContainer: {
    marginTop: 8,
  },
  priceDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceDisplay: {
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  sliderTrackContainer: {
    marginTop: 8,
  },
  sliderTrack: {
    height: 40,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderTrackBackground: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  sliderTrackFill: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#0ea5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default FilterPopover;