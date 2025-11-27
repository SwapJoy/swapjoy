-- Create chats and chat_messages tables for offer-scoped chat
set search_path = public;

-- Enum for chat message content type
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'chat_message_content_type'
      and n.nspname = 'public'
  ) then
    create type public.chat_message_content_type as enum ('text', 'image');
  end if;
end;
$$;

-- Chats table: one chat per offer + sender/receiver pair
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  buyer_id uuid not null references public.users(id) on delete cascade,
  seller_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  constraint chats_buyer_seller_offer_unique unique (offer_id, buyer_id, seller_id)
);

-- Messages table
create table if not exists public.chat_messages (
  id bigserial primary key,
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content_text text,
  content_type public.chat_message_content_type not null default 'text',
  media_url text,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

-- Indexes
create index if not exists idx_chats_offer_id on public.chats(offer_id);
create index if not exists idx_chats_last_message_at on public.chats(last_message_at desc nulls last);
create index if not exists idx_chat_messages_chat_id_created_at on public.chat_messages(chat_id, created_at desc);
create index if not exists idx_chat_messages_sender_id on public.chat_messages(sender_id);

-- Enable RLS
alter table public.chats enable row level security;
alter table public.chat_messages enable row level security;

-- RLS policies for chats
drop policy if exists "Chats - participants can select" on public.chats;
drop policy if exists "Chats - insert via RPC only" on public.chats;

create policy "Chats - participants can select"
  on public.chats
  for select
  using (
    auth.uid() is not null
    and (auth.uid() = buyer_id or auth.uid() = seller_id)
  );

-- No direct inserts/updates/deletes from client; managed through functions
create policy "Chats - insert via RPC only"
  on public.chats
  for insert
  with check (false);

-- RLS policies for chat_messages
drop policy if exists "Chat messages - participants can select" on public.chat_messages;
drop policy if exists "Chat messages - participants can insert" on public.chat_messages;
drop policy if exists "Chat messages - no direct delete or update" on public.chat_messages;

create policy "Chat messages - participants can select"
  on public.chat_messages
  for select
  using (
    auth.uid() is not null
    and exists (
      select 1
      from public.chats c
      where c.id = chat_messages.chat_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "Chat messages - participants can insert"
  on public.chat_messages
  for insert
  with check (
    auth.uid() is not null
    and auth.uid() = sender_id
    and exists (
      select 1
      from public.chats c
      where c.id = chat_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- Disallow direct delete/update from client
create policy "Chat messages - no direct delete or update"
  on public.chat_messages
  for delete
  using (false);

-- RPC: send_chat_message
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
  returning id, created_at into message_id, created_at;

  chat_id := v_chat_id;
  return next;
end;
$$;


