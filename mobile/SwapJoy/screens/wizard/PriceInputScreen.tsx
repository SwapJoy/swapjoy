import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import SJText from '../../components/SJText';
import PrimaryButton from '../../components/PrimaryButton';
import SWInputField from '../../components/SWInputField';
import { colors } from '@navigation/MainTabNavigator.styles';
import { useLocalization } from '../../localization';
import { getCurrencySymbol } from '../../utils';
import { PriceInputScreenProps } from '../../types/navigation';
import { useItemDetails } from '../../hooks/useItemDetails';

const PriceInputScreen: React.FC<PriceInputScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useLocalization();
  const { imageUris, failedUploads } = route.params;
  const hookData = useItemDetails({ imageUris, navigation, route });
  const { price, currency, setPrice, setCurrency } = hookData;

  const isValid = useMemo(() => {
    const priceNum = parseFloat(price);
    return !isNaN(priceNum) && priceNum > 0;
  }, [price]);

  const description = t('addItem.wizard.step5.description', {
    defaultValue: 'Enter the price for your item.',
  });

  const handleCurrencyToggle = () => {
    const currencyOrder = ['GEL', 'USD', 'EUR'];
    const currentIndex = currencyOrder.indexOf(currency);
    const nextIndex = (currentIndex + 1) % currencyOrder.length;
    setCurrency(currencyOrder[nextIndex]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <SJText style={styles.description}>{description}</SJText>

          <View style={styles.inputContainer}>
            <SWInputField
              placeholder={t('addItem.details.placeholders.value', { defaultValue: 'Price' })}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              required
              rightButton={
                <TouchableOpacity
                  style={styles.currencySwitcher}
                  onPress={handleCurrencyToggle}
                  activeOpacity={0.7}
                >
                  <SJText style={styles.currencySwitcherText}>
                    {currency === 'GEL' ? '🇬🇪' : currency === 'USD' ? '🇺🇸' : '🇪🇺'} {getCurrencySymbol(currency)}
                  </SJText>
                </TouchableOpacity>
              }
            />
          </View>
      </ScrollView>

      <PrimaryButton
        onPress={() => {
          navigation.navigate('LocationInput', { imageUris, failedUploads });
        }}
        disabled={!isValid}
        label={t('common.next', { defaultValue: 'Next' })}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  description: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    flex: 1,
  },
  currencySwitcher: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d1d6',
    flexDirection: 'row',
    gap: 4,
  },
  currencySwitcherText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PriceInputScreen;
