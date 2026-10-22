-- Staff accounts, guard check-in tracing, and the RPCs used by the Lucky Draw "Gate" screen.
-- Run once in the Supabase SQL editor (or `supabase db push`).

-- 1. Staff roles ----------------------------------------------------------------------------
-- Logins stay in Supabase Auth (auth.users). This table only adds a role per login.
create table if not exists public.staff (
   user_id    uuid primary key references auth.users (id) on delete cascade,
   full_name  text not null default '',
   role       text not null check (role in ('admin', 'guard')),
   active     boolean not null default true,
   created_at timestamptz not null default now()
);

-- Every login that exists today was created for the managers, so keep them working as admins.
insert into public.staff (user_id, full_name, role)
select u.id, coalesce(u.email, ''), 'admin'
from auth.users u
on conflict (user_id) do nothing;

-- 2. Check-in tracing -----------------------------------------------------------------------
alter table public.event_registrations
   add column if not exists checked_in_by   uuid references auth.users (id) on delete set null,
   add column if not exists check_in_method text check (check_in_method in ('qr', 'manual'));

-- Every attempt (success or not), for auditing.
create table if not exists public.checkin_logs (
   id              bigint generated always as identity primary key,
   registration_id uuid,
   event_id        uuid,
   staff_id        uuid references auth.users (id) on delete set null,
   method          text not null,
   result          text not null check (result in ('checked_in', 'already_checked_in', 'not_found')),
   created_at      timestamptz not null default now()
);
create index if not exists checkin_logs_event_idx on public.checkin_logs (event_id, created_at desc);

-- 3. Helpers --------------------------------------------------------------------------------
create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
   select role from public.staff where user_id = auth.uid() and active
$$;

-- 4. Row level security for the new tables ---------------------------------------------------
alter table public.staff enable row level security;
alter table public.checkin_logs enable row level security;

drop policy if exists staff_select on public.staff;
create policy staff_select on public.staff
   for select to authenticated
   using (user_id = auth.uid() or public.current_staff_role() = 'admin');

drop policy if exists checkin_logs_select on public.checkin_logs;
create policy checkin_logs_select on public.checkin_logs
   for select to authenticated
   using (public.current_staff_role() = 'admin');
-- No insert/update/delete policies: staff rows are written by the dashboard API (service role)
-- and log rows only by confirm_checkin() below.

-- 5. Gate RPCs (guards and admins) -----------------------------------------------------------
drop function if exists public.lookup_registration(uuid);
drop function if exists public.lookup_registration(text);
drop function if exists public.search_registrations(uuid, text);
drop function if exists public.search_registrations(text, text);
drop function if exists public.confirm_checkin(uuid, text);
drop function if exists public.confirm_checkin(text, text);

create or replace function public.lookup_registration(p_registration_id text)
returns table (
   registration_id text,
   event_id text,
   event_title text,
   name text,
   email text,
   phone text,
   ticket_code text,
   status text,
   scanned_at text,
   checked_in_by_name text,
   check_in_method text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
   if public.current_staff_role() is null then
      raise exception 'Not authorized' using errcode = '42501';
   end if;

   return query
   select
      r.id::text,
      r.event_id::text,
      e.title::text,
      c.name::text,
      c.email::text,
      c.phone::text,
      r.ticket_code::text,
      r.status::text,
      r.scanned_at::text,
      s.full_name::text,
      r.check_in_method::text
   from public.event_registrations r
   join public.customers c on c.id = r.customer_id
   join public.events e on e.id = r.event_id
   left join public.staff s on s.user_id = r.checked_in_by
   where r.id::text = p_registration_id::text;
end;
$$;

-- Flexible search: every space-separated word must appear in name, email, phone, ticket code or status.
create or replace function public.search_registrations(p_event_id text, p_query text)
returns table (
   registration_id text,
   event_id text,
   event_title text,
   name text,
   email text,
   phone text,
   ticket_code text,
   status text,
   scanned_at text,
   checked_in_by_name text,
   check_in_method text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
   if public.current_staff_role() is null then
      raise exception 'Not authorized' using errcode = '42501';
   end if;

   return query
   select
      r.id::text,
      r.event_id::text,
      e.title::text,
      c.name::text,
      c.email::text,
      c.phone::text,
      r.ticket_code::text,
      r.status::text,
      r.scanned_at::text,
      s.full_name::text,
      r.check_in_method::text
   from public.event_registrations r
   join public.customers c on c.id = r.customer_id
   join public.events e on e.id = r.event_id
   left join public.staff s on s.user_id = r.checked_in_by
   where r.event_id::text = p_event_id::text
     and not exists (
        select 1
        from unnest(string_to_array(trim(coalesce(p_query, '')), ' ')) as t(word)
        where t.word <> ''
          and not (
             concat_ws(' ', c.name, c.email, c.phone, r.ticket_code, r.status)
             ilike '%' || replace(replace(replace(t.word, '\', '\\'), '%', '\%'), '_', '\_') || '%'
          )
     )
   order by c.name
   limit 50;
end;
$$;

-- Atomic check-in. Never overwrites an earlier check-in.
create or replace function public.confirm_checkin(p_registration_id text, p_method text default 'qr')
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
   v_event_id text;
   v_updated  int;
   v_actual_id uuid;
begin
   if public.current_staff_role() is null then
      raise exception 'Not authorized' using errcode = '42501';
   end if;
   if p_method not in ('qr', 'manual') then
      raise exception 'Invalid method';
   end if;

   select r.event_id::text, r.id
   into v_event_id, v_actual_id
   from public.event_registrations r
   where r.id::text = p_registration_id::text;

   if not found then
      insert into public.checkin_logs (registration_id, staff_id, method, result)
      values (null, auth.uid(), p_method, 'not_found');
      return json_build_object('result', 'not_found');
   end if;

   update public.event_registrations
   set status = 'replied_scanned',
       scanned_at = coalesce(scanned_at, now()),
       checked_in_by = coalesce(checked_in_by, auth.uid()),
       check_in_method = coalesce(check_in_method, p_method)
   where id = v_actual_id and status <> 'replied_scanned';
   get diagnostics v_updated = row_count;

   if v_updated = 0 then
      insert into public.checkin_logs (registration_id, event_id, staff_id, method, result)
      values (
         v_actual_id,
         case when v_event_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then v_event_id::uuid else null end,
         auth.uid(),
         p_method,
         'already_checked_in'
      );
      return json_build_object('result', 'already_checked_in');
   end if;

   insert into public.checkin_logs (registration_id, event_id, staff_id, method, result)
   values (
      v_actual_id,
      case when v_event_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then v_event_id::uuid else null end,
      auth.uid(),
      p_method,
      'checked_in'
   );
   return json_build_object('result', 'checked_in');
end;
$$;

revoke all on function public.current_staff_role() from public, anon;
revoke all on function public.lookup_registration(text) from public, anon;
revoke all on function public.search_registrations(text, text) from public, anon;
revoke all on function public.confirm_checkin(text, text) from public, anon;
grant execute on function public.current_staff_role() to authenticated;
grant execute on function public.lookup_registration(text) to authenticated;
grant execute on function public.search_registrations(text, text) to authenticated;
grant execute on function public.confirm_checkin(text, text) to authenticated;

