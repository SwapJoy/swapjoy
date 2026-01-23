import { supabase } from '../lib/supabase';

export type ItemEventType =
  | 'impression'
  | 'view'
  | 'save'
  | 'message'
  | 'swap_request'
  | 'hide';

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function logItemEvent(
  itemId: string,
  eventType: ItemEventType,
  meta?: Record<string, any>
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.warn('[itemEvents] No authenticated user, skipping event log');
    return;
  }

  const { error } = await supabase.from('item_events').insert([
    {
      user_id: userId,
      item_id: itemId,
      event_type: eventType,
      meta: meta ?? null,
    },
  ]);

  if (error) {
    console.warn('[itemEvents] logItemEvent error', error);
  }
}

export async function logImpressionsBatch(itemIds: string[]) {
  if (!itemIds.length) return;
  
  const userId = await getCurrentUserId();
  if (!userId) {
    console.warn('[itemEvents] No authenticated user, skipping impressions batch');
    return;
  }

  const now = new Date().toISOString();

  const rows = itemIds.map(id => ({
    user_id: userId,
    item_id: id,
    event_type: 'impression' as ItemEventType,
    created_at: now,
  }));

  const { error } = await supabase.from('item_events').insert(rows);
  if (error) {
    console.warn('[itemEvents] logImpressionsBatch error', error);
  }
}

// Strong signals: also refresh user preference embedding

async function refreshPreferenceEmbedding() {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.warn('[itemEvents] No authenticated user, skipping preference embedding refresh');
    return;
  }

  try {
    console.log('[itemEvents] Calling refresh_user_preference_embedding for user:', userId);
    const { data, error } = await supabase.rpc('refresh_user_preference_embedding', {
      p_user_id: userId,
    });

    if (error) {
      console.error('[itemEvents] refresh_user_preference_embedding RPC error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    } else {
      console.log('[itemEvents] refresh_user_preference_embedding RPC succeeded');
    }
  } catch (err) {
    console.error('[itemEvents] refresh_user_preference_embedding exception:', err);
  }
}

export async function logView(itemId: string) {
  await logItemEvent(itemId, 'view');
}

export async function logSave(itemId: string) {
  await logItemEvent(itemId, 'save');
  // Fire and forget - don't await to avoid blocking UI
  refreshPreferenceEmbedding().catch((err) => {
    console.error('[itemEvents] Failed to refresh preference embedding after save:', err);
  });
}

export async function logMessage(itemId: string) {
  await logItemEvent(itemId, 'message');
  refreshPreferenceEmbedding().catch((err) => {
    console.error('[itemEvents] Failed to refresh preference embedding after message:', err);
  });
}

export async function logSwapRequest(itemId: string) {
  await logItemEvent(itemId, 'swap_request');
  refreshPreferenceEmbedding().catch((err) => {
    console.error('[itemEvents] Failed to refresh preference embedding after swap_request:', err);
  });
}

export async function logHide(itemId: string) {
  await logItemEvent(itemId, 'hide');
  refreshPreferenceEmbedding().catch((err) => {
    console.error('[itemEvents] Failed to refresh preference embedding after hide:', err);
  });
}
