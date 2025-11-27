-- Allow offer participants to create chats directly (fix RLS 42501 on insert)
set search_path = public;

-- Remove the previous blocking insert policy
drop policy if exists "Chats - insert via RPC only" on public.chats;

-- Allow authenticated participants (buyer or seller) to insert chats
create policy "Chats - participants can insert"
  on public.chats
  for insert
  with check (
    auth.uid() is not null
    and (auth.uid() = buyer_id or auth.uid() = seller_id)
  );


