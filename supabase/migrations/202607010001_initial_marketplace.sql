begin;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

create type public.app_role as enum ('customer', 'freelancer', 'admin');
create type public.user_status as enum ('active', 'suspended', 'deleted');
create type public.service_status as enum ('draft', 'published', 'archived');
create type public.pricing_type as enum ('fixed', 'hourly', 'starting_at');
create type public.order_status as enum (
  'draft',
  'open',
  'in_review',
  'matched',
  'in_progress',
  'completed',
  'cancelled'
);
create type public.proposal_status as enum (
  'pending',
  'accepted',
  'rejected',
  'withdrawn'
);
create type public.deal_status as enum (
  'pending_payment',
  'funded',
  'in_progress',
  'submitted',
  'completed',
  'cancelled',
  'disputed',
  'refunded'
);
create type public.dispute_status as enum (
  'open',
  'under_review',
  'resolved',
  'rejected'
);
create type public.transaction_type as enum (
  'authorization',
  'capture',
  'charge',
  'refund',
  'payout',
  'fee'
);
create type public.transaction_status as enum (
  'pending',
  'processing',
  'succeeded',
  'failed',
  'cancelled'
);
create type public.payment_provider as enum ('mock', 'bepaid', 'webpay', 'manual');
create type public.conversation_kind as enum ('direct', 'deal', 'support');
create type public.message_kind as enum ('text', 'file', 'system');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type public.report_target as enum (
  'user',
  'service',
  'order',
  'message',
  'review'
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email extensions.citext unique,
  display_name text not null default 'Пользователь'
    check (char_length(display_name) between 2 and 80),
  avatar_url text,
  phone text,
  role public.app_role not null default 'customer',
  status public.user_status not null default 'active',
  locale text not null default 'ru' check (char_length(locale) between 2 and 10),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on type public.app_role is
  'Persistent authenticated roles. Guest is represented by an anonymous Auth context.';
comment on column public.users.phone is
  'Private contact data. Never expose public.users directly in a public directory.';

create table public.freelancer_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  slug extensions.citext not null unique
    check (slug ~ '^[a-z0-9][a-z0-9-]{2,79}$'),
  headline text not null default ''
    check (char_length(headline) <= 140),
  bio text not null default ''
    check (char_length(bio) <= 5000),
  skills text[] not null default '{}',
  languages text[] not null default array['ru']::text[],
  country_code text check (country_code ~ '^[A-Z]{2}$'),
  timezone text not null default 'Europe/Minsk',
  experience_years smallint not null default 0
    check (experience_years between 0 and 80),
  hourly_rate_minor bigint check (
    hourly_rate_minor between 0 and 9007199254740991
  ),
  currency char(3) not null default 'BYN'
    check (currency = upper(currency)),
  is_available boolean not null default true,
  is_published boolean not null default false,
  verified_at timestamptz,
  rating numeric(3,2) not null default 0
    check (rating between 0 and 5),
  reviews_count integer not null default 0
    check (reviews_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default extensions.gen_random_uuid(),
  freelancer_id uuid not null references public.users(id) on delete cascade,
  slug extensions.citext not null,
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) between 20 and 10000),
  category text not null check (char_length(category) between 2 and 80),
  tags text[] not null default '{}',
  pricing_type public.pricing_type not null default 'fixed',
  price_minor bigint not null check (
    price_minor between 0 and 9007199254740991
  ),
  currency char(3) not null default 'BYN'
    check (currency = upper(currency)),
  delivery_days integer check (delivery_days between 1 and 365),
  status public.service_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (freelancer_id, slug)
);

create table public.orders (
  id uuid primary key default extensions.gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete restrict,
  assigned_freelancer_id uuid references public.users(id) on delete restrict,
  service_id uuid references public.services(id) on delete set null,
  title text not null check (char_length(title) between 5 and 160),
  description text not null check (char_length(description) between 20 and 15000),
  category text not null check (char_length(category) between 2 and 80),
  required_skills text[] not null default '{}',
  budget_min_minor bigint check (
    budget_min_minor between 0 and 9007199254740991
  ),
  budget_max_minor bigint check (
    budget_max_minor between 0 and 9007199254740991
  ),
  currency char(3) not null default 'BYN'
    check (currency = upper(currency)),
  deadline_at timestamptz,
  status public.order_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    budget_min_minor is null
    or budget_max_minor is null
    or budget_min_minor <= budget_max_minor
  ),
  check (assigned_freelancer_id is null or assigned_freelancer_id <> customer_id)
);

