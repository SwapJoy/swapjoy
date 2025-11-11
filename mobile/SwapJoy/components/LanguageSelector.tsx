import React, { useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppLanguage, LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '../types/language';
import { useLocalization } from '../localization';

type LanguageSelectorVariant = 'compact' | 'list';

interface LanguageSelectorProps {
  selectedLanguage: AppLanguage;
  onSelect: (language: AppLanguage) => void | Promise<void>;
  variant?: LanguageSelectorVariant;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelect,
  variant = 'compact',
}) => {
  const { t } = useLocalization();
  const [isModalVisible, setModalVisible] = useState(false);

  const triggerLabel = useMemo(
    () => t('settings.languagePickerLabel', { defaultValue: 'Language' }),
    [t]
  );

  const modalTitle = useMemo(
    () => t('settings.languagePickerTitle', { defaultValue: 'Choose app language' }),
    [t]
  );

  const cancelLabel = useMemo(
    () => t('common.cancel', { defaultValue: 'Cancel' }),
    [t]
  );

  const handleSelect = (language: AppLanguage) => {
    setModalVisible(false);
    if (language !== selectedLanguage) {
      onSelect(language);
    }
  };

  const renderOption = ({ item }: { item: AppLanguage }) => {
    const isActive = item === selectedLanguage;
    return (
      <Pressable
        key={item}
        onPress={() => handleSelect(item)}
        style={[styles.optionRow, isActive && styles.optionRowActive]}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
      >
        <View style={styles.optionTextGroup}>
          <Text style={[styles.optionTitle, isActive && styles.optionTitleActive]}>
            {LANGUAGE_LABELS[item]}
          </Text>
          <Text style={styles.optionValue}>{item.toUpperCase()}</Text>
        </View>
        {isActive ? (
          <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
        ) : (
          <Ionicons name="ellipse-outline" size={20} color="#cbd5f5" />
        )}
      </Pressable>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.trigger,
          variant === 'list' ? styles.triggerFull : styles.triggerCompact,
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.82}
      >
        <View>
          <Text style={styles.triggerLabel}>{triggerLabel}</Text>
          <Text style={styles.triggerValue}>{LANGUAGE_LABELS[selectedLanguage]}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#1f2937" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={SUPPORTED_LANGUAGES}
              renderItem={renderOption}
              keyExtractor={(lang) => lang}
              contentContainerStyle={styles.optionList}
              ItemSeparatorComponent={() => <View style={styles.optionSeparator} />}
            />

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  triggerCompact: {
    minWidth: 160,
  },
  triggerFull: {
    width: '100%',
  },
  triggerLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  triggerValue: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  optionList: {
    paddingVertical: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  optionRowActive: {
    backgroundColor: '#eff6ff',
  },
  optionTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  optionTitleActive: {
    color: '#1d4ed8',
  },
  optionValue: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  optionSeparator: {
    height: 8,
  },
  modalCancelButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  modalCancelText: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
  },
});

export default LanguageSelector;




