import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { colors } from '@navigation/MainTabNavigator.styles';

interface FilterPriceScreenProps {
  minPrice: string;
  maxPrice: string;
  onChangeMinPrice: (value: string) => void;
  onChangeMaxPrice: (value: string) => void;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const FilterPriceScreen: React.FC<FilterPriceScreenProps> = ({
  minPrice,
  maxPrice,
  onChangeMinPrice,
  onChangeMaxPrice,
  t,
}) => {
  return (
    <View style={styles.container}>
      <BottomSheetTextInput
        value={minPrice}
        onChangeText={onChangeMinPrice}
        placeholder={t('search.filters.minimum')}
        placeholderTextColor={colors.inputPlaceholder}
        keyboardType="numeric"
        style={styles.input}
      />
      <BottomSheetTextInput
        value={maxPrice}
        onChangeText={onChangeMaxPrice}
        placeholder={t('search.filters.maximum')}
        placeholderTextColor={colors.inputPlaceholder}
        keyboardType="numeric"
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    color: colors.textColor,
    fontSize: 18,
    paddingHorizontal: 14
  },
});

export default FilterPriceScreen;

