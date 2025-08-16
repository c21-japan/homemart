-- 顧客管理システム データベーススキーマ
-- 2025-01-01 作成

-- enums
create type customer_category as enum ('seller','buyer','reform');
create type property_type   as enum ('mansion','land','house');
create type source_type     as enum ('flyer','lp','suumo','homes','referral','other');
create type brokerage_type  as enum ('exclusive_right','exclusive','general'); -- 専属専任/専任/一般
create type comm_channel    as enum ('email','postal');
create type reform_status   as enum ('estimating','proposing','contracted','started','completed','aftercare');
create type checklist_type  as enum ('seller','buyer','reform');

-- 顧客
create table customers (
  id uuid primary key default gen_random_uuid(),
  category customer_category not null,
  name text not null,
  name_kana text,
  phone text,
  email text,
  address text,
  source source_type,
  assignee_user_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 物件
create table properties (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  property_type property_type not null,
  address text,
  mansion_name text,
  room_no text,
  land_info text, -- 地番・地目等
  building_area numeric,
  floor_plan text,
  built_year int,
  area numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 売却詳細
create table seller_details (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid unique references customers(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  desired_price numeric,
  brokerage brokerage_type,        -- 媒介種別
  brokerage_start date,
  brokerage_end date,              -- start+3ヶ月−1日（トリガで自動補完）
  report_channel comm_channel,     -- email/postal
  purchase_or_brokerage text check (purchase_or_brokerage in ('買取','仲介')),
  last_reported_at timestamptz,    -- 直近報告日
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 購入詳細
create table buyer_details (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid unique references customers(id) on delete cascade,
  preferred_area text,
  budget_min numeric,
  budget_max numeric,
  conditions jsonb,
  finance_plan jsonb,
  interested_property_id uuid references properties(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- リフォーム案件
create table reform_projects (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  property_id uuid references properties(id),
  is_existing_customer boolean default false,
  requested_works text[],
  expected_revenue numeric,
  status reform_status default 'estimating',
  progress_percent int default 0 check (progress_percent between 0 and 100),
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 原価
create table reform_costs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references reform_projects(id) on delete cascade,
  material_cost numeric default 0,
  outsourcing_cost numeric default 0,
  travel_cost numeric default 0,
  other_cost numeric default 0,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- チェックリスト
create table checklists (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  type checklist_type not null,
  title text not null,
  due_date date,
  is_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid references checklists(id) on delete cascade,
  label text not null,
  is_checked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 書類
create table documents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  kind text,                 -- 'report_letter','contract' 等
  meta jsonb,
  file_path text,            -- Supabase Storage キー
  created_at timestamptz default now()
);

-- 通知キュー
create table reminders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  title text,
  scheduled_at timestamptz,  -- 送信予定 UTC（JST換算で計算）
  sent_at timestamptz,
  channel comm_channel,
  payload jsonb,
  priority int default 0,
  created_at timestamptz default now()
);

-- パフォーマンス用インデックス
create index idx_customers_category on customers(category);
create index idx_customers_assignee on customers(assignee_user_id);
create index idx_properties_customer on properties(customer_id);
create index idx_seller_details_customer on seller_details(customer_id);
create index idx_buyer_details_customer on buyer_details(customer_id);
create index idx_reform_projects_customer on reform_projects(customer_id);
create index idx_checklists_due on checklists(due_date, is_completed);
create index idx_reminders_schedule on reminders(scheduled_at, sent_at);
create index idx_seller_details_brokerage_end on seller_details(brokerage_end);
create index idx_seller_details_last_reported on seller_details(last_reported_at);

-- 媒介終了日自動補完: startが入り、end未入力なら start+interval '3 months' - interval '1 day'
create or replace function set_brokerage_end()
returns trigger as $$
begin
  if (new.brokerage_start is not null) and (new.brokerage_end is null) then
    new.brokerage_end := (new.brokerage_start + interval '3 months' - interval '1 day')::date;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_brokerage_end
before insert or update on seller_details
for each row execute function set_brokerage_end();

-- RLS（Row Level Security）ポリシー
alter table customers enable row level security;
alter table properties enable row level security;
alter table seller_details enable row level security;
alter table buyer_details enable row level security;
alter table reform_projects enable row level security;
alter table reform_costs enable row level security;
alter table checklists enable row level security;
alter table checklist_items enable row level security;
alter table documents enable row level security;
alter table reminders enable row level security;

-- 管理者は全件RW、スタッフは担当顧客のみRW
create policy "管理者は全件RW" on customers
  for all using (auth.jwt() ->> 'role' = 'admin');

create policy "スタッフは担当顧客のみRW" on customers
  for all using (
    assignee_user_id = auth.uid()::text or
    auth.jwt() ->> 'role' = 'admin'
  );

-- 他のテーブルも同様のポリシーを適用
create policy "顧客に基づくアクセス制御" on properties
  for all using (
    customer_id in (
      select id from customers where 
        assignee_user_id = auth.uid()::text or
        auth.jwt() ->> 'role' = 'admin'
    )
  );

create policy "顧客に基づくアクセス制御" on seller_details
  for all using (
    customer_id in (
      select id from customers where 
        assignee_user_id = auth.uid()::text or
        auth.jwt() ->> 'role' = 'admin'
    )
  );

create policy "顧客に基づくアクセス制御" on buyer_details
  for all using (
    customer_id in (
      select id from customers where 
        assignee_user_id = auth.uid()::text or
        auth.jwt() ->> 'role' = 'admin'
    )
  );

create policy "顧客に基づくアクセス制御" on reform_projects
  for all using (
    customer_id in (
      select id from customers where 
        assignee_user_id = auth.uid()::text or
        auth.jwt() ->> 'role' = 'admin'
    )
  );

create policy "顧客に基づくアクセス制御" on reform_costs
  for all using (
    project_id in (
      select id from reform_projects where 
        customer_id in (
          select id from customers where 
            assignee_user_id = auth.uid()::text or
            auth.jwt() ->> 'role' = 'admin'
        )
      )
    )
  );

create policy "顧客に基づくアクセス制御" on checklists
  for all using (
    customer_id in (
      select id from customers where 
        assignee_user_id = auth.uid()::text or
        auth.jwt() ->> 'role' = 'admin'
    )
  );

create policy "顧客に基づくアクセス制御" on checklist_items
  for all using (
    checklist_id in (
      select id from checklists where 
        customer_id in (
          select id from customers where 
            assignee_user_id = auth.uid()::text or
            auth.jwt() ->> 'role' = 'admin'
        )
      )
    )
  );

create policy "顧客に基づくアクセス制御" on documents
  for all using (
    customer_id in (
      select id from customers where 
        assignee_user_id = auth.uid()::text or
        auth.jwt() ->> 'role' = 'admin'
    )
  );

create policy "顧客に基づくアクセス制御" on reminders
  for all using (
    customer_id in (
      select id from customers where 
        assignee_user_id = auth.uid()::text or
        auth.jwt() ->> 'role' = 'admin'
    )
  );

-- 更新日時を自動更新するトリガー
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_customers_updated_at before update on customers
  for each row execute function update_updated_at_column();

create trigger update_properties_updated_at before update on properties
  for each row execute function update_updated_at_column();

create trigger update_seller_details_updated_at before update on seller_details
  for each row execute function update_updated_at_column();

create trigger update_buyer_details_updated_at before update on buyer_details
  for each row execute function update_updated_at_column();

create trigger update_reform_projects_updated_at before update on reform_projects
  for each row execute function update_updated_at_column();

create trigger update_reform_costs_updated_at before update on reform_costs
  for each row execute function update_updated_at_column();

create trigger update_checklists_updated_at before update on checklists
  for each row execute function update_updated_at_column();

create trigger update_checklist_items_updated_at before update on checklist_items
  for each row execute function update_updated_at_column();
