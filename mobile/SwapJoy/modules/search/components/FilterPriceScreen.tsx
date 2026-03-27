import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

interface FilterPriceScreenProps {
  minPrice: string;
  maxPrice: string;
  onChangeMinPrice: (value: string) => void;
  onChangeMaxPrice: (value: string) => void;
}

const FilterPriceScreen: React.FC<FilterPriceScreenProps> = ({
  minPrice,
  maxPrice,
  onChangeMinPrice,
  onChangeMaxPrice,
}) => {
  return (
    <View style={styles.container}>
      <BottomSheetTextInput
        value={minPrice}
        onChangeText={onChangeMinPrice}
        placeholder="Minimum"
        placeholderTextColor="#8b8b8b"
        keyboardType="numeric"
        style={styles.input}
      />
      <BottomSheetTextInput
        value={maxPrice}
        onChangeText={onChangeMaxPrice}
        placeholder="Maximum"
        placeholderTextColor="#8b8b8b"
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
    borderColor: '#3c3c3c',
    borderRadius: 10,
    color: '#fff',
    fontSize: 18,
    paddingHorizontal: 14,
    backgroundColor: '#1f1f1f',
  },
});

export default FilterPriceScreen;

