-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ENUMS
create type user_role as enum ('client', 'admin', 'agent');
create type conversation_status as enum ('active', 'closed');
create type message_type as enum ('text', 'offer', 'system');
create type offer_status as enum ('draft', 'sent', 'accepted', 'paid', 'declined');
create type payment_status as enum ('pending', 'success', 'failed');
create type project_status as enum ('in_progress', 'delivered', 'completed', 'revision');

-- 1. USERS (Extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  role user_role default 'client'::user_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. EXPERTS (Agents profile)
create table public.experts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade unique,
  name text not null,
  category text,
  role_title text,
  bio text,
  skills text[],
  has_fiverr boolean default false,
  has_upwork boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PROJECT BRIEFS
create table public.project_briefs (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.users(id) on delete cascade not null,
  expert_id uuid references public.experts(id) on delete set null,
  title text not null,
  description text not null,
  budget numeric,
  deadline timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. CONVERSATIONS
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.users(id) on delete cascade not null,
  expert_id uuid references public.experts(id) on delete set null,
  assigned_agent_id uuid references public.users(id) on delete set null,
  status conversation_status default 'active'::conversation_status not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. MESSAGES
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete set null,
  sender_role user_role not null,
  content text not null,
  type message_type default 'text'::message_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. OFFERS
create table public.offers (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  client_id uuid references public.users(id) on delete cascade not null,
  expert_id uuid references public.experts(id) on delete set null,
  title text not null,
  description text not null,
  price numeric not null,
  delivery_days integer not null,
  status offer_status default 'draft'::offer_status not null,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. PAYMENTS (Paystack)
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.users(id) on delete cascade not null,
  offer_id uuid references public.offers(id) on delete set null,
  amount numeric not null,
  currency text default 'USD' not null,
  status payment_status default 'pending'::payment_status not null,
  reference text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. PROJECTS
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.users(id) on delete cascade not null,
  expert_id uuid references public.experts(id) on delete set null,
  offer_id uuid references public.offers(id) on delete cascade not null,
  payment_id uuid references public.payments(id) on delete cascade not null,
  status project_status default 'in_progress'::project_status not null,
  delivered_at timestamp with time zone,
  auto_completed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. REVIEWS
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  client_id uuid references public.users(id) on delete cascade not null,
  agent_id uuid references public.users(id) on delete set null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. FILES
create table public.files (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  uploaded_by uuid references public.users(id) on delete set null,
  url text not null,
  file_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. NOTIFICATIONS
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null,
  content text not null,
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. ACTIVITY LOGS
create table public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)
alter table public.users enable row level security;
alter table public.experts enable row level security;
alter table public.project_briefs enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.offers enable row level security;
alter table public.payments enable row level security;
alter table public.projects enable row level security;
alter table public.reviews enable row level security;
alter table public.files enable row level security;
alter table public.notifications enable row level security;

-- Basic RLS Policies (Draft)
-- Users can see their own profile
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
-- Admins can view all profiles
create policy "Admins can view all profiles" on public.users for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Experts are publicly viewable
create policy "Experts are viewable by everyone" on public.experts for select using (true);

-- Clients can view their own projects
create policy "Clients can view own projects" on public.projects for select using (client_id = auth.uid());
-- Admins can view all projects
create policy "Admins can view all projects" on public.projects for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Messages logic: Users can view messages in their conversations
create policy "Users can view messages in their conversations" on public.messages for select using (
  exists (
    select 1 from public.conversations c 
    where c.id = messages.conversation_id 
    and (c.client_id = auth.uid() or c.assigned_agent_id = auth.uid())
  )
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