create table public.proposals (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  freelancer_id uuid not null references public.users(id) on delete cascade,
  cover_letter text not null check (char_length(cover_letter) between 20 and 5000),
  amount_minor bigint not null check (
    amount_minor between 0 and 9007199254740991
  ),
  currency char(3) not null default 'BYN'
    check (currency = upper(currency)),
  delivery_days integer not null check (delivery_days between 1 and 365),
  status public.proposal_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, freelancer_id)
);

create table public.deals (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  proposal_id uuid unique references public.proposals(id) on delete restrict,
  customer_id uuid not null references public.users(id) on delete restrict,
  freelancer_id uuid not null references public.users(id) on delete restrict,
  amount_minor bigint not null check (
    amount_minor between 0 and 9007199254740991
  ),
  platform_fee_minor bigint not null default 0
    check (
      platform_fee_minor between 0 and 9007199254740991
      and platform_fee_minor <= amount_minor
    ),
  currency char(3) not null default 'BYN'
    check (currency = upper(currency)),
  status public.deal_status not null default 'pending_payment',
  version integer not null default 1 check (version > 0),
  funded_at timestamptz,
  started_at timestamptz,
  submitted_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (customer_id <> freelancer_id)
);

create table public.conversations (
  id uuid primary key default extensions.gen_random_uuid(),
  kind public.conversation_kind not null default 'direct',
  created_by uuid not null references public.users(id) on delete restrict,
  order_id uuid references public.orders(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  subject text check (char_length(subject) <= 160),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (kind <> 'deal')
    or deal_id is not null
  )
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  last_read_at timestamptz,
  muted_until timestamptz,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default extensions.gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete restrict,
  body text check (body is null or char_length(body) between 1 and 10000),
  attachment_url text,
  kind public.message_kind not null default 'text',
  reply_to_id uuid references public.messages(id) on delete set null,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  check (body is not null or attachment_url is not null or kind = 'system')
);

