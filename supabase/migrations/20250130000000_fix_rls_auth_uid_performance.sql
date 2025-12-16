-- Fix RLS policy performance by caching auth.uid() calls
-- This migration replaces all direct auth.uid() calls with (select auth.uid())
-- to cache the value once per query instead of evaluating it for every row
-- 
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- ============================================
-- CHAT_MESSAGES policies
-- ============================================

DROP POLICY IF EXISTS "Chat messages - participants can insert" ON public.chat_messages;
CREATE POLICY "Chat messages - participants can insert" ON public.chat_messages
  FOR INSERT
  TO public
  WITH CHECK (
    ((select auth.uid()) IS NOT NULL) 
    AND ((select auth.uid()) = sender_id) 
    AND (EXISTS (
      SELECT 1
      FROM chats c
      WHERE c.id = chat_messages.chat_id 
        AND ((c.buyer_id = (select auth.uid())) OR (c.seller_id = (select auth.uid())))
    ))
  );

DROP POLICY IF EXISTS "Chat messages - participants can select" ON public.chat_messages;
CREATE POLICY "Chat messages - participants can select" ON public.chat_messages
  FOR SELECT
  TO public
  USING (
    ((select auth.uid()) IS NOT NULL) 
    AND (EXISTS (
      SELECT 1
      FROM chats c
      WHERE c.id = chat_messages.chat_id 
        AND ((c.buyer_id = (select auth.uid())) OR (c.seller_id = (select auth.uid())))
    ))
  );

DROP POLICY IF EXISTS "Chat messages - participants can update" ON public.chat_messages;
CREATE POLICY "Chat messages - participants can update" ON public.chat_messages
  FOR UPDATE
  TO public
  USING (
    ((select auth.uid()) IS NOT NULL) 
    AND (EXISTS (
      SELECT 1
      FROM chats c
      WHERE c.id = chat_messages.chat_id 
        AND ((c.buyer_id = (select auth.uid())) OR (c.seller_id = (select auth.uid())))
    ))
  )
  WITH CHECK (
    ((select auth.uid()) IS NOT NULL) 
    AND (EXISTS (
      SELECT 1
      FROM chats c
      WHERE c.id = chat_messages.chat_id 
        AND ((c.buyer_id = (select auth.uid())) OR (c.seller_id = (select auth.uid())))
    ))
  );

-- ============================================
-- CHATS policies
-- ============================================

DROP POLICY IF EXISTS "Chats - participants can insert" ON public.chats;
CREATE POLICY "Chats - participants can insert" ON public.chats
  FOR INSERT
  TO public
  WITH CHECK (
    ((select auth.uid()) IS NOT NULL) 
    AND (((select auth.uid()) = buyer_id) OR ((select auth.uid()) = seller_id))
  );

DROP POLICY IF EXISTS "Chats - participants can select" ON public.chats;
CREATE POLICY "Chats - participants can select" ON public.chats
  FOR SELECT
  TO public
  USING (
    ((select auth.uid()) IS NOT NULL) 
    AND (((select auth.uid()) = buyer_id) OR ((select auth.uid()) = seller_id))
  );

-- ============================================
-- DEVICES policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert own devices" ON public.devices;
CREATE POLICY "Users can insert own devices" ON public.devices
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can select own devices" ON public.devices;
CREATE POLICY "Users can select own devices" ON public.devices
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own devices" ON public.devices;
CREATE POLICY "Users can update own devices" ON public.devices
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- FAVORITES policies
-- ============================================

DROP POLICY IF EXISTS "Favorites - Owners can delete" ON public.favorites;
CREATE POLICY "Favorites - Owners can delete" ON public.favorites
  FOR DELETE
  TO public
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Favorites - Owners can insert" ON public.favorites;
CREATE POLICY "Favorites - Owners can insert" ON public.favorites
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = COALESCE(user_id, (select auth.uid())));

DROP POLICY IF EXISTS "Favorites - Owners can select" ON public.favorites;
CREATE POLICY "Favorites - Owners can select" ON public.favorites
  FOR SELECT
  TO public
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;
CREATE POLICY "Users can manage their own favorites" ON public.favorites
  FOR ALL
  TO public
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT
  TO public
  USING ((select auth.uid()) = user_id);

-- ============================================
-- ITEM_IMAGES policies
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own item images" ON public.item_images;
CREATE POLICY "Users can delete their own item images" ON public.item_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM items
      WHERE items.id = item_images.item_id 
        AND items.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert images for their items" ON public.item_images;
