import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SJText from '../SJText';
import { City } from '../../hooks/useLocation';

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

interface InlineLocationInputProps {
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

const InlineLocationInput: React.FC<InlineLocationInputProps> = ({
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

const styles = StyleSheet.create({
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
});

export default InlineLocationInput;