create table public.reviews (
  id uuid primary key default extensions.gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete restrict,
  reviewer_id uuid not null references public.users(id) on delete restrict,
  reviewee_id uuid not null references public.users(id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  body text not null default '' check (char_length(body) <= 3000),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (deal_id, reviewer_id),
  check (reviewer_id <> reviewee_id)
);

create table public.disputes (
  id uuid primary key default extensions.gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete restrict,
  opened_by uuid not null references public.users(id) on delete restrict,
  assigned_admin_id uuid references public.users(id) on delete set null,
  reason text not null check (char_length(reason) between 10 and 4000),
  evidence jsonb not null default '[]'::jsonb,
  status public.dispute_status not null default 'open',
  resolution text check (resolution is null or char_length(resolution) <= 5000),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default extensions.gen_random_uuid(),
  deal_id uuid references public.deals(id) on delete restrict,
  user_id uuid references public.users(id) on delete restrict,
  type public.transaction_type not null,
  status public.transaction_status not null default 'pending',
  provider public.payment_provider not null,
  external_transaction_id text,
  idempotency_key uuid not null default extensions.gen_random_uuid() unique,
  amount_minor bigint not null check (
    amount_minor between 0 and 9007199254740991
  ),
  currency char(3) not null default 'BYN'
    check (currency = upper(currency)),
  provider_fee_minor bigint not null default 0 check (
    provider_fee_minor between 0 and 9007199254740991
  ),
  failure_code text,
  metadata jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index transactions_provider_external_uidx
  on public.transactions (provider, external_transaction_id)
  where external_transaction_id is not null;

create table public.payment_webhook_events (
  id uuid primary key default extensions.gen_random_uuid(),
  provider public.payment_provider not null,
  provider_event_id text not null,
  signature_valid boolean not null default false,
  payload jsonb not null,
  processing_error text,
  processed_at timestamptz,
  received_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

comment on table public.payment_webhook_events is
  'Private idempotent payment event inbox. Accessible only by trusted server code.';

create table public.reports (
  id uuid primary key default extensions.gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete restrict,
  target_type public.report_target not null,
  target_id uuid not null,
  reason text not null check (char_length(reason) between 5 and 2000),
  status public.report_status not null default 'open',
  assigned_admin_id uuid references public.users(id) on delete set null,
  resolution_note text check (
    resolution_note is null or char_length(resolution_note) <= 3000
  ),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (char_length(type) between 2 and 80),
  title text not null check (char_length(title) between 1 and 160),
  body text not null default '' check (char_length(body) <= 2000),
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.device_tokens (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android', 'web')),
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index freelancer_profiles_published_idx
  on public.freelancer_profiles (is_published, is_available, rating desc)
  where is_published = true;
create index freelancer_profiles_skills_gin
  on public.freelancer_profiles using gin (skills);
create index services_catalog_idx
  on public.services (status, category, created_at desc)
  where status = 'published';
create index services_freelancer_idx
  on public.services (freelancer_id, status);
create index orders_marketplace_idx
  on public.orders (status, category, published_at desc)
  where status = 'open';
create index orders_customer_idx
  on public.orders (customer_id, created_at desc);
create index proposals_order_idx
  on public.proposals (order_id, status, created_at desc);
create index proposals_freelancer_idx
  on public.proposals (freelancer_id, created_at desc);
create index deals_customer_idx on public.deals (customer_id, updated_at desc);
create index deals_freelancer_idx on public.deals (freelancer_id, updated_at desc);
create index conversation_participants_user_idx
  on public.conversation_participants (user_id, joined_at desc);
create index messages_conversation_cursor_idx
  on public.messages (conversation_id, created_at desc, id);
create index reviews_reviewee_idx
  on public.reviews (reviewee_id, created_at desc)
  where is_public = true;
create index disputes_status_idx on public.disputes (status, created_at);
create index transactions_deal_idx
  on public.transactions (deal_id, created_at desc);
create index reports_status_idx on public.reports (status, created_at);
create index notifications_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();
create trigger freelancer_profiles_set_updated_at
before update on public.freelancer_profiles
for each row execute function public.set_updated_at();
create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();
create trigger proposals_set_updated_at
before update on public.proposals
for each row execute function public.set_updated_at();
create trigger deals_set_updated_at
before update on public.deals
for each row execute function public.set_updated_at();
create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();
create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();
create trigger disputes_set_updated_at
before update on public.disputes
for each row execute function public.set_updated_at();
create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();
create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.users
  where id = (select auth.uid())
    and status = 'active'
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select public.current_app_role() = 'admin'), false)
$$;

create or replace function public.is_conversation_member(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = target_conversation_id
      and cp.user_id = (select auth.uid())
      and cp.left_at is null
  )
$$;

create or replace function public.is_deal_party(target_deal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.deals d
    where d.id = target_deal_id
      and (select auth.uid()) in (d.customer_id, d.freelancer_id)
  )
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role public.app_role;
  safe_name text;
  safe_slug text;
begin
  requested_role :=
    case new.raw_user_meta_data ->> 'role'
      when 'freelancer' then 'freelancer'::public.app_role
      else 'customer'::public.app_role
    end;

  safe_name := left(
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(coalesce(new.email, 'user'), '@', 1),
      'Пользователь'
    ),
    80
  );

  if char_length(safe_name) < 2 then
    safe_name := 'Пользователь';
  end if;

  insert into public.users (id, email, display_name, role)
  values (new.id, new.email, safe_name, requested_role);

  if requested_role = 'freelancer' then
    safe_slug := lower(
      regexp_replace(
        split_part(coalesce(new.email, 'specialist'), '@', 1),
        '[^a-z0-9]+',
        '-',
        'g'
      )
    );
    safe_slug := trim(both '-' from safe_slug);
    if char_length(safe_slug) < 3 then
      safe_slug := 'specialist';
    end if;

    insert into public.freelancer_profiles (user_id, slug)
    values (new.id, left(safe_slug, 60) || '-' || left(new.id::text, 8));
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.sync_auth_user_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.users
    set email = new.email, updated_at = now()
    where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
after update of email on auth.users
for each row execute function public.sync_auth_user_email();

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
    and (select auth.uid()) is not null
    and coalesce((select auth.role()), '') <> 'service_role'
    and not public.is_admin()
  then
    raise exception 'Role changes require administrator privileges';
  end if;
  return new;
end;
$$;

create trigger users_prevent_role_escalation
before update of role on public.users
for each row execute function public.prevent_role_escalation();

create or replace function public.enforce_order_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  privileged boolean;
begin
  privileged :=
    (select auth.uid()) is null
    or coalesce((select auth.role()), '') = 'service_role'
    or public.is_admin();

  if new.customer_id is distinct from old.customer_id then
    raise exception 'Order customer is immutable';
  end if;

  if not privileged then
    if new.assigned_freelancer_id is distinct from old.assigned_freelancer_id then
      raise exception 'Order assignment requires trusted server code';
    end if;

    if new.status is distinct from old.status and not (
      (old.status = 'draft' and new.status in ('open', 'cancelled'))
      or (old.status = 'open' and new.status = 'cancelled')
    ) then
      raise exception 'Invalid customer order status transition';
    end if;

    if old.status <> 'draft' and (
      new.service_id is distinct from old.service_id
      or new.currency is distinct from old.currency
      or new.budget_min_minor is distinct from old.budget_min_minor
      or new.budget_max_minor is distinct from old.budget_max_minor
    ) then
      raise exception 'Published order financial terms are immutable';
    end if;
  end if;

  return new;
end;
$$;

create trigger orders_enforce_update
before update on public.orders
for each row execute function public.enforce_order_update();

create or replace function public.enforce_proposal_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  privileged boolean;
begin
  privileged :=
    (select auth.uid()) is null
    or coalesce((select auth.role()), '') = 'service_role'
    or public.is_admin();

  if new.order_id is distinct from old.order_id
    or new.freelancer_id is distinct from old.freelancer_id
  then
    raise exception 'Proposal parties are immutable';
  end if;

  if not privileged
    and new.status is distinct from old.status
    and new.status <> 'withdrawn'
  then
    raise exception 'Only withdrawal is available to the proposal author';
  end if;

  return new;
end;
$$;

create trigger proposals_enforce_update
before update on public.proposals
for each row execute function public.enforce_proposal_update();

create or replace function public.touch_conversation_from_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set last_message_at = new.created_at, updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
after insert on public.messages
for each row execute function public.touch_conversation_from_message();

create or replace function public.enforce_review_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.deal_id is distinct from old.deal_id
    or new.reviewer_id is distinct from old.reviewer_id
    or new.reviewee_id is distinct from old.reviewee_id
  then
    raise exception 'Review parties and deal are immutable';
  end if;
  return new;
end;
$$;

create trigger reviews_enforce_update
before update on public.reviews
for each row execute function public.enforce_review_update();

create or replace function public.refresh_freelancer_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
begin
  target_user_id := coalesce(new.reviewee_id, old.reviewee_id);

  update public.freelancer_profiles fp
  set
    rating = aggregates.average_rating,
    reviews_count = aggregates.total_reviews,
    updated_at = now()
  from (
    select
      coalesce(avg(r.rating), 0)::numeric(3,2) as average_rating,
      count(*)::integer as total_reviews
    from public.reviews r
    where r.reviewee_id = target_user_id
      and r.is_public = true
  ) aggregates
  where fp.user_id = target_user_id;

  return coalesce(new, old);
end;
$$;

create trigger reviews_refresh_freelancer_rating
after insert or update or delete on public.reviews
for each row execute function public.refresh_freelancer_rating();

alter table public.users enable row level security;
alter table public.freelancer_profiles enable row level security;
alter table public.services enable row level security;
alter table public.orders enable row level security;
alter table public.proposals enable row level security;
alter table public.deals enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.disputes enable row level security;
alter table public.transactions enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.device_tokens enable row level security;

create policy "users_select_self_or_admin"
on public.users for select to authenticated
using ((select auth.uid()) = id or (select public.is_admin()));

create policy "users_update_self_or_admin"
on public.users for update to authenticated
using ((select auth.uid()) = id or (select public.is_admin()))
with check ((select auth.uid()) = id or (select public.is_admin()));

create policy "profiles_public_read"
on public.freelancer_profiles for select to anon, authenticated
using (
  is_published
  or (select auth.uid()) = user_id
  or (select public.is_admin())
);

create policy "profiles_owner_insert"
on public.freelancer_profiles for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and (select public.current_app_role()) = 'freelancer'
);

create policy "profiles_owner_update"
on public.freelancer_profiles for update to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()))
with check ((select auth.uid()) = user_id or (select public.is_admin()));

