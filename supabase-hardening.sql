-- Pat's Postcard World: spam hardening (security review, 30 Oct 2026).
-- Additive and safe to re-run. Run after supabase-contacts-message.sql.
--
-- 1. Identify the visitor's connection from the header the edge sets itself
--    (cf-connecting-ip). The first x-forwarded-for entry can be supplied by the
--    sender, so it is only a fallback.
create or replace function private.sender_hash() returns text
language plpgsql stable security definer set search_path = '' as $$
declare hdr json; ip text; s text;
begin
  hdr := nullif(current_setting('request.headers', true), '')::json;
  ip := trim(coalesce(hdr ->> 'cf-connecting-ip', split_part(coalesce(hdr ->> 'x-forwarded-for', ''), ',', 1), ''));
  if ip = '' then return null; end if;
  select v into s from private.settings where k = 'hash_salt';
  return encode(extensions.digest(s || ip, 'sha256'), 'hex');
end $$;
revoke all on function private.sender_hash() from public, anon, authenticated;

-- 2. Cap on notes across all visitors, so the wall cannot be flooded even if the
--    per-connection limit is bypassed (notes publish instantly).
create or replace function public.notes_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare h text := private.sender_hash();
begin
  if (select count(*) from public.notes where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'The wall is busy right now. Please try again in a little while.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.notes where flagged) >= 200 then
    raise exception 'The wall is paused for a moment. Please try again later.' using errcode = 'P0001';
  end if;
  if h is not null and (select count(*) from public.notes where sender_hash = h and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many notes from this connection. Please try again later.' using errcode = 'P0001';
  end if;
  new.sender_hash := h;
  new.flagged := false; new.flag_reason := null;
  if private.is_suspicious(new.note) or private.is_suspicious(new.name) then
    new.flagged := true; new.flag_reason := 'word or link filter';
  end if;
  return new;
end $$;
revoke all on function public.notes_guard() from public, anon, authenticated;
