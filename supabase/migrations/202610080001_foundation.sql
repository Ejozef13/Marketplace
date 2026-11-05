-- Foundation only: chat, transactions, reviews and storage policies are later migrations.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.account_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'suspended'))
);
alter table private.account_status enable row level security;
revoke all on private.account_status from public, anon, authenticated;

create function public.is_active_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u
    join private.account_status a on a.user_id = u.id
    where u.id = (select auth.uid())
      and lower(split_part(u.email, '@', 2)) = 'gmu.edu'
      and u.email_confirmed_at is not null
      and (u.banned_until is null or u.banned_until < now())
      and a.status = 'active'
  );
$$;
revoke all on function public.is_active_member() from public, anon;
grant execute on function public.is_active_member() to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Patriot' check (char_length(display_name) between 1 and 80),
  bio text not null default '' check (char_length(bio) <= 500),
  created_at timestamptz not null default now()
);

create function private.initialize_member() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id) values (new.id);
  insert into private.account_status(user_id) values (new.id);
  return new;
end;
$$;
revoke all on function private.initialize_member() from public, anon, authenticated;
create trigger initialize_marketplace_member after insert on auth.users
for each row execute function private.initialize_member();
-- Support an otherwise-empty development project with pre-existing Auth users.
insert into public.profiles(id) select id from auth.users on conflict do nothing;
insert into private.account_status(user_id) select id from auth.users on conflict do nothing;

create table public.categories (
  id text primary key,
  name text not null unique
);
insert into public.categories(id, name) values
('textbooks', 'Textbooks'), ('electronics', 'Electronics'), ('furniture', 'Furniture'),
('clothing', 'Clothing'), ('school-supplies', 'School supplies'), ('other', 'Other');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null default auth.uid() references public.profiles(id),
  category_id text not null references public.categories(id),
  title text not null check (char_length(btrim(title)) between 3 and 120),
  description text not null check (char_length(description) between 1 and 5000),
  condition text not null check (condition in ('new', 'like_new', 'good', 'fair')),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD' check (currency = 'USD'),
  -- Pending/sold deliberately excluded until atomic transaction operations exist.
  status text not null default 'draft' check (status in ('draft', 'available', 'archived')),
  created_at timestamptz not null default now()
);
create index listings_browse on public.listings(status, category_id, created_at desc);
create index listings_seller on public.listings(seller_id);

create table public.favorites (
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;
alter table public.favorites enable row level security;
revoke all on public.profiles, public.categories, public.listings, public.favorites from public, anon, authenticated;
grant select on public.profiles, public.categories, public.listings, public.favorites to authenticated;
grant update (display_name, bio) on public.profiles to authenticated;
grant insert (category_id, title, description, condition, price_cents, status) on public.listings to authenticated;
grant update (category_id, title, description, condition, price_cents, status) on public.listings to authenticated;
grant insert (listing_id), delete on public.favorites to authenticated;

create policy profiles_read on public.profiles for select to authenticated
using ((select public.is_active_member()));
create policy profiles_edit_self on public.profiles for update to authenticated
using (id = (select auth.uid()) and (select public.is_active_member()))
with check (id = (select auth.uid()) and (select public.is_active_member()));
create policy categories_read on public.categories for select to authenticated
using ((select public.is_active_member()));
create policy listings_read on public.listings for select to authenticated
using ((select public.is_active_member()) and (status = 'available' or seller_id = (select auth.uid())));
create policy listings_create_self on public.listings for insert to authenticated
with check (seller_id = (select auth.uid()) and (select public.is_active_member()));
create policy listings_edit_self on public.listings for update to authenticated
using (seller_id = (select auth.uid()) and (select public.is_active_member()))
with check (seller_id = (select auth.uid()) and (select public.is_active_member()));
create policy favorites_read_self on public.favorites for select to authenticated
using (user_id = (select auth.uid()) and (select public.is_active_member()));
create policy favorites_create_self on public.favorites for insert to authenticated
with check (user_id = (select auth.uid()) and (select public.is_active_member()) and exists (
  select 1 from public.listings l where l.id = listing_id and l.status = 'available'
));
create policy favorites_delete_self on public.favorites for delete to authenticated
using (user_id = (select auth.uid()) and (select public.is_active_member()));

commit;
