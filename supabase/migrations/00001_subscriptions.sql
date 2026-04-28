-- Subscriptions table for email-based subscription confirmation
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'active')),
  confirmation_token text not null unique,
  confirmed_at timestamptz,
  created_at timestamptz default now() not null,
  unique(user_id)
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Users can read their own subscription
create policy "Users can read own subscription"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- Service role can do everything (for server functions)
create policy "Service role full access"
  on public.subscriptions
  for all
  using (auth.role() = 'service_role');

-- Index for fast token lookups
create index idx_subscriptions_confirmation_token on public.subscriptions(confirmation_token);

-- Function to auto-create subscription on user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  token text;
begin
  token := encode(gen_random_bytes(32), 'hex');
  insert into public.subscriptions (user_id, email, confirmation_token, status)
  values (
    new.id,
    new.email,
    token,
    'pending'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: auto-create subscription row when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
