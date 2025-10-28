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
      return drafts.find((d) => d.id === draftId) || null;
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
      return drafts.filter(this.validateDraft);
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

      const updatedDraft = { ...draft, ...updates };
      await this.saveDraft(updatedDraft);
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

