import React, { useEffect } from 'react';
import {View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Image, Modal, KeyboardAvoidingView, } from 'react-native';
import SJText from '../components/SJText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ItemDetailsFormScreenProps } from '../types/navigation';
import { getCurrencySymbol } from '../utils';
import LocationSelector from '../components/LocationSelector';
import SWInputField from '../components/SWInputField';
import SWCategorySelector from '../components/SWCategorySelector';
import { useItemDetails } from '../hooks/useItemDetails';
import { colors } from '@navigation/MainTabNavigator.styles';

const ItemDetailsFormScreen: React.FC<ItemDetailsFormScreenProps> = ({
  navigation,
  route,
}) => {
  const { imageUris } = route.params;

  const {
    // State
    images,
          title,
          description,
    category,
          condition,
    price,
    currency,
    showLocationSelector,
    locationLabel,
    locationCoords,
    resolvingLocation,
    showCategoryPicker,
    uploading,
    uploadProgress,
    analyzing,
    loadingCategories,
    categories,
    // Computed values
    strings,
    uploadingText,
    conditionOptions,
    currencyOptions,
    // Handlers
    setTitle,
    setDescription,
    setCategory,
    setCondition,
    setCurrency,
    setPrice,
    setShowLocationSelector,
    setShowCategoryPicker,
    handleLocationSelected,
    handleRemoveImage,
    handleNext,
    handleBack,
    handleCategorySelected,
    // Helpers
    getCategoryName,
    getConditionLabel,
    getOverallProgress,
  } = useItemDetails({ imageUris, navigation, route });

  if (loadingCategories) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <SJText style={styles.loadingText}>{strings.loading}</SJText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <SJText style={styles.headerTitle}>{strings.headerTitle}</SJText>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Upload Progress */}
          {uploading && (
            <View style={styles.uploadProgressContainer}>
              <View style={styles.progressHeader}>
                <Ionicons name="cloud-upload" size={20} color="#fff" />
                <SJText style={styles.uploadProgressText}>
                  {uploadingText(getOverallProgress())}
                </SJText>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${getOverallProgress()}%` }]}
                />
              </View>
            </View>
          )}

          {/* Image Thumbnails */}
          <View style={styles.imagePreviewContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagePreviewList}
            >
              {images.map((img, index) => (
                <View key={img.id} style={styles.imagePreview}>
                  <Image source={{ uri: img.uri }} style={styles.imagePreviewImage} />
                  <TouchableOpacity
                    style={styles.imageRemoveButton}
                    onPress={() => handleRemoveImage(img.id)}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  >
                    <View style={styles.imageRemoveCircle}>
                      <Ionicons name="close" size={12} color="#161200" />
                    </View>
                  </TouchableOpacity>
                  {!img.uploaded && (
                    <View style={styles.imageUploadingOverlay}>
                      <ActivityIndicator size="small" color="#161200" />
                    </View>
                  )}
                  {img.uploaded && (
                    <View style={styles.imageUploadedBadge}>
                      <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Title */}
            <SWInputField
              placeholder="Title: i.e. iPhone 16 Pro max black"
                value={title}
              onChangeText={setTitle}
                maxLength={100}
              disabled={analyzing}
              showLoading={analyzing}
              required
            />

            {/* Category */}
            <SWCategorySelector
              placeholder="Category"
              value={category}
              displayValue={getCategoryName()}
              onPress={() => {
                if (!analyzing) {
                  navigation.navigate('CategorySelector', {
                    multiselect: false,
                    selectedCategories: category ? [category] : [],
                    updateProfile: false,
                    onCategorySelected: handleCategorySelected,
                  });
                }
              }}
              disabled={analyzing}
              showLoading={analyzing}
              required
            />

            {/* Description */}
            <SWInputField
              placeholder="Description: Describe your item in detail"
                value={description}
              onChangeText={setDescription}
                maxLength={1000}
              multiline
              required
            />

            {/* Condition */}
            <View style={styles.fieldContainerWithLabel}>
              {strings.labels.condition && (
                <View style={styles.floatingLabelContainer}>
                  <SJText style={styles.floatingLabelText}>
                {strings.labels.condition} <SJText style={styles.required}>*</SJText>
              </SJText>
            </View>
              )}
              <View style={styles.inlineSelectionContainer}>
                {conditionOptions.map((cond) => (
              <TouchableOpacity
                    key={cond.value}
                    style={[
                      styles.inlineSelectionButton,
                      condition === cond.value && styles.inlineSelectionButtonSelected,
                    ]}
                    onPress={() => setCondition(cond.value)}
                  >
                    <Ionicons
                      name={cond.icon as any}
                      size={16}
                      color={condition === cond.value ? '#fff' : '#666'}
                      style={styles.inlineSelectionIcon}
                    />
                    <SJText
                      style={[
                        styles.inlineSelectionText,
                        condition === cond.value && styles.inlineSelectionTextSelected,
                      ]}
                    >
                      {cond.label}
                </SJText>
              </TouchableOpacity>
                ))}
              </View>
              <View style={styles.bottomBorderInline} />
            </View>

            {/* Price */}
            <SWInputField
              placeholder="Price"
                  value={price}
              onChangeText={setPrice}
                  keyboardType="decimal-pad"
              required
              rightButton={
              <TouchableOpacity
                  style={styles.currencySwitcher}
                  onPress={() => {
                    const currencyOrder = ['GEL', 'USD', 'EUR'];
                    const currentIndex = currencyOrder.indexOf(currency);
                    const nextIndex = (currentIndex + 1) % currencyOrder.length;
                    setCurrency(currencyOrder[nextIndex]);
                  }}
                  activeOpacity={0.7}
                >
                  <SJText style={styles.currencySwitcherText}>
                    {currency === 'GEL' ? '🇬🇪' : currency === 'USD' ? '🇺🇸' : '🇪🇺'} {getCurrencySymbol(currency)}
                </SJText>
              </TouchableOpacity>
              }
            />

            {/* Location */}
            <SWCategorySelector
              placeholder={strings.labels.location}
              value={locationLabel}
              displayValue={locationLabel || undefined}
              onPress={() => setShowLocationSelector(true)}
              required
            />
            {resolvingLocation ?? (
                <SJText style={styles.locationStatus}>{strings.location.resolving}</SJText>
            )}
          </View>
        </ScrollView>

        {/* Next Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              (uploading || images.length === 0) && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={uploading || images.length === 0}
          >
            <SJText style={[
              styles.nextButtonText,
              (uploading || images.length === 0) && styles.nextButtonTextDisabled
            ]}>
              {strings.buttons.next}
            </SJText>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={(uploading || images.length === 0) ? '#999' : '#161200'} 
            />
          </TouchableOpacity>
        </View>

        <LocationSelector
          visible={showLocationSelector}
          onClose={() => setShowLocationSelector(false)}
          onSelectLocation={handleLocationSelected}
          mode="item"
        />

        {/* Category Picker Modal */}
        <Modal
          visible={showCategoryPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <SJText style={styles.modalTitle}>{strings.modals.selectCategory}</SJText>
                <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.modalItem,
                      category === cat.id && styles.modalItemSelected,
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <SJText style={styles.modalItemText}>{cat.name}</SJText>
                    {category === cat.id && (
                      <Ionicons name="checkmark" size={24} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: colors.primaryYellow,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Platform.OS === 'ios' ? -4 : 0,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    height: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 80,
    justifyContent: 'flex-end',
  },
  savingText: {
    fontSize: 12
  },
  scrollView: {
    flex: 1,
  },
  uploadProgressContainer: {
    backgroundColor: '#161200',
    padding: 16,
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  uploadProgressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryYellow,
  },
  imagePreviewContainer: {
    backgroundColor: '#161200',
    paddingVertical: 16,
    paddingLeft: 16,
    marginBottom: 8,
    overflow: 'visible',
  },
  imagePreviewList: {
    paddingRight: 16,
    overflow: 'visible',
  },
  imagePreview: {
    marginRight: 12,
    position: 'relative',
    overflow: 'visible',
  },
  imagePreviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  imageUploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  imageRemoveCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  imageUploadedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  formContainer: {
    backgroundColor: '#161200',
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  fieldLoadingIndicator: {
    marginLeft: 8,
  },
  required: {
    color: '#FF3B30',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#161200',
  },
  textInputDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'right',
    marginTop: 4,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#161200',
  },
  pickerButtonDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  placeholder: {
    color: '#8e8e93',
  },
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
  },
  valueInput: {
    flex: 1,
  },
  locationStatus: {
    marginTop: 6,
    fontSize: 12,
    color: '#0ea5e9',
  },
  locationCoordinates: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748b',
  },
  footer: {
    padding: 16,
    backgroundColor: '#161200',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primaryYellow,
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  nextButtonTextDisabled: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#161200',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemSelected: {
    backgroundColor: '#f0f7ff',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  inlineSelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 0,
    paddingTop: 8,
  },
  inlineSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d1d6',
    backgroundColor: colors.primaryYellow,
  },
  inlineSelectionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  inlineSelectionIcon: {
    marginRight: 6,
  },
  inlineSelectionText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  inlineSelectionTextSelected: {
    color: '#161200',
  },
  fieldContainerWithLabel: {
    marginBottom: 24,
    position: 'relative',
    paddingTop: 20,
    paddingBottom: 8,
  },
  floatingLabelContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  floatingLabelText: {
    fontSize: 12,
    fontWeight: '600'
  },
  bottomBorderInline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#d1d1d6',
  },
  currencySwitcher: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primary,
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

export default ItemDetailsFormScreen;

