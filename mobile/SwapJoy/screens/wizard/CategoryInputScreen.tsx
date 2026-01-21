import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import SJText from '../../components/SJText';
import PrimaryButton from '../../components/PrimaryButton';
import InlineCategorySelector from '../../components/wizard/InlineCategorySelector';
import { colors } from '@navigation/MainTabNavigator.styles';
import { useLocalization } from '../../localization';
import { CategoryInputScreenProps } from '../../types/navigation';
import { useItemDetails } from '../../hooks/useItemDetails';

const CategoryInputScreen: React.FC<CategoryInputScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useLocalization();
  const { imageUris } = route.params;
  const hookData = useItemDetails({ imageUris, navigation, route });
  const { category, setCategory } = hookData;

  const isValid = useMemo(() => {
    return category !== null;
  }, [category]);

  const description = t('addItem.wizard.step3.description', {
    defaultValue: 'Select a category for your item.',
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <SJText style={styles.description}>{description}</SJText>

          <View style={styles.selectorContainer}>
            <InlineCategorySelector
              selectedCategoryId={category}
              onSelectCategory={setCategory}
              t={t}
            />
          </View>
      </ScrollView>

      <PrimaryButton
        onPress={() => {
          navigation.navigate('DescInput', { imageUris });
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
    flexGrow: 1,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  selectorContainer: {
    flex: 1,
    minHeight: 300,
  },
});

export default CategoryInputScreen;
