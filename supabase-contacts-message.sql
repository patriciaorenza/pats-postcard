-- Pat's Postcard World: add an optional message to the contact form.
-- Additive only. Run after supabase-notes-contacts.sql. Safe to re-run.

alter table public.contacts
  add column if not exists message text
  check (message is null or char_length(message) between 1 and 1000);

-- visitors can now also write the message column (still never read anything)
grant insert (name, email, message) on public.contacts to anon;

-- flag a contact if the name or the message trips the word and link filter
create or replace function public.contacts_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare h text := private.sender_hash();
begin
  if (select count(*) from public.contacts where created_at > now() - interval '1 day') >= 300 then
    raise exception 'Messages are paused for a moment. Please try again later.' using errcode = 'P0001';
  end if;
  if h is not null and (select count(*) from public.contacts where sender_hash = h and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Too many messages from this connection. Please try again later.' using errcode = 'P0001';
  end if;
  new.sender_hash := h;
  new.flagged := private.is_suspicious(new.name) or private.is_suspicious(new.message);
  return new;
end $$;
revoke all on function public.contacts_guard() from public, anon, authenticated;
