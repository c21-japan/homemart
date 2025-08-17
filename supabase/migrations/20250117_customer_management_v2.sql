-- 顧客管理システム v2.0 完全版
-- センチュリー21ホームマート用
-- 作成日: 2025-01-17

-- 既存テーブルのクリーンアップ（安全に）
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS seller_details CASCADE;
DROP TABLE IF EXISTS buyer_details CASCADE;
DROP TABLE IF EXISTS reform_projects CASCADE;
DROP TABLE IF EXISTS reform_costs CASCADE;
DROP TABLE IF EXISTS checklists CASCADE;
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;

-- ENUM定義
DROP TYPE IF EXISTS customer_category CASCADE;
DROP TYPE IF EXISTS property_type CASCADE;
DROP TYPE IF EXISTS source_type CASCADE;
DROP TYPE IF EXISTS brokerage_type CASCADE;
DROP TYPE IF EXISTS comm_channel CASCADE;
DROP TYPE IF EXISTS reform_status CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;

CREATE TYPE customer_category AS ENUM ('seller', 'buyer', 'reform');
CREATE TYPE property_type AS ENUM ('mansion', 'land', 'house');
CREATE TYPE source_type AS ENUM ('flyer', 'lp', 'suumo', 'homes', 'referral', 'walk_in', 'repeat', 'other');
CREATE TYPE brokerage_type AS ENUM ('exclusive_right', 'exclusive', 'general');
CREATE TYPE comm_channel AS ENUM ('email', 'postal', 'line', 'phone');
CREATE TYPE reform_status AS ENUM ('inquiry', 'estimating', 'proposing', 'negotiating', 'contracted', 'preparing', 'started', 'completed', 'aftercare', 'lost');
CREATE TYPE priority_level AS ENUM ('urgent', 'high', 'medium', 'low');

-- 顧客マスタ
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category customer_category NOT NULL,
  
  -- 基本情報
  name TEXT NOT NULL,
  name_kana TEXT,
  phone TEXT,
  phone_secondary TEXT,
  email TEXT,
  line_id TEXT,
  
  -- 住所情報
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  address TEXT,
  building TEXT,
  
  -- 流入・担当
  source source_type NOT NULL DEFAULT 'other',
  source_detail TEXT,
  first_contact_date DATE DEFAULT CURRENT_DATE,
  assignee_user_id TEXT, -- Clerk User ID
  assignee_name TEXT,    -- キャッシュ用
  
  -- ステータス
  is_active BOOLEAN DEFAULT true,
  is_vip BOOLEAN DEFAULT false,
  priority priority_level DEFAULT 'medium',
  
  -- メタ情報
  tags TEXT[],
  notes TEXT,
  
  -- システム
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT,
  
  -- インデックス用
  search_text TEXT GENERATED ALWAYS AS (
    LOWER(COALESCE(name, '') || ' ' || 
          COALESCE(name_kana, '') || ' ' || 
          COALESCE(phone, '') || ' ' || 
          COALESCE(email, ''))
  ) STORED
);

-- 物件情報
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  property_type property_type NOT NULL,
  
  -- 共通項目
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  address TEXT NOT NULL,
  
  -- マンション専用
  mansion_name TEXT,
  room_number TEXT,
  floor_number INTEGER,
  total_floors INTEGER,
  
  -- 土地専用
  land_number TEXT,      -- 地番
  land_category TEXT,    -- 地目
  land_area DECIMAL(10,2),
  building_coverage DECIMAL(5,2), -- 建ぺい率
  floor_area_ratio DECIMAL(5,2),  -- 容積率
  
  -- 戸建専用
  building_area DECIMAL(10,2),
  number_of_floors INTEGER,
  floor_plan TEXT,       -- 間取り（3LDK等）
  
  -- 共通詳細
  built_year INTEGER,
  built_month INTEGER,
  area DECIMAL(10,2),    -- 専有面積/土地面積
  balcony_area DECIMAL(10,2),
  
  -- 駅情報
  nearest_station TEXT,
  station_distance INTEGER, -- 徒歩分数
  
  -- 評価情報
  assessed_value DECIMAL(12,0),    -- 評価額
  market_value DECIMAL(12,0),      -- 市場価格
  
  -- その他
  management_company TEXT,
  management_fee DECIMAL(10,0),
  repair_fund DECIMAL(10,0),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 売却詳細
