import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@navigation/MainTabNavigator.styles';
import SJText from './SJText';
import { City } from '../contexts/LocationContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CitySelectorPopoverProps {
  visible: boolean;
  onClose: () => void;
  cities: City[];
  loading?: boolean;
  selectedCityId?: string | null;
  onSelectCity: (city: City) => void;
  anchorRef?: React.RefObject<View>;
}

const CitySelectorPopover: React.FC<CitySelectorPopoverProps> = ({
  visible,
  onClose,
  cities,
  loading = false,
  selectedCityId,
  onSelectCity,
  anchorRef,
}) => {
  const [anchorLayout, setAnchorLayout] = React.useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Measure anchor position when popover opens
  useEffect(() => {
    if (visible && anchorRef?.current) {
      anchorRef.current.measureInWindow((x, y, width, height) => {
        setAnchorLayout({ x, y, width, height });
      });
    }
  }, [visible, anchorRef]);

  const sortedCities = useMemo(() => {
    return [...cities].sort((a, b) => {
      // Sort by country first, then by city name
      if (a.country !== b.country) {
        return a.country.localeCompare(b.country);
      }
      return a.name.localeCompare(b.name);
    });
  }, [cities]);

  const handleSelectCity = useCallback(
    async (city: City) => {
      console.log('[CitySelectorPopover] handleSelectCity called', { city });
      await onSelectCity(city);
      onClose();
    },
    [onSelectCity, onClose]
  );

  const renderCityItem = useCallback(
    ({ item: city }: { item: City }) => {
      const isSelected = selectedCityId === city.id;
      const cityLabel = `${city.name}, ${city.country}`;
      
      return (
        <TouchableOpacity
          style={[styles.cityItem, isSelected && styles.cityItemSelected]}
          onPress={() => handleSelectCity(city)}
          activeOpacity={0.7}
        >
          <SJText style={[styles.cityText, isSelected && styles.cityTextSelected]} numberOfLines={1}>
            {cityLabel}
          </SJText>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color={colors.primaryYellow} style={styles.checkIcon} />
          )}
        </TouchableOpacity>
      );
    },
    [selectedCityId, handleSelectCity]
  );

  const keyExtractor = useCallback((item: City, index: number) => {
    return item.id || `city-${index}`;
  }, []);

  if (!visible) return null;

  const popoverStyle = anchorLayout
    ? {
        position: 'absolute' as const,
        top: anchorLayout.y + anchorLayout.height + 8,
        left: Math.max(8, Math.min(anchorLayout.x, SCREEN_WIDTH - 320)),
        width: 300,
      }
    : styles.popoverCentered;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.popover, popoverStyle]}
          onStartShouldSetResponder={() => true}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primaryYellow} />
            </View>
          ) : sortedCities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <SJText style={styles.emptyText}>No cities available</SJText>
            </View>
          ) : (
            <FlatList
              data={sortedCities}
              renderItem={renderCityItem}
              keyExtractor={keyExtractor}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={true}
              maxToRenderPerBatch={30}
              windowSize={10}
              initialNumToRender={30}
            />
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  popover: {
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: 400,
  },
  popoverCentered: {
    alignSelf: 'center',
    marginTop: 100,
    width: 300,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    maxHeight: 400,
  },
  listContent: {
    paddingVertical: 4,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  cityItemSelected: {
    backgroundColor: 'rgba(255, 222, 33, 0.1)',
  },
  cityText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.white,
    flex: 1,
  },
  cityTextSelected: {
    color: colors.primaryYellow,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 8,
  },
});

export default CitySelectorPopover;
