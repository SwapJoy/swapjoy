-- Create trigger to generate a `new_follower` notification whenever a user follows another user
-- This trigger fires when a row is inserted into user_follows table

set search_path = public;

create or replace function public.create_new_follower_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  follower_name text;
  notification_message text;
begin
  -- Get the follower's name (the person who is following)
  select
    coalesce(
      nullif(trim(coalesce(u.first_name, '') || ' ' || coalesce(u.last_name, '')), ''),
      u.username,
      'Someone'
    )
  into follower_name
  from users u
  where u.id = new.follower_id;

  -- Build the notification message
  notification_message := case
    when follower_name is not null then follower_name || ' started following you'
    else 'You have a new follower'
  end;

  -- Create notification for the user being followed (following_id)
  insert into notifications (
    user_id,
    type,
    title,
    message,
    data
  )
  values (
    new.following_id,  -- The user being followed receives the notification
    'new_follower',
    'New Follower',
    notification_message,
    jsonb_build_object(
      'userId', new.follower_id,  -- The follower's ID for navigation
      'followerId', new.follower_id
    )
  );

  return new;
exception
  when others then
    raise notice '[create_new_follower_notification] failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists create_new_follower_notification on user_follows;

create trigger create_new_follower_notification
after insert on user_follows
for each row
execute function public.create_new_follower_notification();










