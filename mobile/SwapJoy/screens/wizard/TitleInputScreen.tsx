import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import SJText from '../../components/SJText';
import PrimaryButton from '../../components/PrimaryButton';
import ConditionChip from '../../components/ConditionChip';
import SWInputField from '../../components/SWInputField';
import { colors } from '@navigation/MainTabNavigator.styles';
import { useLocalization } from '../../localization';
import { TitleInputScreenProps } from '../../types/navigation';
import { useItemDetails } from '../../hooks/useItemDetails';

const TitleInputScreen: React.FC<TitleInputScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useLocalization();
  const { imageUris } = route.params;
  const hookData = useItemDetails({ imageUris, navigation, route });
  const { title, condition, setTitle, setCondition, conditionOptions } = hookData;

  const isValid = useMemo(() => {
    return title.trim().length >= 3;
  }, [title]);

  const description = t('addItem.wizard.step2.description', {
    defaultValue: 'Enter a title for your item and select its condition.',
  });

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
              label={t('addItem.details.labels.title', { defaultValue: 'Title' })}
              placeholder={t('addItem.details.placeholders.title', { defaultValue: 'Title' })}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              required
              autoFocus
              style={styles.titleInput}
            />
          </View>

          <View style={styles.conditionContainer}>
            <SJText style={styles.conditionLabel}>
              {t('addItem.details.labels.condition', { defaultValue: 'Condition' })}{' '}
              <SJText style={styles.required}>*</SJText>
            </SJText>
            <View style={styles.conditionChips}>
              {conditionOptions.map((cond: any) => (
                <ConditionChip
                  key={cond.value}
                  condition={cond.value}
                  selected={condition === cond.value}
                  onPress={() => setCondition(cond.value)}
                />
              ))}
            </View>
          </View>
      </ScrollView>

      <PrimaryButton
        onPress={() => {
          navigation.navigate('CategoryInput', { imageUris });
        }}
        disabled={!isValid || !condition}
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
    marginBottom: 32,
  },
  titleInput: {
    fontSize: 24,
  },
  conditionContainer: {
    marginTop: 16,
  },
  conditionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  required: {
    color: '#FF3B30',
  },
  conditionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

export default TitleInputScreen;