create policy "services_catalog_read"
on public.services for select to anon, authenticated
using (
  status = 'published'
  or (select auth.uid()) = freelancer_id
  or (select public.is_admin())
);

create policy "services_freelancer_insert"
on public.services for insert to authenticated
with check (
  (select auth.uid()) = freelancer_id
  and (select public.current_app_role()) = 'freelancer'
);

create policy "services_owner_update"
on public.services for update to authenticated
using ((select auth.uid()) = freelancer_id or (select public.is_admin()))
with check ((select auth.uid()) = freelancer_id or (select public.is_admin()));

create policy "services_owner_delete_draft"
on public.services for delete to authenticated
using (
  ((select auth.uid()) = freelancer_id and status = 'draft')
  or (select public.is_admin())
);

create policy "orders_marketplace_read"
on public.orders for select to anon, authenticated
using (
  status = 'open'
  or (select auth.uid()) = customer_id
  or (select auth.uid()) = assigned_freelancer_id
  or (select public.is_admin())
);

create policy "orders_customer_insert"
on public.orders for insert to authenticated
with check (
  (select auth.uid()) = customer_id
  and (select public.current_app_role()) = 'customer'
);

create policy "orders_customer_update"
on public.orders for update to authenticated
using ((select auth.uid()) = customer_id or (select public.is_admin()))
with check ((select auth.uid()) = customer_id or (select public.is_admin()));