CREATE TABLE seller_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- 売却条件
  desired_price DECIMAL(12,0),
  minimum_price DECIMAL(12,0),
  reason_for_sale TEXT,
  urgency priority_level DEFAULT 'medium',
  
  -- 媒介契約
  transaction_type TEXT CHECK (transaction_type IN ('purchase', 'brokerage')), -- 買取/仲介
  brokerage_type brokerage_type,
  brokerage_start_date DATE,
  brokerage_end_date DATE,
  contract_number TEXT,
  
  -- 報告設定
  report_channel comm_channel DEFAULT 'email',
  report_frequency INTEGER, -- 日数（7=週1、14=2週に1回）
  last_reported_at TIMESTAMPTZ,
  next_report_due DATE,
  
  -- 活動記録
  viewing_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  negotiation_count INTEGER DEFAULT 0,
  
  -- 売却進捗
  listed_price DECIMAL(12,0),
  listed_date DATE,
  contract_date DATE,
  settlement_date DATE,
  sold_price DECIMAL(12,0),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 購入詳細
CREATE TABLE buyer_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- 希望条件
  preferred_areas TEXT[],
  budget_min DECIMAL(12,0),
  budget_max DECIMAL(12,0),
  
  -- 物件条件
  preferred_property_types property_type[],
  min_area DECIMAL(10,2),
  max_building_age INTEGER,
  required_floor_plan TEXT,
  
  -- 詳細条件
  conditions JSONB DEFAULT '{}',
  must_have_features TEXT[],
  nice_to_have_features TEXT[],
  
  -- 資金計画
  self_funds DECIMAL(12,0),
  loan_amount DECIMAL(12,0),
  pre_approved BOOLEAN DEFAULT false,
  bank_name TEXT,
  
  -- マッチング
  matched_property_ids UUID[],
  interested_property_ids UUID[],
  rejected_property_ids UUID[],
  
  -- 進捗
  first_viewing_date DATE,
  offer_submitted_date DATE,
  contract_date DATE,
  settlement_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- リフォーム案件
CREATE TABLE reform_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- 案件情報
  project_number TEXT UNIQUE,
  is_existing_customer BOOLEAN DEFAULT false,
  referrer_customer_id UUID REFERENCES customers(id),
  
  -- 依頼内容
  requested_works TEXT[],
  work_details JSONB DEFAULT '{}',
  
  -- 金額
  estimated_amount DECIMAL(12,0),
  quoted_amount DECIMAL(12,0),
  contracted_amount DECIMAL(12,0),
  final_amount DECIMAL(12,0),
  
  -- ステータス
  status reform_status DEFAULT 'inquiry',
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  
  -- スケジュール
  survey_date DATE,          -- 現地調査日
  quote_submitted_date DATE,
  contract_date DATE,
  start_date DATE,
  scheduled_end_date DATE,
  actual_end_date DATE,
  warranty_end_date DATE,
  
  -- 担当者
  sales_user_id TEXT,
  project_manager_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- リフォーム原価
CREATE TABLE reform_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES reform_projects(id) ON DELETE CASCADE,
  
  -- 原価内訳
  material_cost DECIMAL(12,0) DEFAULT 0,
  labor_cost DECIMAL(12,0) DEFAULT 0,
  outsourcing_cost DECIMAL(12,0) DEFAULT 0,
  equipment_cost DECIMAL(12,0) DEFAULT 0,
  transport_cost DECIMAL(12,0) DEFAULT 0,
  other_cost DECIMAL(12,0) DEFAULT 0,
  
  -- 計算フィールド
  total_cost DECIMAL(12,0) GENERATED ALWAYS AS (
    COALESCE(material_cost, 0) + 
    COALESCE(labor_cost, 0) + 
    COALESCE(outsourcing_cost, 0) + 
    COALESCE(equipment_cost, 0) + 
    COALESCE(transport_cost, 0) + 
    COALESCE(other_cost, 0)
  ) STORED,
  
  -- 詳細
  cost_breakdown JSONB DEFAULT '{}',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- チェックリスト
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  template_id UUID,
  category customer_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  due_date DATE,
  priority priority_level DEFAULT 'medium',
  
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- チェックリスト項目
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  
  sort_order INTEGER DEFAULT 0,
  label TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  
  is_checked BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ,
  checked_by TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ドキュメント管理
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  file_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  
  is_template BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- リマインダー・通知
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  
  scheduled_at TIMESTAMPTZ NOT NULL,
  channel comm_channel DEFAULT 'email',
  recipient TEXT,
  
  priority priority_level DEFAULT 'medium',
  
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  
  payload JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 活動ログ
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  
  old_value JSONB,
  new_value JSONB,
  
  user_id TEXT,
  user_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス（パフォーマンス最適化）
CREATE INDEX idx_customers_category ON customers(category);
CREATE INDEX idx_customers_assignee ON customers(assignee_user_id);
CREATE INDEX idx_customers_search ON customers USING gin(search_text gin_trgm_ops);
CREATE INDEX idx_customers_active ON customers(is_active) WHERE is_active = true;

