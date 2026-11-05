-- A signup hook complements (and does not replace) verified-member RLS.
-- Local Auth loads this through config.toml. Enable it separately on hosted Auth.
begin;

create function public.before_user_created(event jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
begin
  -- Exact domain, case insensitive. Reject missing email, subdomains and suffixes.
  if coalesce(event->'user'->>'email', '') !~* '^[^@[:space:]]+@gmu[.]edu$' then
    return jsonb_build_object('error', jsonb_build_object(
      'http_code', 403,
      'message', 'Use a gmu.edu email address to join Patriot Marketplace.'
    ));
  end if;
  return '{}'::jsonb;
end;
$$;

revoke all on function public.before_user_created(jsonb) from public, anon, authenticated;
grant usage on schema public to supabase_auth_admin;
grant execute on function public.before_user_created(jsonb) to supabase_auth_admin;

commit;
