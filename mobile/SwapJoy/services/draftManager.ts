import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItemDraft, DraftImage } from '../types/item';
import { v4 as uuidv4 } from 'uuid';

const DRAFT_STORAGE_KEY = '@swapjoy_drafts';

export class DraftManager {
  /**
   * Create a new draft
   */
  static async createDraft(imageUris: string[]): Promise<ItemDraft> {
    const draftId = uuidv4();
    const now = new Date().toISOString();

    const images: DraftImage[] = imageUris.map((uri, index) => ({
      id: uuidv4(),
      uri,
      uploaded: false,
      uploadProgress: 0,
    }));

    const draft: ItemDraft = {
      id: draftId,
      title: '',
      description: '',
      category_id: null,
      condition: null,
      price: '',
      currency: 'USD',
      location_lat: null,
      location_lng: null,
      location_label: null,
      images,
      created_at: now,
      updated_at: now,
    };

    await this.saveDraft(draft);
    return draft;
  }

  /**
   * Save draft to AsyncStorage
   */
  static async saveDraft(draft: ItemDraft): Promise<void> {
    try {
      draft.updated_at = new Date().toISOString();
      const drafts = await this.getAllDrafts();
      const index = drafts.findIndex((d) => d.id === draft.id);

      if (index >= 0) {
        drafts[index] = draft;
      } else {
        drafts.push(draft);
      }

      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
    } catch (error) {
      console.error('Error saving draft:', error);
      throw new Error('Failed to save draft');
    }
  }

  /**
   * Get draft by ID
   */
  static async getDraft(draftId: string): Promise<ItemDraft | null> {
    try {
      const drafts = await this.getAllDrafts();
      const draft = drafts.find((d) => d.id === draftId) || null;
      return draft ? this.ensureLocationDefaults(draft) : null;
    } catch (error) {
      console.error('Error getting draft:', error);
      return null;
    }
  }

  /**
   * Get all drafts
   */
  static async getAllDrafts(): Promise<ItemDraft[]> {
    try {
      const data = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (!data) return [];

      const drafts = JSON.parse(data) as ItemDraft[];
      // Validate schema
      return drafts.filter(this.validateDraft).map((draft) => this.ensureLocationDefaults(draft));
    } catch (error) {
      console.error('Error getting all drafts:', error);
      return [];
    }
  }

  /**
   * Update draft fields
   */
  static async updateDraft(
    draftId: string,
    updates: Partial<ItemDraft>
  ): Promise<ItemDraft | null> {
    try {
      const draft = await this.getDraft(draftId);
      if (!draft) {
        throw new Error('Draft not found');
      }

      console.log('[DraftManager] Updating draft:', draftId, 'with updates:', JSON.stringify(updates));
      const updatedDraft = this.ensureLocationDefaults({ ...draft, ...updates });
      console.log('[DraftManager] Updated draft category_id:', updatedDraft.category_id);
      await this.saveDraft(updatedDraft);
      
      // Verify it was saved
      const verified = await this.getDraft(draftId);
      console.log('[DraftManager] Verified saved draft category_id:', verified?.category_id);
      
      return updatedDraft;
    } catch (error) {
      console.error('Error updating draft:', error);
      return null;
    }
  }

  /**
   * Update image in draft
   */
  static async updateDraftImage(
    draftId: string,
    imageId: string,
    updates: Partial<DraftImage>
  ): Promise<void> {
    try {
      const draft = await this.getDraft(draftId);
      if (!draft) {
        throw new Error('Draft not found');
      }

      const imageIndex = draft.images.findIndex((img) => img.id === imageId);
      if (imageIndex === -1) {
        throw new Error('Image not found in draft');
      }

      draft.images[imageIndex] = { ...draft.images[imageIndex], ...updates };
      await this.saveDraft(draft);
    } catch (error) {
      console.error('Error updating draft image:', error);
      throw error;
    }
  }

  /**
   * Remove image from draft
   */
  static async removeDraftImage(
    draftId: string,
    imageId: string
  ): Promise<ItemDraft | null> {
    try {
      const draft = await this.getDraft(draftId);
      if (!draft) {
        throw new Error('Draft not found');
      }

      const updatedImages = draft.images.filter((img) => img.id !== imageId);
      if (updatedImages.length === draft.images.length) {
        throw new Error('Image not found in draft');
      }

      const updatedDraft = { ...draft, images: updatedImages };
      await this.saveDraft(updatedDraft);
      return updatedDraft;
    } catch (error) {
      console.error('Error removing draft image:', error);
      return null;
    }
  }

  /**
   * Delete draft
   */
  static async deleteDraft(draftId: string): Promise<void> {
    try {
      const drafts = await this.getAllDrafts();
      const filtered = drafts.filter((d) => d.id !== draftId);
      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting draft:', error);
      throw new Error('Failed to delete draft');
    }
  }

  /**
   * Delete all drafts (for cleanup)
   */
  static async deleteAllDrafts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error('Error deleting all drafts:', error);
      throw new Error('Failed to delete all drafts');
    }
  }

  /**
   * Validate draft schema
   */
  private static validateDraft(draft: any): draft is ItemDraft {
    return (
      draft &&
      typeof draft.id === 'string' &&
      typeof draft.title === 'string' &&
      typeof draft.description === 'string' &&
      typeof draft.currency === 'string' &&
      Array.isArray(draft.images) &&
      typeof draft.created_at === 'string' &&
      typeof draft.updated_at === 'string'
    );
  }

  private static ensureLocationDefaults(draft: ItemDraft): ItemDraft {
    return {
      ...draft,
      location_lat:
        typeof draft.location_lat === 'number' && Number.isFinite(draft.location_lat)
          ? draft.location_lat
          : null,
      location_lng:
        typeof draft.location_lng === 'number' && Number.isFinite(draft.location_lng)
          ? draft.location_lng
          : null,
      location_label:
        typeof draft.location_label === 'string' && draft.location_label.length > 0
          ? draft.location_label
          : null,
    };
  }

  /**
   * Check if draft is ready for submission
   */
  static isDraftComplete(draft: ItemDraft): boolean {
    return (
      draft.title.trim().length > 0 &&
      draft.description.trim().length > 0 &&
      draft.category_id !== null &&
      draft.condition !== null &&
      draft.price.trim().length > 0 &&
      draft.location_lat !== null &&
      draft.location_lng !== null &&
      draft.images.length > 0 &&
      draft.images.every((img) => img.uploaded)
    );
  }

  /**
   * Get draft completion percentage
   */
  static getDraftCompletionPercentage(draft: ItemDraft): number {
    let completed = 0;
    const total = 6; // title, description, category, condition, value, images

    if (draft.title.trim().length > 0) completed++;
    if (draft.description.trim().length > 0) completed++;
    if (draft.category_id !== null) completed++;
    if (draft.condition !== null) completed++;
    if (draft.price.trim().length > 0) completed++;
    if (draft.images.length > 0 && draft.images.every((img) => img.uploaded)) completed++;

    return Math.round((completed / total) * 100);
  }
}