create policy "orders_customer_delete_draft"
on public.orders for delete to authenticated
using (
  ((select auth.uid()) = customer_id and status = 'draft')
  or (select public.is_admin())
);

create policy "proposals_parties_read"
on public.proposals for select to authenticated
using (
  (select auth.uid()) = freelancer_id
  or exists (
    select 1 from public.orders o
    where o.id = order_id and o.customer_id = (select auth.uid())
  )
  or (select public.is_admin())
);

create policy "proposals_freelancer_insert"
on public.proposals for insert to authenticated
with check (
  (select auth.uid()) = freelancer_id
  and (select public.current_app_role()) = 'freelancer'
  and exists (
    select 1 from public.orders o
    where o.id = order_id
      and o.status = 'open'
      and o.customer_id <> (select auth.uid())
  )
);

create policy "proposals_freelancer_update_pending"
on public.proposals for update to authenticated
using (
  ((select auth.uid()) = freelancer_id and status = 'pending')
  or (select public.is_admin())
)
with check (
  (select auth.uid()) = freelancer_id
  or (select public.is_admin())
);

create policy "deals_parties_read"
on public.deals for select to authenticated
using (
  (select auth.uid()) in (customer_id, freelancer_id)
  or (select public.is_admin())
);

create policy "conversations_members_read"
on public.conversations for select to authenticated
using (
  (select public.is_conversation_member(id))
  or (select public.is_admin())
);

create policy "conversations_authenticated_create"
on public.conversations for insert to authenticated
with check (
  (select auth.uid()) = created_by
  and (
    kind <> 'deal'
    or (deal_id is not null and (select public.is_deal_party(deal_id)))
  )
);

create policy "conversation_participants_members_read"
on public.conversation_participants for select to authenticated
using (
  (select public.is_conversation_member(conversation_id))
  or (select public.is_admin())
);

create policy "conversation_participants_creator_add"
on public.conversation_participants for insert to authenticated
with check (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (
        c.created_by = (select auth.uid())
        or (select public.is_conversation_member(c.id))
        or (select public.is_admin())
      )
      and (
        c.kind <> 'deal'
        or exists (
          select 1
          from public.deals d
          where d.id = c.deal_id
            and user_id in (d.customer_id, d.freelancer_id)
        )
      )
  )
);

create policy "conversation_participants_self_update"
on public.conversation_participants for update to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()))
with check (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "messages_members_read"
on public.messages for select to authenticated
using (
  (select public.is_conversation_member(conversation_id))
  or (select public.is_admin())
);

create policy "messages_members_send"
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and (select public.is_conversation_member(conversation_id))
  and kind <> 'system'
);

