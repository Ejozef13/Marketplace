-- Hook execution rights and exact-domain behavior, without creating Auth users.
begin;
set local role supabase_auth_admin;
do $$
declare
  email text;
  result jsonb;
begin
  foreach email in array array['student@gmu.edu', 'Student@GMU.EDU'] loop
    result := public.before_user_created(jsonb_build_object('user', jsonb_build_object('email', email)));
    if result <> '{}'::jsonb then raise exception 'GMU email rejected: %', email; end if;
  end loop;
  foreach email in array array['student@example.com', 'student@gmu.edu.evil.com', 'student@sub.gmu.edu', 'a@gmu.edu@gmu.edu', '', ' student@gmu.edu'] loop
    result := public.before_user_created(jsonb_build_object('user', jsonb_build_object('email', email)));
    if result->'error'->>'http_code' is distinct from '403' then raise exception 'Invalid email admitted: %', email; end if;
  end loop;
  if public.before_user_created('{}'::jsonb)->'error' is null then raise exception 'Missing email admitted'; end if;
end $$;
reset role;
set local role authenticated;
do $$ begin
  begin
    perform public.before_user_created('{"user":{"email":"student@gmu.edu"}}');
    raise exception 'Application user could execute the Auth hook';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
rollback;
