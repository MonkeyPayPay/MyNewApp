-- Preview an invitation by token (no auth required — just token knowledge)
create or replace function public.preview_invitation(p_token text)
returns json
language plpgsql
security definer
as $$
declare
  v_row record;
begin
  select
    i.circle_id,
    p.full_name  as inviter_name,
    cr.full_name as recipient_name
  into v_row
  from public.invitations i
  join public.profiles        p  on p.id  = i.invited_by
  join public.care_circles    cc on cc.id = i.circle_id
  join public.care_recipients cr on cr.id = cc.care_recipient_id
  where i.token = p_token
    and i.expires_at > now()
    and i.accepted_at is null;

  if not found then
    return json_build_object('error', 'This invitation is invalid or has expired.');
  end if;

  return json_build_object(
    'circle_id',      v_row.circle_id,
    'inviter_name',   v_row.inviter_name,
    'recipient_name', v_row.recipient_name
  );
end;
$$;

-- Accept an invitation — must be called by an authenticated user
create or replace function public.accept_invitation(p_token text)
returns json
language plpgsql
security definer
as $$
declare
  v_inv record;
begin
  select * into v_inv
  from public.invitations
  where token        = p_token
    and expires_at   > now()
    and accepted_at  is null;

  if not found then
    return json_build_object('error', 'This invitation is invalid or has expired.');
  end if;

  -- Idempotent: ignore if already a member
  insert into public.circle_members (circle_id, user_id, role)
  values (v_inv.circle_id, auth.uid(), v_inv.role)
  on conflict (circle_id, user_id) do nothing;

  -- Mark accepted
  update public.invitations
  set accepted_at = now()
  where id = v_inv.id;

  return json_build_object('circle_id', v_inv.circle_id);
end;
$$;