create policy "messages_sender_update"
on public.messages for update to authenticated
using (sender_id = (select auth.uid()) or (select public.is_admin()))
with check (sender_id = (select auth.uid()) or (select public.is_admin()));

create policy "reviews_public_read"
on public.reviews for select to anon, authenticated
using (is_public or reviewer_id = (select auth.uid()) or reviewee_id = (select auth.uid()) or (select public.is_admin()));

create policy "reviews_completed_deal_insert"
on public.reviews for insert to authenticated
with check (
  reviewer_id = (select auth.uid())
  and exists (
    select 1 from public.deals d
    where d.id = deal_id
      and d.status = 'completed'
      and reviewer_id in (d.customer_id, d.freelancer_id)
      and reviewee_id in (d.customer_id, d.freelancer_id)
      and reviewer_id <> reviewee_id
  )
);

create policy "reviews_author_update"
on public.reviews for update to authenticated
using (reviewer_id = (select auth.uid()) or (select public.is_admin()))
with check (reviewer_id = (select auth.uid()) or (select public.is_admin()));

create policy "disputes_parties_read"
on public.disputes for select to authenticated
using (
  (select public.is_deal_party(deal_id))
  or (select public.is_admin())
);

create policy "disputes_party_insert"
on public.disputes for insert to authenticated
with check (
  opened_by = (select auth.uid())
  and (select public.is_deal_party(deal_id))
);

create policy "disputes_admin_update"
on public.disputes for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "transactions_parties_read"
on public.transactions for select to authenticated
using (
  (deal_id is not null and (select public.is_deal_party(deal_id)))
  or user_id = (select auth.uid())
  or (select public.is_admin())
);

create policy "reports_reporter_or_admin_read"
on public.reports for select to authenticated
using (reporter_id = (select auth.uid()) or (select public.is_admin()));

create policy "reports_authenticated_insert"
on public.reports for insert to authenticated
with check (reporter_id = (select auth.uid()));

create policy "reports_admin_update"
on public.reports for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "notifications_owner_read"
on public.notifications for select to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "notifications_owner_update"
on public.notifications for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "device_tokens_owner_all"
on public.device_tokens for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;
grant select on public.freelancer_profiles, public.services, public.orders, public.reviews
  to anon;
grant select on all tables in schema public to authenticated;
grant insert, update on public.users to authenticated;
grant insert, update on public.freelancer_profiles to authenticated;
grant insert, update, delete on public.services to authenticated;
grant insert, update, delete on public.orders to authenticated;
grant insert, update on public.proposals to authenticated;
grant insert on public.conversations to authenticated;
grant insert, update on public.conversation_participants to authenticated;
grant insert, update on public.messages to authenticated;
grant insert, update on public.reviews to authenticated;
grant insert, update on public.disputes to authenticated;
grant insert, update on public.reports to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant insert, update, delete on public.device_tokens to authenticated;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.is_deal_party(uuid) to authenticated;

-- Supabase projects may have permissive default privileges on new public tables.
-- Revoke sensitive mutations explicitly, then grant only the required columns.
revoke all on public.users from anon;
revoke insert, delete, update on public.users from authenticated;
grant update (display_name, avatar_url, phone, locale, last_seen_at)
  on public.users to authenticated;
revoke update on public.freelancer_profiles from authenticated;
grant update (
  slug,
  headline,
  bio,
  skills,
  languages,
  country_code,
  timezone,
  experience_years,
  hourly_rate_minor,
  currency,
  is_available,
  is_published
) on public.freelancer_profiles to authenticated;
revoke insert, update, delete on public.deals from anon, authenticated;
revoke insert, update, delete on public.transactions from anon, authenticated;
revoke all on public.payment_webhook_events from anon, authenticated;
revoke insert, delete, update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;
revoke update on public.messages from authenticated;
grant update (body, attachment_url, edited_at, deleted_at)
  on public.messages to authenticated;
revoke update on public.conversation_participants from authenticated;
grant update (last_read_at, muted_until, left_at)
  on public.conversation_participants to authenticated;
revoke update on public.reviews from authenticated;
grant update (rating, body, is_public) on public.reviews to authenticated;

alter table public.messages replica identity full;
alter table public.notifications replica identity full;
alter table public.deals replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'deals'
  ) then
    alter publication supabase_realtime add table public.deals;
  end if;
end
$$;

commit;