CREATE INDEX idx_properties_customer ON properties(customer_id);
CREATE INDEX idx_properties_type ON properties(property_type);

CREATE INDEX idx_seller_details_customer ON seller_details(customer_id);
CREATE INDEX idx_seller_details_report_due ON seller_details(next_report_due) WHERE next_report_due IS NOT NULL;

CREATE INDEX idx_buyer_details_customer ON buyer_details(customer_id);

CREATE INDEX idx_reform_projects_customer ON reform_projects(customer_id);
CREATE INDEX idx_reform_projects_status ON reform_projects(status);

CREATE INDEX idx_checklists_due ON checklists(due_date, is_completed) WHERE is_completed = false;

CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_at, is_sent) WHERE is_sent = false;

CREATE INDEX idx_activity_logs_customer ON activity_logs(customer_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_atトリガー
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_seller_details_updated_at BEFORE UPDATE ON seller_details FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_buyer_details_updated_at BEFORE UPDATE ON buyer_details FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_reform_projects_updated_at BEFORE UPDATE ON reform_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 媒介契約終了日自動設定
CREATE OR REPLACE FUNCTION set_brokerage_end_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.brokerage_start_date IS NOT NULL AND NEW.brokerage_end_date IS NULL THEN
    NEW.brokerage_end_date = NEW.brokerage_start_date + INTERVAL '3 months' - INTERVAL '1 day';
  END IF;
  
  -- 報告頻度の自動設定
  IF NEW.brokerage_type = 'exclusive_right' THEN
    NEW.report_frequency = 7;  -- 週1回
  ELSIF NEW.brokerage_type = 'exclusive' THEN
    NEW.report_frequency = 14; -- 2週に1回
  ELSE
    NEW.report_frequency = NULL;
  END IF;
  
  -- 次回報告日の設定
  IF NEW.report_frequency IS NOT NULL AND NEW.brokerage_start_date IS NOT NULL THEN
    NEW.next_report_due = NEW.brokerage_start_date + (NEW.report_frequency || ' days')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_brokerage_dates 
BEFORE INSERT OR UPDATE ON seller_details 
FOR EACH ROW EXECUTE FUNCTION set_brokerage_end_date();

-- 活動ログ記録
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (
    customer_id,
    action,
    entity_type,
    entity_id,
    old_value,
    new_value,
    user_id
  ) VALUES (
    COALESCE(NEW.customer_id, OLD.customer_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    current_setting('app.current_user_id', true)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 主要テーブルに活動ログトリガー
CREATE TRIGGER log_customers_activity AFTER INSERT OR UPDATE OR DELETE ON customers FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_seller_details_activity AFTER INSERT OR UPDATE OR DELETE ON seller_details FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_reform_projects_activity AFTER INSERT OR UPDATE OR DELETE ON reform_projects FOR EACH ROW EXECUTE FUNCTION log_activity();

-- RLS（Row Level Security）
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE reform_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reform_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（実運用版）
CREATE POLICY "全員が閲覧可能" ON customers FOR SELECT USING (true);
CREATE POLICY "担当者は自分の顧客を編集可能" ON customers FOR UPDATE USING (assignee_user_id = current_setting('app.current_user_id', true));
CREATE POLICY "管理者は全て編集可能" ON customers FOR ALL USING (current_setting('app.user_role', true) = 'admin');

-- ビュー作成（便利クエリ）
CREATE OR REPLACE VIEW v_customer_summary AS
SELECT 
  c.*,
  p.property_type,
  p.address as property_address,
  
  -- 売却情報
  sd.transaction_type,
  sd.brokerage_type,
  sd.desired_price,
  sd.next_report_due,
  
  -- 購入情報  
  bd.budget_min,
  bd.budget_max,
  
  -- リフォーム情報
  rp.status as reform_status,
  rp.contracted_amount,
  rc.total_cost,
  (rp.contracted_amount - rc.total_cost) as gross_profit,
  
  -- チェックリスト
  (SELECT COUNT(*) FROM checklists WHERE customer_id = c.id AND is_completed = false) as pending_tasks
  
FROM customers c
LEFT JOIN properties p ON p.customer_id = c.id
LEFT JOIN seller_details sd ON sd.customer_id = c.id
LEFT JOIN buyer_details bd ON bd.customer_id = c.id
LEFT JOIN reform_projects rp ON rp.customer_id = c.id
LEFT JOIN reform_costs rc ON rc.project_id = rp.id;

-- 完了メッセージ
SELECT '顧客管理システム v2.0 データベース設計完了！' as status;
