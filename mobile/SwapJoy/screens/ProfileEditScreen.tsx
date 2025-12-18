import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, } from 'react-native';
import SJText from '../components/SJText';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@navigation/MainTabNavigator.styles';

import { ProfileEditScreenProps } from '../types/navigation';
import { useLocalization } from '../localization';
import { ApiService } from '../services/api';
import { UserService } from '../services/userService';
import { ImageUploadService } from '../services/imageUpload';

const AVATAR_SIZE = 120;
const BIO_MAX_LENGTH = 240;

const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ navigation, route }) => {
  const { t } = useLocalization();
  const initialProfile = route.params?.initialProfile;

  const [firstName, setFirstName] = useState(initialProfile?.firstName ?? '');
  const [lastName, setLastName] = useState(initialProfile?.lastName ?? '');
  const [username, setUsername] = useState(initialProfile?.username ?? '');
  const [bio, setBio] = useState(initialProfile?.bio ?? '');
  const [profileImageUrl, setProfileImageUrl] = useState(initialProfile?.profileImageUrl ?? '');

  const [loading, setLoading] = useState(!initialProfile);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: t('settings.profile.editProfileTitle') });
  }, [navigation, t]);

  const populateFields = useCallback((data: any) => {
    if (!data) {
      return;
    }
    setFirstName(data.first_name ?? '');
    setLastName(data.last_name ?? '');
    setUsername(data.username ?? '');
    setBio(data.bio ?? '');
    setProfileImageUrl(data.profile_image_url ?? '');
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ApiService.getProfile();
      const data = res?.data as any;
      populateFields(data);
    } catch (error) {
      console.error('[ProfileEdit] Failed to load profile:', error);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('settings.profile.editFormLoadError', {
          defaultValue: 'Could not load your profile. Please try again.',
        })
      );
    } finally {
      setLoading(false);
    }
  }, [populateFields, t]);

  useEffect(() => {
    if (!initialProfile) {
      void loadProfile();
    }
  }, [initialProfile, loadProfile]);

  const handlePickImage = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          t('settings.profile.editFormPhotoPermissionTitle', { defaultValue: 'Permission needed' }),
          t('settings.profile.editFormPhotoPermissionMessage', {
            defaultValue: 'Please allow photo library access to choose a profile picture.',
          })
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const uri = result.assets[0]?.uri;
      if (!uri) {
        return;
      }

      setUploadingPhoto(true);
      const uploadId = `profile-${Date.now()}`;
      const { url, error } = await ImageUploadService.uploadImage(uri, uploadId, 'profile');
      if (error || !url) {
        throw new Error(error || 'Upload failed');
      }
      setProfileImageUrl(url);
    } catch (error: any) {
      console.error('[ProfileEdit] Photo picker error:', error);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        error?.message ||
          t('settings.profile.editFormPhotoError', {
            defaultValue: 'Could not update profile photo. Please try again.',
          })
      );
    } finally {
      setUploadingPhoto(false);
    }
  }, [t]);

  const handleRemovePhoto = useCallback(() => {
    setProfileImageUrl('');
  }, []);

  const firstNameError = useMemo(() => {
    if (firstName.trim().length === 0) {
      return t('settings.profile.editFormFirstNameRequired', { defaultValue: 'First name is required.' });
    }
    return null;
  }, [firstName, t]);

  const handleSave = useCallback(async () => {
    if (firstNameError) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        firstNameError
      );
      return;
    }

    setSaving(true);
    try {
      const updates: Record<string, string | null> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        profile_image_url: profileImageUrl ? profileImageUrl : null,
      };

      const { error } = await UserService.updateProfile(updates);
      if (error) {
        throw new Error(error.message || 'Failed to update profile');
      }

      Alert.alert(
        t('settings.profile.editFormSuccessTitle', { defaultValue: 'Profile updated' }),
        t('settings.profile.editFormSuccessMessage', {
          defaultValue: 'Your profile has been saved successfully.',
        }),
        [
          {
            text: t('common.ok', { defaultValue: 'OK' }),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('[ProfileEdit] Save error:', error);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        error?.message ||
          t('settings.profile.editFormSaveError', {
            defaultValue: 'Could not save your profile. Please try again.',
          })
      );
    } finally {
      setSaving(false);
    }
  }, [bio, firstName, firstNameError, lastName, navigation, profileImageUrl, t, username]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1f7ae0" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera" size={32} color="#94a3b8" />
                <SJText style={styles.avatarPlaceholderText}>
                  {t('settings.profile.editFormPhotoPlaceholder', { defaultValue: 'Add photo' })}
                </SJText>
              </View>
            )}
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handlePickImage}
              disabled={uploadingPhoto || saving}
              activeOpacity={0.8}
            >
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="#1f7ae0" />
              ) : (
                <SJText style={styles.changePhotoText}>
                  {t('settings.profile.editFormChangePhoto', { defaultValue: 'Change photo' })}
                </SJText>
              )}
            </TouchableOpacity>
            {profileImageUrl ? (
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={handleRemovePhoto}
                disabled={saving}
              >
                <SJText style={styles.removePhotoText}>
                  {t('settings.profile.editFormRemovePhoto', { defaultValue: 'Remove photo' })}
                </SJText>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <SJText style={styles.fieldLabel}>
              {t('settings.profile.editFormFirstNameLabel', { defaultValue: 'First name' })}
            </SJText>
            <TextInput
              style={[styles.textInput, firstNameError ? styles.textInputError : null]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('settings.profile.editFormFirstNamePlaceholder', { defaultValue: 'Enter your first name' })}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldGroup}>
            <SJText style={styles.fieldLabel}>
              {t('settings.profile.editFormLastNameLabel', { defaultValue: 'Last name' })}
            </SJText>
            <TextInput
              style={styles.textInput}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t('settings.profile.editFormLastNamePlaceholder', { defaultValue: 'Enter your last name' })}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldGroup}>
            <SJText style={styles.fieldLabel}>
              {t('settings.profile.editFormUsernameLabel', { defaultValue: 'Username' })}
            </SJText>
            <TextInput
              style={styles.textInput}
              value={username}
              onChangeText={setUsername}
              placeholder={t('settings.profile.editFormUsernamePlaceholder', { defaultValue: 'Choose a username' })}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabelRow}>
              <SJText style={styles.fieldLabel}>
                {t('settings.profile.editFormBioLabel', { defaultValue: 'Bio' })}
              </SJText>
              <SJText style={styles.fieldHelper}>
                {bio.length}/{BIO_MAX_LENGTH}
              </SJText>
            </View>
            <TextInput
              style={[styles.textInput, styles.bioInput]}
              value={bio}
              onChangeText={(value) => {
                if (value.length <= BIO_MAX_LENGTH) {
                  setBio(value);
                }
              }}
              placeholder={t('settings.profile.editFormBioPlaceholder', { defaultValue: 'Tell others a bit about you' })}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, (saving || uploadingPhoto) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving || uploadingPhoto}
          activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.primaryDark} />
            ) : (
              <SJText style={styles.saveButtonText}>{t('common.save')}</SJText>
            )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarWrapper: {
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
    gap: 6,
  },
  avatarPlaceholderText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1f7ae0',
    backgroundColor: colors.primaryYellow,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#1f7ae0',
    fontWeight: '600',
  },
  removePhotoButton: {
    paddingVertical: 6,
  },
  removePhotoText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '500',
  },
  form: {
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    padding: 20,
    gap: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  fieldHelper: {
    fontSize: 12,
    color: '#94a3b8',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  textInputError: {
    borderColor: '#ef4444',
  },
  bioInput: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#1f7ae0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileEditScreen;
