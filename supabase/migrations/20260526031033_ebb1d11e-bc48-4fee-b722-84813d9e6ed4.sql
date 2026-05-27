-- Enums
create type public.app_role as enum ('super_admin', 'admin', 'client');
create type public.project_status as enum ('pending','in-progress','review','completed','on-hold');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  initials text not null default 'US',
  color text not null default 'oklch(0.58 0.18 255)',
  client_id text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- has_role security definer
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- helper: current user's client_id
create or replace function public.current_client_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select client_id from public.profiles where id = auth.uid()
$$;

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client text not null,
  client_id text not null,
  admin_id uuid references public.profiles(id) on delete set null,
  category text not null default 'General',
  status project_status not null default 'pending',
  progress int not null default 0 check (progress between 0 and 100),
  deadline date,
  description text not null default '',
  created_at timestamptz not null default now()
);
alter table public.projects enable row level security;

-- RLS: profiles
create policy "profiles self read" on public.profiles for select to authenticated
  using (id = auth.uid());
create policy "profiles super read all" on public.profiles for select to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));
create policy "profiles admin read all" on public.profiles for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "profiles super insert" on public.profiles for insert to authenticated
  with check (public.has_role(auth.uid(), 'super_admin'));
create policy "profiles super update" on public.profiles for update to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));
create policy "profiles self update" on public.profiles for update to authenticated
  using (id = auth.uid());
create policy "profiles super delete" on public.profiles for delete to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

-- RLS: user_roles
create policy "roles self read" on public.user_roles for select to authenticated
  using (user_id = auth.uid());
create policy "roles super read" on public.user_roles for select to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));
create policy "roles super insert" on public.user_roles for insert to authenticated
  with check (public.has_role(auth.uid(), 'super_admin'));
create policy "roles super update" on public.user_roles for update to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));
create policy "roles super delete" on public.user_roles for delete to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

-- RLS: projects
create policy "projects super all" on public.projects for all to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));
create policy "projects admin read" on public.projects for select to authenticated
  using (public.has_role(auth.uid(), 'admin') and admin_id = auth.uid());
create policy "projects admin update" on public.projects for update to authenticated
  using (public.has_role(auth.uid(), 'admin') and admin_id = auth.uid())
  with check (public.has_role(auth.uid(), 'admin') and admin_id = auth.uid());
create policy "projects client read" on public.projects for select to authenticated
  using (public.has_role(auth.uid(), 'client') and client_id = public.current_client_id());

-- Trigger: auto-create profile + role on signup, reading metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_name text := coalesce(meta->>'name', split_part(new.email, '@', 1));
  v_role app_role := coalesce((meta->>'role')::app_role, 'client');
  v_client_id text := nullif(meta->>'client_id', '');
  v_color text := coalesce(meta->>'color', 'oklch(0.58 0.18 255)');
  v_initials text := coalesce(meta->>'initials', upper(substr(v_name, 1, 2)));
begin
  insert into public.profiles (id, email, name, initials, color, client_id, status)
  values (new.id, new.email, v_name, v_initials, v_color, v_client_id, 'active')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, v_role)
  on conflict (user_id, role) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();