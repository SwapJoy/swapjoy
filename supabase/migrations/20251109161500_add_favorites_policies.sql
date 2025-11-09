-- Enable row level security on favorites table
alter table favorites enable row level security;

-- Allow authenticated users to read their own favorites
create policy "Favorites - Owners can select"
  on favorites
  for select
  using (auth.uid() = user_id);

-- Allow authenticated users to create favorites for themselves
create policy "Favorites - Owners can insert"
  on favorites
  for insert
  with check (auth.uid() = user_id);

-- Allow authenticated users to remove their own favorites
create policy "Favorites - Owners can delete"
  on favorites
  for delete
  using (auth.uid() = user_id);

