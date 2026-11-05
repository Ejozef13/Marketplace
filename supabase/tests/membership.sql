-- Current Auth state, not a previously issued token's claims, controls access.
begin;
insert into auth.users(id, email, email_confirmed_at, banned_until) values
('55555555-5555-4555-8555-555555555555', 'fixture-active@gmu.edu', now(), null),
('66666666-6666-4666-8666-666666666666', 'fixture-banned@gmu.edu', now(), now() + interval '1 day'),
('77777777-7777-4777-8777-777777777777', 'fixture-unconfirmed@gmu.edu', null, null),
('88888888-8888-4888-8888-888888888888', 'fixture-domain@example.com', now(), null),
('99999999-9999-4999-8999-999999999999', 'fixture-suspended@gmu.edu', now(), null);
update private.account_status set status = 'suspended'
where user_id = '99999999-9999-4999-8999-999999999999';

set local role authenticated;
select set_config('request.jwt.claim.sub', '55555555-5555-4555-8555-555555555555', true);
do $$ begin
  if not public.is_active_member() then raise exception 'Active verified member denied'; end if;
  if (select count(*) from public.categories) <> 6 then raise exception 'Expected six categories'; end if;
end $$;

do $$
declare member_id text;
begin
  foreach member_id in array array[
    '66666666-6666-4666-8666-666666666666',
    '77777777-7777-4777-8777-777777777777',
    '88888888-8888-4888-8888-888888888888',
    '99999999-9999-4999-8999-999999999999'
  ] loop
    perform set_config('request.jwt.claim.sub', member_id, true);
    if public.is_active_member() then raise exception 'Ineligible member admitted: %', member_id; end if;
    if exists (select 1 from public.profiles) or exists (select 1 from public.categories)
       or exists (select 1 from public.listings) or exists (select 1 from public.favorites) then
      raise exception 'Ineligible member read data: %', member_id;
    end if;
    begin
      insert into public.listings(category_id, title, description, condition, price_cents)
      values ('textbooks', 'Forbidden book', 'Fixture only', 'good', 100);
      raise exception 'Ineligible member created a listing: %', member_id;
    exception when insufficient_privilege then null;
    end;
  end loop;
end $$;
reset role;

-- Same user UUID/JWT subject loses access immediately after changing domain.
update auth.users set email = 'fixture-active@example.com'
where id = '55555555-5555-4555-8555-555555555555';
set local role authenticated;
select set_config('request.jwt.claim.sub', '55555555-5555-4555-8555-555555555555', true);
do $$ begin
  if public.is_active_member() then raise exception 'Old identity retained access after email change'; end if;
  if exists (select 1 from public.categories) then raise exception 'Email-change eligibility not enforced'; end if;
end $$;
reset role;
rollback;
