set search_path = public;

-- Ensure chat_messages is part of the supabase_realtime publication so DB changes
-- are streamed to clients via Realtime.
do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    begin
      alter publication supabase_realtime add table public.chat_messages;
    exception
      when duplicate_object then
        -- Table already in publication, ignore
        null;
    end;
  end if;
end;
$$;


