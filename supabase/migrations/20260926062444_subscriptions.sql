-- Recurring subscriptions that auto-post expense transactions on their charge date

create table public.subscriptions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name             text not null,
  amount           numeric not null check (amount > 0),
  cycle            text not null check (cycle in ('weekly','monthly','yearly')),
  start_date       date not null,
  charge_count     integer not null default 0,
  next_charge_date date not null,
  wallet_id        uuid not null references public.wallets(id) on delete cascade,
  category_id      uuid references public.categories(id) on delete set null,
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_due_idx on public.subscriptions(next_charge_date) where active;

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own" on public.subscriptions
  for select using (user_id = auth.uid());
create policy "subscriptions_insert_own" on public.subscriptions
  for insert with check (user_id = auth.uid());
create policy "subscriptions_update_own" on public.subscriptions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "subscriptions_delete_own" on public.subscriptions
  for delete using (user_id = auth.uid());

alter table public.transactions
  add column subscription_id uuid references public.subscriptions(id) on delete set null;

-- One charge per subscription per date makes charging idempotent
create unique index transactions_subscription_date_uidx
  on public.transactions(subscription_id, txn_date)
  where subscription_id is not null;

-- Posts every due charge (including missed periods) up to today in Bangkok time.
-- Called by the app for the signed-in user, and by pg_cron (no auth.uid()) for everyone.
create or replace function public.charge_due_subscriptions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Bangkok')::date;
  v_step  interval;
  v_date  date;
  v_n     integer;
  v_rows  integer;
  v_total integer := 0;
  s       record;
begin
  if v_uid is null and coalesce(auth.role(), '') in ('anon', 'authenticated') then
    return 0;
  end if;

  for s in
    select * from subscriptions
    where active
      and next_charge_date <= v_today
      and (v_uid is null or user_id = v_uid)
    for update
  loop
    v_step := case s.cycle
      when 'weekly'  then interval '1 week'
      when 'monthly' then interval '1 month'
      else                interval '1 year'
    end;
    v_n    := s.charge_count;
    v_date := s.next_charge_date;

    while v_date <= v_today loop
      insert into transactions (user_id, type, amount, note, txn_date, wallet_id, category_id, subscription_id)
      values (s.user_id, 'expense', s.amount, '↻ ' || s.name, v_date, s.wallet_id, s.category_id, s.id)
      on conflict (subscription_id, txn_date) where subscription_id is not null do nothing;
      get diagnostics v_rows = row_count;
      v_total := v_total + v_rows;

      v_n    := v_n + 1;
      -- Always offset from start_date so month-end dates don't drift (Jan 31 -> Feb 28 -> Mar 31)
      v_date := (s.start_date + v_step * v_n)::date;
    end loop;

    update subscriptions
      set charge_count = v_n, next_charge_date = v_date, updated_at = now()
      where id = s.id;
  end loop;

  return v_total;
end;
$$;

revoke execute on function public.charge_due_subscriptions() from public, anon;
grant execute on function public.charge_due_subscriptions() to authenticated;

create extension if not exists pg_cron;

-- 00:05 Asia/Bangkok daily
select cron.schedule('charge-subscriptions', '5 17 * * *', 'select public.charge_due_subscriptions()');
