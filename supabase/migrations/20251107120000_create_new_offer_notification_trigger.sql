-- Create trigger to generate a `new_offer` notification whenever an offer is created
-- Assumes `notifications` table and `notification_type` enum already exist

set search_path = public;

create or replace function public.create_new_offer_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sender_name text;
  notification_message text;
begin
  select
    coalesce(
      nullif(trim(coalesce(u.first_name, '') || ' ' || coalesce(u.last_name, '')), ''),
      u.username,
      'Someone'
    )
  into sender_name
  from users u
  where u.id = new.sender_id;

  notification_message := case
    when sender_name is not null then sender_name || ' wants to swap with you'
    else 'You have a new swap offer'
  end;

  insert into notifications (
    user_id,
    type,
    title,
    message,
    data
  )
  values (
    new.receiver_id,
    'new_offer',
    'New Offer Received',
    notification_message,
    jsonb_build_object(
      'offerId', new.id,
      'senderId', new.sender_id
    )
  );

  return new;
exception
  when others then
    raise notice '[create_new_offer_notification] failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists create_new_offer_notification on offers;

create trigger create_new_offer_notification
after insert on offers
for each row
execute function public.create_new_offer_notification();



