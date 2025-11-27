-- Create chat-media storage bucket and define access policies
set search_path = storage;

-- Create bucket if it doesn't exist
insert into buckets (id, name, public)
select 'chat-media', 'chat-media', false
where not exists (
  select 1 from buckets where id = 'chat-media'
);

set search_path = public;

-- Allow authenticated users to upload to chat-media; RLS on chat_messages will control visibility
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Chat media - authenticated upload'
  ) then
    create policy "Chat media - authenticated upload"
      on storage.objects
      for insert
      with check (
        bucket_id = 'chat-media'
        and auth.role() = 'authenticated'
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Chat media - participants can read'
  ) then
    create policy "Chat media - participants can read"
      on storage.objects
      for select
      using (
        bucket_id = 'chat-media'
        and auth.role() = 'authenticated'
        and exists (
          select 1
          from public.chat_messages m
          join public.chats c on c.id = m.chat_id
          where m.media_url = storage.objects.name
            and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
        )
      );
  end if;
end;
$$;


