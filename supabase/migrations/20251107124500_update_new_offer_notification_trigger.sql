-- Extend new offer notification trigger to fire on inserts and relevant updates

set search_path = public;

create or replace function public.create_new_offer_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sender_name text;
  notification_title text := 'New Offer Received';
  notification_message text;
  notification_data jsonb := jsonb_build_object(
    'offerId', new.id,
    'senderId', new.sender_id
  );
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

  if tg_op = 'INSERT' then
    notification_message := concat(sender_name, ' wants to swap with you');

  elsif tg_op = 'UPDATE' then
    if new.receiver_id is distinct from old.receiver_id then
      notification_message := concat(sender_name, ' updated the swap offer');
    elsif new.status is distinct from old.status then
      notification_message := concat(sender_name, ' updated the offer status to ', coalesce(new.status, 'pending'));
      notification_data := notification_data || jsonb_build_object('status', new.status);
    elsif new.message is distinct from old.message then
      notification_message := concat(sender_name, ' updated the offer message');
    elsif new.top_up_amount is distinct from old.top_up_amount then
      notification_message := concat(sender_name, ' updated the offer terms');
      notification_data := notification_data || jsonb_build_object('topUpAmount', new.top_up_amount);
    else
      return new;
    end if;
  else
    return new;
  end if;

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
    notification_title,
    notification_message,
    notification_data
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
after insert or update on offers
for each row
execute function public.create_new_offer_notification();

