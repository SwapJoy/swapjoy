set search_path = public;

-- Allow chat participants to update chat_messages (e.g. mark as read)
alter table public.chat_messages enable row level security;

drop policy if exists "Chat messages - participants can update" on public.chat_messages;

create policy "Chat messages - participants can update"
  on public.chat_messages
  for update
  using (
    auth.uid() is not null
    and exists (
      select 1
      from public.chats c
      where c.id = chat_messages.chat_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  )
  with check (
    auth.uid() is not null
    and exists (
      select 1
      from public.chats c
      where c.id = chat_messages.chat_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );


