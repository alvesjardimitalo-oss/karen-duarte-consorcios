-- Karen Martins Cosméticos - núcleo V1
create extension if not exists pgcrypto;

create type public.app_role as enum ('SUPER_ADMIN','ADMIN','VENDEDOR_RECEBEDOR','CLIENTE_PAGADOR');
create type public.consortium_status as enum ('FORMACAO','ATIVO','FINALIZADO','CANCELADO');
create type public.installment_status as enum ('A_VENCER','PAGA','VENCIDA','ESTORNADA');
create type public.voucher_status as enum ('DISPONIVEL','PARCIALMENTE_UTILIZADO','UTILIZADO','CANCELADO');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role public.app_role not null default 'CLIENTE_PAGADOR',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  phone text not null unique,
  cpf text unique,
  address text,
  tags text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.consortia (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  participant_limit integer not null check (participant_limit >= 2),
  installment_amount numeric(12,2) not null check (installment_amount > 0),
  duration_months integer not null check (duration_months > 0),
  credit_amount numeric(12,2) generated always as (participant_limit * installment_amount) stored,
  due_day integer not null check (due_day between 1 and 28),
  draw_day integer not null check (draw_day between 1 and 28),
  starts_on date,
  status public.consortium_status not null default 'FORMACAO',
  created_at timestamptz not null default now()
);

create table public.consortium_members (
  id uuid primary key default gen_random_uuid(),
  consortium_id uuid not null references public.consortia(id),
  client_id uuid not null references public.clients(id),
  joined_at timestamptz not null default now(),
  active boolean not null default true,
  unique(consortium_id, client_id)
);

create table public.installments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.consortium_members(id),
  installment_number integer not null check (installment_number > 0),
  due_date date not null,
  amount numeric(12,2) not null check (amount > 0),
  status public.installment_status not null default 'A_VENCER',
  unique(member_id, installment_number)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  installment_id uuid not null references public.installments(id),
  amount numeric(12,2) not null check (amount > 0),
  method text not null default 'PIX',
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id),
  reversed_at timestamptz,
  reversal_reason text,
  created_at timestamptz not null default now()
);

create table public.contemplations (
  id uuid primary key default gen_random_uuid(),
  consortium_id uuid not null references public.consortia(id),
  member_id uuid not null references public.consortium_members(id),
  reference_month integer not null check (reference_month > 0),
  contemplated_at timestamptz not null default now(),
  unique(consortium_id, reference_month),
  unique(consortium_id, member_id)
);

create table public.vouchers (
  id uuid primary key default gen_random_uuid(),
  contemplation_id uuid not null unique references public.contemplations(id),
  original_credit numeric(12,2) not null check (original_credit >= 0),
  consumed_amount numeric(12,2) not null default 0 check (consumed_amount >= 0),
  reserved_amount numeric(12,2) not null default 0 check (reserved_amount >= 0),
  status public.voucher_status not null default 'DISPONIVEL',
  created_at timestamptz not null default now(),
  check (consumed_amount + reserved_amount <= original_credit)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_role() returns public.app_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() and active = true $$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.current_role() in ('SUPER_ADMIN','ADMIN','VENDEDOR_RECEBEDOR'), false) $$;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.consortia enable row level security;
alter table public.consortium_members enable row level security;
alter table public.installments enable row level security;
alter table public.payments enable row level security;
alter table public.contemplations enable row level security;
alter table public.vouchers enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_self_or_staff_read on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy profiles_admin_write on public.profiles for all using (public.current_role() in ('SUPER_ADMIN','ADMIN')) with check (public.current_role() in ('SUPER_ADMIN','ADMIN'));
create policy clients_staff_all on public.clients for all using (public.is_staff()) with check (public.is_staff());
create policy clients_self_read on public.clients for select using (user_id = auth.uid());
create policy consortia_staff_all on public.consortia for all using (public.is_staff()) with check (public.is_staff());
create policy consortia_member_read on public.consortia for select using (exists(select 1 from public.consortium_members m join public.clients c on c.id=m.client_id where m.consortium_id=id and c.user_id=auth.uid() and m.active));
create policy members_staff_all on public.consortium_members for all using (public.is_staff()) with check (public.is_staff());
create policy members_self_read on public.consortium_members for select using (exists(select 1 from public.clients c where c.id=client_id and c.user_id=auth.uid()));
create policy installments_staff_all on public.installments for all using (public.is_staff()) with check (public.is_staff());
create policy installments_self_read on public.installments for select using (exists(select 1 from public.consortium_members m join public.clients c on c.id=m.client_id where m.id=member_id and c.user_id=auth.uid()));
create policy payments_staff_all on public.payments for all using (public.is_staff()) with check (public.is_staff());
create policy payments_self_read on public.payments for select using (exists(select 1 from public.installments i join public.consortium_members m on m.id=i.member_id join public.clients c on c.id=m.client_id where i.id=installment_id and c.user_id=auth.uid()));
create policy contemplations_staff_all on public.contemplations for all using (public.is_staff()) with check (public.is_staff());
create policy contemplations_self_read on public.contemplations for select using (exists(select 1 from public.consortium_members m join public.clients c on c.id=m.client_id where m.id=member_id and c.user_id=auth.uid()));
create policy vouchers_staff_all on public.vouchers for all using (public.is_staff()) with check (public.is_staff());
create policy vouchers_self_read on public.vouchers for select using (exists(select 1 from public.contemplations ct join public.consortium_members m on m.id=ct.member_id join public.clients c on c.id=m.client_id where ct.id=contemplation_id and c.user_id=auth.uid()));
create policy audit_admin_read on public.audit_logs for select using (public.current_role() in ('SUPER_ADMIN','ADMIN'));

-- Após criar a usuária no Supabase Auth com o e-mail abaixo, execute este UPDATE usando o UUID real dela.
-- Não armazenamos senha no repositório.
-- update public.profiles set name='Karen Duarte Martins', email='karenduartemartins@gmail.com', phone='33999628147', role='ADMIN' where id='<UUID_AUTH_KAREN>';
