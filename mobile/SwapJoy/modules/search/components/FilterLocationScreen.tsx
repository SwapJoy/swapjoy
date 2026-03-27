import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import SJText from '../../../components/SJText';
import { City } from '../../../contexts/LocationContext';

interface FilterLocationScreenProps {
  cities: City[];
  selectedCityId: string | null;
  onSelectCityId: (cityId: string | null) => void;
}

const FilterLocationScreen: React.FC<FilterLocationScreenProps> = ({
  cities,
  selectedCityId,
  onSelectCityId,
}) => {
  const rows = [{ id: 'any', name: 'Any' }, ...cities.map((city) => ({ id: city.id, name: city.name }))];

  return (
    <FlatList
      data={rows}
      style={styles.list}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const selected = item.id === 'any' ? selectedCityId === null : selectedCityId === item.id;
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.row}
            onPress={() => onSelectCityId(item.id === 'any' ? null : item.id)}
          >
            <SJText style={styles.label}>{item.name}</SJText>
            <View style={[styles.radio, selected && styles.radioSelected]} />
          </TouchableOpacity>
        );
      }}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingBottom: 96,
  },
  row: {
    minHeight: 54,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 18,
    color: '#fff',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#8b8b8b',
  },
  radioSelected: {
    borderColor: '#2d8cff',
    backgroundColor: '#2d8cff',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#303030',
  },
});

export default FilterLocationScreen;

