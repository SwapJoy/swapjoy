import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@navigation/MainTabNavigator.styles';
import CachedImage from './CachedImage';
import SJText from './SJText';
import { formatCurrency } from '../utils';
import { getItemImageUri } from '../utils/imageUtils';

interface OfferItemComponentProps {
  item: any;
  kicker?: string;
  subtitle?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const OfferItemComponent: React.FC<OfferItemComponentProps> = ({
  item,
  kicker,
  subtitle,
  containerStyle,
}) => {
  const imageUri = useMemo(
    () =>
      getItemImageUri(item, 'https://via.placeholder.com/200x150') || 'https://via.placeholder.com/200x150',
    [item],
  );

  const subtitleText = useMemo(() => {
    if (subtitle && subtitle.trim().length > 0) {
      return subtitle;
    }
    if (item?.description && String(item.description).trim().length > 0) {
      return String(item.description);
    }
    return '—';
  }, [subtitle, item?.description]);

  return (
    <View style={[styles.card, containerStyle]}>
      <CachedImage
        uri={imageUri}
        style={styles.image}
        resizeMode="cover"
        fallbackUri="https://picsum.photos/200/150?random=6"
        showLoader={false}
        defaultSource={require('../assets/icon.png')}
      />

      <View style={styles.body}>
        {kicker ? <SJText style={styles.kicker}>{kicker}</SJText> : null}

        <SJText style={styles.title} numberOfLines={1}>
          {item?.title || '—'}
        </SJText>

        <SJText style={styles.subtitle} numberOfLines={2}>
          {subtitleText}
        </SJText>

        <View style={styles.metaRow}>
          <SJText style={styles.price}>
            {formatCurrency(item?.price || 0, item?.currency || 'USD')}
          </SJText>
          {item?.condition ? <SJText style={styles.condition}>• {item.condition}</SJText> : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2f2f2f',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: 126,
    height: 126,
    backgroundColor: '#2a2a2a',
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#9f9f9f',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryYellow,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#9a9a9a',
    lineHeight: 16,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryYellow,
  },
  condition: {
    fontSize: 12,
    color: '#a2a2a2',
    marginLeft: 6,
  },
});

export default OfferItemComponent;
