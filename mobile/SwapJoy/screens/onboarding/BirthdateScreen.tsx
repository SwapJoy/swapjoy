import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../hooks/useOnboarding';
import { ApiService } from '../../services/api';
import { useLocalization } from '../../localization';
import { useAuth } from '../../contexts/AuthContext';

const BirthdateScreen: React.FC = () => {
  const { nextStep, previousStep, skipOnboarding, isFirstStep } = useOnboarding();
  const currentStepIndex = 2; // Birthdate is step 3
  const { user } = useAuth();
  const { t } = useLocalization();
  const [birthDate, setBirthDate] = useState<Date>(new Date(2000, 0, 1)); // Default to Jan 1, 2000
  const [showPicker, setShowPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing birthdate if available
  useEffect(() => {
    const loadBirthdate = async () => {
      if (user) {
        try {
          const { data: profile } = await ApiService.getProfile();
          if (profile?.birth_date) {
            const date = new Date(profile.birth_date);
            setBirthDate(date);
          }
        } catch (error) {
          console.error('[BirthdateScreen] Error loading birthdate:', error);
        }
      }
    };
    loadBirthdate();
  }, [user]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleDateChange = async (event: any, selectedDate?: Date) => {
    // On Android, the picker closes automatically when user selects a date
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    // On iOS, we only save when user taps "Done", but update the local state immediately
    if (selectedDate) {
      setBirthDate(selectedDate);
      
      // On Android, save immediately when date is selected
      // On iOS, save when user taps "Done" (which closes the modal)
      if (Platform.OS === 'android') {
        setIsSaving(true);
        try {
          const dateString = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          await ApiService.updateProfile({ birth_date: dateString });
        } catch (error) {
          console.error('[BirthdateScreen] Error saving birthdate:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleClosePicker = async () => {
    // On iOS, save when user taps "Done"
    if (Platform.OS === 'ios' && birthDate) {
      setIsSaving(true);
      try {
        const dateString = birthDate.toISOString().split('T')[0];
        await ApiService.updateProfile({ birth_date: dateString });
      } catch (error) {
        console.error('[BirthdateScreen] Error saving birthdate:', error);
      } finally {
        setIsSaving(false);
      }
    }
    setShowPicker(false);
  };

  const handleOpenPicker = () => {
    setShowPicker(true);
  };

  const handleNext = () => {
    nextStep();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            {!isFirstStep && (
              <TouchableOpacity onPress={previousStep} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
            )}
            <View style={styles.headerContent}>
              <Text style={styles.stepIndicator}>Step {currentStepIndex + 1} of 6</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>
              {t('onboarding.birthdate.title', { defaultValue: 'When Were You Born?' })}
            </Text>
            <Text style={styles.description}>
              {t('onboarding.birthdate.description', { defaultValue: 'This helps us personalize your experience and verify age requirements.' })}
            </Text>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={handleOpenPicker}
            >
              <Ionicons name="calendar-outline" size={24} color="#007AFF" />
              <View style={styles.dateButtonContent}>
                <Text style={styles.dateButtonLabel}>
                  {t('onboarding.birthdate.label', { defaultValue: 'Birthdate' })}
                </Text>
                <Text style={styles.dateButtonText}>
                  {formatDate(birthDate)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            {/* Date Picker */}
            {Platform.OS === 'ios' ? (
              <Modal
                visible={showPicker}
                transparent
                animationType="slide"
                onRequestClose={handleClosePicker}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>
                        {t('onboarding.birthdate.selectDate', { defaultValue: 'Select Birthdate' })}
                      </Text>
                      <TouchableOpacity
                        onPress={handleClosePicker}
                        style={styles.modalCloseButton}
                      >
                        <Text style={styles.modalCloseText}>
                          {t('onboarding.common.done', { defaultValue: 'Done' })}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={birthDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      minimumDate={new Date(1900, 0, 1)}
                      textColor="#000"
                      themeVariant="light"
                      style={styles.iosPicker}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              showPicker && (
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )
            )}

            {isSaving && (
              <View style={styles.savingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.savingText}>
                  {t('onboarding.common.saving', { defaultValue: 'Saving...' })}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipOnboarding}
          >
            <Text style={styles.skipButtonText}>
              {t('onboarding.common.skip', { defaultValue: 'Skip' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {t('onboarding.common.next', { defaultValue: 'Next' })}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8F8F8',
    gap: 12,
    marginBottom: 16,
  },
  dateButtonContent: {
    flex: 1,
  },
  dateButtonLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalCloseButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  iosPicker: {
    height: 200,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  savingText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default BirthdateScreen;

