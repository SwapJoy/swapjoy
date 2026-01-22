import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import SJText from '../../components/SJText';
import PrimaryButton from '../../components/PrimaryButton';
import SWInputField from '../../components/SWInputField';
import { colors } from '@navigation/MainTabNavigator.styles';
import { useLocalization } from '../../localization';
import { DescInputScreenProps } from '../../types/navigation';
import { useItemDetails } from '../../hooks/useItemDetails';

const DescInputScreen: React.FC<DescInputScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useLocalization();
  const { imageUris, failedUploads } = route.params;
  const hookData = useItemDetails({ imageUris, navigation, route });
  const { description, setDescription } = hookData;

  const isValid = useMemo(() => {
    return description.trim().length > 0;
  }, [description]);

  const descriptionText = t('addItem.wizard.step4.description', {
    defaultValue: 'Describe your item in detail.',
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <SJText style={styles.description}>{descriptionText}</SJText>

          <View style={styles.inputContainer}>
            <SWInputField
              placeholder={t('addItem.details.placeholders.description', { defaultValue: 'Description' })}
              value={description}
              onChangeText={setDescription}
              maxLength={1000}
              multiline
              required
            />
          </View>
      </ScrollView>

      <PrimaryButton
        onPress={() => {
          navigation.navigate('PriceInput', { imageUris, failedUploads });
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
});

export default DescInputScreen;
