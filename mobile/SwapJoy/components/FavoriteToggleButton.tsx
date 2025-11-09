import React, { memo, useCallback } from 'react';
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FavoriteItemInput, useFavorites } from '../contexts/FavoritesContext';

interface FavoriteToggleButtonProps {
  itemId: string;
  item?: FavoriteItemInput;
  size?: number;
  style?: StyleProp<ViewStyle>;
  activeColor?: string;
  inactiveColor?: string;
  backgroundColor?: string;
  activeBackgroundColor?: string;
  onToggle?: (isFavorite: boolean) => void;
}

const FavoriteToggleButton: React.FC<FavoriteToggleButtonProps> = ({
  itemId,
  item,
  size = 20,
  style,
  activeColor = '#ef4444',
  inactiveColor = '#1f2933',
  backgroundColor = '#ffffffdd',
  activeBackgroundColor = '#fee2e2',
  onToggle,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(itemId);

  const handlePress = useCallback(
    (event?: GestureResponderEvent) => {
      event?.stopPropagation?.();
      toggleFavorite(itemId, item);
      onToggle?.(!favorite);
    },
    [favorite, item, itemId, onToggle, toggleFavorite]
  );

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: favorite ? activeBackgroundColor : backgroundColor },
        style,
      ]}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <Ionicons
        name={favorite ? 'heart' : 'heart-outline'}
        size={size}
        color={favorite ? activeColor : inactiveColor}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(FavoriteToggleButton);


