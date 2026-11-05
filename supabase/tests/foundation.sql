-- Run only against an isolated test project after the foundation migration.
-- All fixture records are rolled back. Uses SQL assertions without pgTAP.
begin;
insert into auth.users(id, email, email_confirmed_at) values
('11111111-1111-4111-8111-111111111111', 'fixture-seller@gmu.edu', now()),
('22222222-2222-4222-8222-222222222222', 'fixture-buyer@gmu.edu', now()),
('33333333-3333-4333-8333-333333333333', 'fixture-outsider@example.com', now()),
('44444444-4444-4444-8444-444444444444', 'fixture-unverified@gmu.edu', null);
insert into public.listings(id, seller_id, category_id, title, description, condition, price_cents, status) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'textbooks', 'Fixture book', 'Test only', 'good', 1000, 'available'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '11111111-1111-4111-8111-111111111111', 'textbooks', 'Private draft', 'Test only', 'good', 1000, 'draft');

set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
do $$ begin
  if not public.is_active_member() then raise exception 'Verified buyer should be eligible'; end if;
  if (select count(*) from public.listings where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')) <> 1 then raise exception 'Buyer should see only available listing'; end if;
  update public.listings set title = 'Unauthorized edit' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  if found then raise exception 'Buyer edited seller listing'; end if;
  begin
    update public.profiles set id = '11111111-1111-4111-8111-111111111111' where id = auth.uid();
    raise exception 'Identity field must not be writable';
  exception when insufficient_privilege then null;
  end;
end $$;
insert into public.favorites(listing_id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
do $$ begin
  if exists (select 1 from public.favorites where listing_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') then raise exception 'Favorites leaked to seller'; end if;
  update public.listings set title = 'Owner updated book' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  if not found then raise exception 'Owner could not edit'; end if;
end $$;

select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
do $$ begin
  if public.is_active_member() then raise exception 'Wrong domain admitted'; end if;
  if exists (select 1 from public.listings) then raise exception 'Wrong domain read listings'; end if;
end $$;
select set_config('request.jwt.claim.sub', '44444444-4444-4444-8444-444444444444', true);
do $$ begin
  if public.is_active_member() then raise exception 'Unverified user admitted'; end if;
end $$;
reset role;
update private.account_status set status = 'suspended' where user_id = '11111111-1111-4111-8111-111111111111';
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
do $$ begin
  if public.is_active_member() then raise exception 'Suspended user admitted'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform 1 from public.listings;
    raise exception 'Anonymous table access permitted';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
rollback;
