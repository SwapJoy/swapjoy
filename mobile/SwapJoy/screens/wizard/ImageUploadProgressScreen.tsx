import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SJText from '../../components/SJText';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '@navigation/MainTabNavigator.styles';
import { useLocalization } from '../../localization';
import { ImageUploadProgressScreenProps } from '../../types/navigation';
import { useItemDetails } from '../../hooks/useItemDetails';
import { useWizardForm } from '../../contexts/WizardFormContext';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 64) / 3; // 3 columns with padding

const ImageUploadProgressScreen: React.FC<ImageUploadProgressScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useLocalization();
  const { imageUris } = route.params;
  const { resetFormData } = useWizardForm();
  const hookData = useItemDetails({ imageUris, navigation, route });
  const { images, uploading, uploadProgress, handleRemoveImage, getOverallProgress } = hookData;

  // Reset form data when starting a new wizard flow
  useEffect(() => {
    resetFormData();
  }, [resetFormData]);

  const allUploaded = useMemo(() => {
    return images.length > 0 && images.every((img: any) => img.uploaded && img.supabaseUrl);
  }, [images]);

  const description = t('addItem.wizard.step1.description', {
    defaultValue: 'Your images are being uploaded. Please wait until all uploads are complete.',
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SJText style={styles.description}>{description}</SJText>

        {uploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${getOverallProgress()}%` }]}
              />
            </View>
            <SJText style={styles.progressText}>
              {getOverallProgress()}% {t('addItem.wizard.step1.uploading', { defaultValue: 'uploaded' })}
            </SJText>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        >
          {images.map((img: any) => (
            <View key={img.id} style={styles.imageWrapper}>
              <Image source={{ uri: img.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveImage(img.id)}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <View style={styles.removeCircle}>
                  <Ionicons name="close" size={12} color={colors.primaryDark} />
                </View>
              </TouchableOpacity>
              {!img.uploaded && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color={colors.primaryDark} />
                  {uploadProgress[img.id] !== undefined && (
                    <SJText style={styles.uploadProgressText}>
                      {uploadProgress[img.id]}%
                    </SJText>
                  )}
                </View>
              )}
              {img.uploaded && (
                <View style={styles.uploadedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      <PrimaryButton
        onPress={() => {
          navigation.navigate('TitleInput', { imageUris });
        }}
        disabled={!allUploaded}
        label={t('common.next', { defaultValue: 'Next' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryYellow,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  removeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadProgressText: {
    marginTop: 4,
    fontSize: 10,
    color: '#fff',
  },
  uploadedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
});

export default ImageUploadProgressScreen;
