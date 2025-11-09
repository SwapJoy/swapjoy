-- Ensure RLS is enabled on favorites (idempotent)
alter table favorites enable row level security;

-- Remove previous policies if they exist
drop policy if exists "Favorites - Owners can select" on favorites;
drop policy if exists "Favorites - Owners can insert" on favorites;
drop policy if exists "Favorites - Owners can delete" on favorites;

-- Policy allowing owners to read their favorites
create policy "Favorites - Owners can select"
  on favorites
  for select
  using (auth.uid() = user_id);

-- Policy allowing owners to insert favorites (user_id may be null before trigger runs)
create policy "Favorites - Owners can insert"
  on favorites
  for insert
  with check (auth.uid() = coalesce(user_id, auth.uid()));

-- Policy allowing owners to delete their favorites
create policy "Favorites - Owners can delete"
  on favorites
  for delete
  using (auth.uid() = user_id);

-- Helper function to auto-fill user_id when missing
create or replace function public.set_favorite_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

-- Ensure the trigger exists
drop trigger if exists set_favorite_owner on favorites;
create trigger set_favorite_owner
before insert on favorites
for each row
execute function public.set_favorite_owner();

