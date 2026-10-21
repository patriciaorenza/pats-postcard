-- Read-only safety check. Run in Supabase > SQL Editor and look at each result tab.

-- 1) Every table in "public" should say rls_on = true.
select c.relname as table_name, c.relrowsecurity as rls_on
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' order by 1;

-- 2) What can a visitor (anon) do? Expect:
--    contacts : INSERT only (never SELECT / UPDATE / DELETE) because it holds emails
--    notes    : INSERT and SELECT only
--    postcards: INSERT and SELECT only
select table_name, privilege_type
from information_schema.role_table_grants
where grantee = 'anon' and table_schema = 'public' order by 1, 2;

-- 3) The policies behind that.
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies where schemaname = 'public' order by 1, 2;

-- If contacts shows SELECT/UPDATE/DELETE for anon, run this to close it:
-- revoke select, update, delete on public.contacts from anon;
-- (then drop any policy in result 3 on contacts whose cmd is SELECT, UPDATE, DELETE or ALL)
