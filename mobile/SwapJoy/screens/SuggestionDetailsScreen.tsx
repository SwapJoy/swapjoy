import React from 'react';
import {View, StyleSheet, FlatList, Image, TouchableOpacity} from 'react-native';
import { colors } from '@navigation/MainTabNavigator.styles';
import SJText from '../components/SJText';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { formatCurrency } from '../utils';

type RouteP = RouteProp<RootStackParamList, 'SuggestionDetails'>;

const SuggestionDetailsScreen: React.FC = () => {
  const route = useRoute<RouteP>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { items, signature, targetTitle } = route.params;

  const total = items.reduce((s, it) => s + (it.price || 0), 0);
  const currency = items[0]?.currency || 'USD';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SJText style={styles.title}>Bundle Details</SJText>
        {targetTitle ? <SJText style={styles.subtitle}>Target: {targetTitle}</SJText> : null}
        <SJText style={styles.subtitle}>Signature: {signature}</SJText>
        <SJText style={styles.total}>Total: {formatCurrency(total, currency)}</SJText>
      </View>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.image_url || 'https://via.placeholder.com/64' }} style={styles.thumb} />
            <View style={styles.info}>
              <SJText style={styles.itemTitle} numberOfLines={1}>{item.title || item.id}</SJText>
              <SJText style={styles.itemId}>{item.id}</SJText>
            </View>
            <SJText style={styles.itemPrice}>{formatCurrency(item.price || 0, item.currency || 'USD')}</SJText>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={{ padding: 12 }}
      />
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <SJText style={styles.closeText}>Close</SJText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryDark },
  header: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  title: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 12, color: '#707070', marginTop: 4 },
  total: { fontSize: 14, color: '#007AFF', fontWeight: '700', marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#eee' },
  thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#eee' },
  info: { flex: 1, marginLeft: 10 },
  itemTitle: { fontSize: 14, color: '#1a1a1a', fontWeight: '600' },
  itemId: { fontSize: 11, color: '#707070', marginTop: 2 },
  itemPrice: { fontSize: 14, color: '#007AFF', fontWeight: '700' },
  closeBtn: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#1f7ae0', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  closeText: { color: colors.primaryDark, fontWeight: '700' },
});

export default SuggestionDetailsScreen;