CREATE POLICY "Users can insert images for their items" ON public.item_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM items
      WHERE items.id = item_images.item_id 
        AND items.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update their own item images" ON public.item_images;
CREATE POLICY "Users can update their own item images" ON public.item_images
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM items
      WHERE items.id = item_images.item_id 
        AND items.user_id = (select auth.uid())
    )
  );

-- ============================================
-- ITEM_VIEWS policies
-- ============================================

DROP POLICY IF EXISTS "item_views_readable_by_owner" ON public.item_views;
CREATE POLICY "item_views_readable_by_owner" ON public.item_views
  FOR SELECT
  TO public
  USING (((select auth.uid()) = user_id) OR (user_id IS NULL));

-- ============================================
-- ITEMS policies
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own items" ON public.items;
CREATE POLICY "Users can delete their own items" ON public.items
  FOR DELETE
  TO public
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own items" ON public.items;
CREATE POLICY "Users can insert their own items" ON public.items
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own items" ON public.items;
CREATE POLICY "Users can update their own items" ON public.items
  FOR UPDATE
  TO public
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own items" ON public.items;
CREATE POLICY "Users can view their own items" ON public.items
  FOR SELECT
  TO public
  USING ((select auth.uid()) = user_id);

-- ============================================
-- NOTIFICATIONS policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert own notifications (testing)" ON public.notifications;
CREATE POLICY "Users can insert own notifications (testing)" ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can select own notifications" ON public.notifications;
CREATE POLICY "Users can select own notifications" ON public.notifications
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- OFFER_ITEMS policies
-- ============================================

DROP POLICY IF EXISTS "sender_can_insert_offer_items_for_their_offer" ON public.offer_items;
CREATE POLICY "sender_can_insert_offer_items_for_their_offer" ON public.offer_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (EXISTS (
      SELECT 1
      FROM offers o
      WHERE o.id = offer_items.offer_id 
        AND o.sender_id = (select auth.uid())
    )) 
    AND (
      ((side::text = 'offered') AND (EXISTS (
        SELECT 1
        FROM items i
        WHERE i.id = offer_items.item_id 
          AND i.user_id = (select auth.uid())
      ))) 
      OR ((side::text = 'requested') AND (EXISTS (
        SELECT 1
        FROM offers o2
        JOIN items i2 ON i2.id = offer_items.item_id
        WHERE o2.id = offer_items.offer_id 
          AND i2.user_id = o2.receiver_id
      )))
    )
  );

DROP POLICY IF EXISTS "sender_or_receiver_can_select_offer_items" ON public.offer_items;
CREATE POLICY "sender_or_receiver_can_select_offer_items" ON public.offer_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM offers o
      WHERE o.id = offer_items.offer_id 
        AND ((o.sender_id = (select auth.uid())) OR (o.receiver_id = (select auth.uid())))
    )
  );

-- ============================================
-- OFFERS policies
-- ============================================

DROP POLICY IF EXISTS "Users can create offers" ON public.offers;
CREATE POLICY "Users can create offers" ON public.offers
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = sender_id);

DROP POLICY IF EXISTS "Users can update offers they sent or received" ON public.offers;
CREATE POLICY "Users can update offers they sent or received" ON public.offers
  FOR UPDATE
  TO public
  USING (((select auth.uid()) = sender_id) OR ((select auth.uid()) = receiver_id));

DROP POLICY IF EXISTS "Users can view offers they sent or received" ON public.offers;
CREATE POLICY "Users can view offers they sent or received" ON public.offers
  FOR SELECT
  TO public
  USING (((select auth.uid()) = sender_id) OR ((select auth.uid()) = receiver_id));

-- ============================================
-- USER_FOLLOWS policies
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own follows" ON public.user_follows;
CREATE POLICY "Users can delete their own follows" ON public.user_follows
  FOR DELETE
  TO public
  USING ((select auth.uid()) = follower_id);

DROP POLICY IF EXISTS "Users can insert their own follows" ON public.user_follows;
CREATE POLICY "Users can insert their own follows" ON public.user_follows
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = follower_id);

-- ============================================
-- USERS policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT
  TO public
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE
  TO public
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT
  TO public
  USING ((select auth.uid()) = id);

-- Migration complete: All RLS policies now use (select auth.uid()) for optimal performance
