set search_path = public;

-- Fix ambiguous created_at reference in send_chat_message RPC
create or replace function public.send_chat_message(
  p_offer_id uuid,
  p_receiver_id uuid,
  p_content_text text,
  p_content_type public.chat_message_content_type default 'text',
  p_media_url text default null
)
returns table (
  chat_id uuid,
  message_id bigint,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid;
  v_sender_id uuid;
  v_receiver_id uuid;
  v_buyer_id uuid;
  v_seller_id uuid;
  v_chat_id uuid;
  v_now timestamptz := now();
begin
  v_auth_user_id := auth.uid();
  if v_auth_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_offer_id is null or p_receiver_id is null then
    raise exception 'offer_id and receiver_id are required';
  end if;

  if p_content_type = 'text' and (p_content_text is null or length(trim(p_content_text)) = 0) then
    raise exception 'content_text is required for text messages';
  end if;

  -- Fetch offer participants
  select o.sender_id, o.receiver_id
  into v_buyer_id, v_seller_id
  from public.offers o
  where o.id = p_offer_id;

  if v_buyer_id is null or v_seller_id is null then
    raise exception 'Offer not found for id %', p_offer_id;
  end if;

  -- Ensure auth user is a participant and determine sender/receiver
  if v_auth_user_id = v_buyer_id and p_receiver_id = v_seller_id then
    v_sender_id := v_auth_user_id;
    v_receiver_id := v_seller_id;
  elsif v_auth_user_id = v_seller_id and p_receiver_id = v_buyer_id then
    v_sender_id := v_auth_user_id;
    v_receiver_id := v_buyer_id;
  else
    raise exception 'User % is not a valid participant for offer % or receiver mismatch', v_auth_user_id, p_offer_id;
  end if;

  -- Normalize buyer/seller roles consistently with offers: sender as buyer, receiver as seller
  v_buyer_id := v_buyer_id;
  v_seller_id := v_seller_id;

  -- Find or create chat
  select c.id
  into v_chat_id
  from public.chats c
  where c.offer_id = p_offer_id
    and c.buyer_id = v_buyer_id
    and c.seller_id = v_seller_id;

  if v_chat_id is null then
    insert into public.chats (offer_id, buyer_id, seller_id, created_at, last_message_at)
    values (p_offer_id, v_buyer_id, v_seller_id, v_now, v_now)
    returning id into v_chat_id;
  else
    update public.chats
    set last_message_at = v_now
    where id = v_chat_id;
  end if;

  insert into public.chat_messages (
    chat_id,
    sender_id,
    content_text,
    content_type,
    media_url,
    created_at,
    is_read
  )
  values (
    v_chat_id,
    v_sender_id,
    p_content_text,
    coalesce(p_content_type, 'text'),
    p_media_url,
    v_now,
    false
  )
  returning id, chat_messages.created_at into message_id, created_at;

  chat_id := v_chat_id;
  return next;
end;
$$;


