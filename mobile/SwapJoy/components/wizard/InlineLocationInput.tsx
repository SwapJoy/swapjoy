import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SJText from '../SJText';
import SWInputField from '../SWInputField';
import { City } from '../../hooks/useLocation';
import { colors } from '@navigation/MainTabNavigator.styles';

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
        <Ionicons name="location" size={16} color={colors.primaryYellow} />
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
    <SWInputField
      value={value}
      onChangeText={onChangeText}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      leftButton={
        <Ionicons name="location-outline" size={18} color={colors.primaryYellow} />
      }
      rightButton={
        <TouchableOpacity
          onPress={onUseCurrentLocation}
          accessibilityLabel={t('search.useCurrentLocation', { defaultValue: 'Use current location' })}
        >
          <Ionicons name="navigate" size={18} color={hasCurrentLocation ? colors.primaryYellow : colors.inactive} />
        </TouchableOpacity>
      }
    />
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
  citySuggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryYellow,
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
    borderBottomColor: 'rgba(255, 222, 33, 0.2)',
  },
  citySuggestionText: {
    flex: 1,
    marginLeft: 10,
  },
  citySuggestionName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  citySuggestionCountry: {
    fontSize: 12,
    color: colors.inactive,
    marginTop: 2,
  },
});

export default InlineLocationInput;
