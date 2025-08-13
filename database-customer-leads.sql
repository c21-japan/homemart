-- 顧客情報管理テーブルの作成
-- 用途：購入/売却/リフォームの顧客情報を管理

-- テーブル：customer_leads
create table if not exists public.customer_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  type text not null check (type in ('purchase','sell','reform')), -- 購入/売却/リフォーム
  source text,                      -- 取得経路（現地/電話/紹介/チラシ/サイト 等）
  last_name text not null,
  first_name text not null,
  last_name_kana text,
  first_name_kana text,
  email text,
  phone text,
  postal_code text,
  prefecture text,
  city text,
  address1 text,
  address2 text,
  residence_structure text,         -- 居住形態（持家/賃貸/社宅 等）
  household text,                   -- 家族構成メモ
  note text,                        -- 備考
  extra jsonb not null default '{}'::jsonb, -- 用途別の追加項目を格納
  attachments jsonb not null default '[]'::jsonb, -- 写真等の添付（Supabase Storageのパス配列）
  status text not null default 'new' check (status in ('new','in_progress','won','lost')),
  assigned_to uuid references auth.users(id)
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_customer_leads_updated on public.customer_leads;
create trigger trg_customer_leads_updated before update on public.customer_leads
for each row execute function public.set_updated_at();

-- RLS
alter table public.customer_leads enable row level security;

create policy "staff can select own and admin can select all"
on public.customer_leads for select
using (
  auth.role() = 'admin' or created_by = auth.uid() or assigned_to = auth.uid()
);

create policy "staff can insert self"
on public.customer_leads for insert
with check (created_by = auth.uid());

create policy "staff can update own and admin all"
on public.customer_leads for update
using (auth.role() = 'admin' or created_by = auth.uid() or assigned_to = auth.uid())
with check (auth.role() = 'admin' or created_by = auth.uid() or assigned_to = auth.uid());

-- インデックス
create index if not exists idx_customer_leads_type on public.customer_leads(type);
create index if not exists idx_customer_leads_status on public.customer_leads(status);
create index if not exists idx_customer_leads_created_at on public.customer_leads(created_at);
create index if not exists idx_customer_leads_assigned_to on public.customer_leads(assigned_to);
create index if not exists idx_customer_leads_created_by on public.customer_leads(created_by);

-- 用途別 extra の想定キー例
-- purchase（購入）：budget, desired_area, layout, move_in_timing, loan_preapproved など
-- sell（売却）：property_type, building_name, room_no, land_size, floor_area, year_built, remaining_loan, expected_price, psychological_defect, parking_state, hoa_fee, reason, current_status など
-- reform（リフォーム）：target_rooms[], wish_items[], rough_budget, desired_deadline, visit_request など
