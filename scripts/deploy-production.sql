-- ホームマート統合システム 本番環境セットアップスクリプト
-- 実行日時: $(date)
-- 環境: Production

-- 1. 基本テーブルの作成
-- 顧客情報管理テーブル
CREATE TABLE IF NOT EXISTS public.customer_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('purchase', 'sell', 'reform')),
  source TEXT,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name_kana TEXT,
  first_name_kana TEXT,
  email TEXT,
  phone TEXT,
  prefecture TEXT,
  city TEXT,
  address1 TEXT,
  address2 TEXT,
  extra JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id),
  location JSONB,
  note TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 媒介契約管理テーブル
CREATE TABLE IF NOT EXISTS public.listing_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.customer_leads(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('専属専任', '専任', '一般')),
  signed_at DATE NOT NULL,
  report_interval_days INTEGER NOT NULL DEFAULT 7,
  next_report_date DATE NOT NULL,
  reins_required_by DATE NOT NULL,
  reins_registered_at DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 物件写真管理テーブル
CREATE TABLE IF NOT EXISTS public.lead_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.customer_leads(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  ai_processed BOOLEAN DEFAULT false,
  ai_corrections JSONB,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- チェックリスト管理テーブル
CREATE TABLE IF NOT EXISTS public.customer_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.customer_leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('seller', 'buyer', 'reform')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- チェックリスト項目の詳細テーブル
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES public.customer_checklists(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  label TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  note TEXT,
  file_path TEXT,
  required BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- チェックリストファイル添付テーブル
CREATE TABLE IF NOT EXISTS public.checklist_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES public.customer_checklists(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- 通知履歴テーブル
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  recipients TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  error TEXT
);

-- LINEユーザー管理テーブル
CREATE TABLE IF NOT EXISTS public.line_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  picture_url TEXT,
  status_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 音声記録管理テーブル
CREATE TABLE IF NOT EXISTS public.audio_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.customer_leads(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  transcription TEXT,
  context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_customer_leads_type ON customer_leads(type);
CREATE INDEX IF NOT EXISTS idx_customer_leads_status ON customer_leads(status);
CREATE INDEX IF NOT EXISTS idx_customer_leads_created_by ON customer_leads(created_by);
CREATE INDEX IF NOT EXISTS idx_customer_leads_assigned_to ON customer_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_customer_leads_created_at ON customer_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_agreements_lead_id ON listing_agreements(lead_id);
CREATE INDEX IF NOT EXISTS idx_listing_agreements_next_report_date ON listing_agreements(next_report_date);
CREATE INDEX IF NOT EXISTS idx_listing_agreements_reins_required_by ON listing_agreements(reins_required_by);
CREATE INDEX IF NOT EXISTS idx_listing_agreements_status ON listing_agreements(status);

CREATE INDEX IF NOT EXISTS idx_lead_photos_lead_id ON lead_photos(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_photos_category ON lead_photos(category);
CREATE INDEX IF NOT EXISTS idx_lead_photos_ai_processed ON lead_photos(ai_processed);

CREATE INDEX IF NOT EXISTS idx_customer_checklists_lead_id ON customer_checklists(lead_id);
CREATE INDEX IF NOT EXISTS idx_customer_checklists_type ON customer_checklists(type);
CREATE INDEX IF NOT EXISTS idx_customer_checklists_progress ON customer_checklists(progress_percentage);

CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checked ON checklist_items(checked);
CREATE INDEX IF NOT EXISTS idx_checklist_items_order ON checklist_items(order_index);

CREATE INDEX IF NOT EXISTS idx_checklist_attachments_checklist_id ON checklist_attachments(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_attachments_item_id ON checklist_attachments(item_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_reference_id ON notification_logs(reference_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_line_users_line_user_id ON line_users(line_user_id);

CREATE INDEX IF NOT EXISTS idx_audio_records_lead_id ON audio_records(lead_id);
CREATE INDEX IF NOT EXISTS idx_audio_records_created_at ON audio_records(created_at DESC);

-- 3. updated_at trigger関数の作成
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. updated_at triggerの設定
DROP TRIGGER IF EXISTS trg_customer_leads_updated ON public.customer_leads;
CREATE TRIGGER trg_customer_leads_updated BEFORE UPDATE ON public.customer_leads
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_listing_agreements_updated ON public.listing_agreements;
CREATE TRIGGER trg_listing_agreements_updated BEFORE UPDATE ON public.listing_agreements
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_customer_checklists_updated ON public.customer_checklists;
CREATE TRIGGER trg_customer_checklists_updated BEFORE UPDATE ON public.customer_checklists
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_checklist_items_updated ON public.checklist_items;
CREATE TRIGGER trg_checklist_items_updated BEFORE UPDATE ON public.checklist_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_line_users_updated ON public.line_users;
CREATE TRIGGER trg_line_users_updated BEFORE UPDATE ON public.line_users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. RLS（Row Level Security）の有効化
ALTER TABLE public.customer_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_records ENABLE ROW LEVEL SECURITY;

-- 6. RLSポリシーの設定
-- 顧客情報のRLSポリシー
CREATE POLICY "staff can select own and admin can select all"
ON public.customer_leads FOR SELECT
USING (
  auth.role() = 'admin' OR 
  created_by = auth.uid() OR 
  assigned_to = auth.uid()
);

CREATE POLICY "staff can insert self"
ON public.customer_leads FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "staff can update own and admin all"
ON public.customer_leads FOR UPDATE
USING (
  auth.role() = 'admin' OR 
  created_by = auth.uid() OR 
  assigned_to = auth.uid()
)
WITH CHECK (
  auth.role() = 'admin' OR 
  created_by = auth.uid()
);

-- 媒介契約のRLSポリシー
CREATE POLICY "staff can select own and admin can select all"
ON public.listing_agreements FOR SELECT
USING (
  auth.role() = 'admin' OR 
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND (created_by = auth.uid() OR assigned_to = auth.uid()))
);

CREATE POLICY "staff can insert self"
ON public.listing_agreements FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND created_by = auth.uid())
);

CREATE POLICY "staff can update own and admin all"
ON public.listing_agreements FOR UPDATE
USING (
  auth.role() = 'admin' OR 
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND (created_by = auth.uid() OR assigned_to = auth.uid()))
)
WITH CHECK (
  auth.role() = 'admin' OR 
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND created_by = auth.uid())
);

-- 物件写真のRLSポリシー
CREATE POLICY "staff can select own and admin can select all"
ON public.lead_photos FOR SELECT
USING (
  auth.role() = 'admin' OR 
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND (created_by = auth.uid() OR assigned_to = auth.uid()))
);

CREATE POLICY "staff can insert self"
ON public.lead_photos FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND created_by = auth.uid())
);

CREATE POLICY "staff can update own and admin all"
ON public.lead_photos FOR UPDATE
USING (
  auth.role() = 'admin' OR 
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND (created_by = auth.uid() OR assigned_to = auth.uid()))
)
WITH CHECK (
  auth.role() = 'admin' OR 
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND created_by = auth.uid())
);

-- チェックリストのRLSポリシー
CREATE POLICY "staff can select own and admin can select all"
ON public.customer_checklists FOR SELECT
USING (
  auth.role() = 'admin' OR 
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND (created_by = auth.uid() OR assigned_to = auth.uid()))
);

CREATE POLICY "staff can insert self"
ON public.customer_checklists FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND created_by = auth.uid())
);

CREATE POLICY "staff can update own and admin all"
ON public.customer_checklists FOR UPDATE
USING (
  auth.role() = 'admin' OR 
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND (created_by = auth.uid() OR assigned_to = auth.uid()))
)
WITH CHECK (
  auth.role() = 'admin' OR 
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND created_by = auth.uid())
);

-- チェックリスト項目のRLSポリシー
CREATE POLICY "staff can select own and admin can select all"
ON public.checklist_items FOR SELECT
USING (
  auth.role() = 'admin' OR 
  EXISTS (
    SELECT 1 FROM public.customer_checklists cc 
    JOIN public.customer_leads cl ON cc.lead_id = cl.id 
    WHERE cc.id = checklist_id AND (cl.created_by = auth.uid() OR cl.assigned_to = auth.uid())
  )
);

CREATE POLICY "staff can insert self"
ON public.checklist_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customer_checklists cc 
    JOIN public.customer_leads cl ON cc.lead_id = cl.id 
    WHERE cc.id = checklist_id AND cl.created_by = auth.uid()
  )
);

CREATE POLICY "staff can update own and admin all"
ON public.checklist_items FOR UPDATE
USING (
  auth.role() = 'admin' OR 
  EXISTS (
    SELECT 1 FROM public.customer_checklists cc 
    JOIN public.customer_leads cl ON cc.lead_id = cl.id 
    WHERE cc.id = checklist_id AND (cl.created_by = auth.uid() OR cl.assigned_to = auth.uid())
  )
)
WITH CHECK (
  auth.role() = 'admin' OR 
  EXISTS (
    SELECT 1 FROM public.customer_checklists cc 
    JOIN public.customer_leads cl ON cc.lead_id = cl.id 
    WHERE cc.id = checklist_id AND cl.created_by = auth.uid()
  )
);

-- チェックリスト添付ファイルのRLSポリシー
CREATE POLICY "staff can select own and admin can select all"
ON public.checklist_attachments FOR SELECT
USING (
  auth.role() = 'admin' OR 
  EXISTS (
    SELECT 1 FROM public.customer_checklists cc 
    JOIN public.customer_leads cl ON cc.lead_id = cl.id 
    WHERE cc.id = checklist_id AND (cl.created_by = auth.uid() OR cl.assigned_to = auth.uid())
  )
);

CREATE POLICY "staff can insert self"
ON public.checklist_attachments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customer_checklists cc 
    JOIN public.customer_leads cl ON cc.lead_id = cl.id 
    WHERE cc.id = checklist_id AND cl.created_by = auth.uid()
  )
);

CREATE POLICY "staff can update own and admin all"
ON public.checklist_attachments FOR UPDATE
USING (
  auth.role() = 'admin' OR 
  EXISTS (
    SELECT 1 FROM public.customer_checklists cc 
    JOIN public.customer_leads cl ON cc.lead_id = cl.id 
    WHERE cc.id = checklist_id AND (cl.created_by = auth.uid() OR cl.assigned_to = auth.uid())
  )
)
WITH CHECK (
  auth.role() = 'admin' OR 
  EXISTS (
    SELECT 1 FROM public.customer_checklists cc 
    JOIN public.customer_leads cl ON cc.lead_id = cl.id 
    WHERE cc.id = checklist_id AND cl.created_by = auth.uid()
  )
);

-- 通知履歴のRLSポリシー
CREATE POLICY "admin can manage all notifications"
ON public.notification_logs FOR ALL
USING (auth.role() = 'admin');

-- LINEユーザーのRLSポリシー
CREATE POLICY "admin can manage all line users"
ON public.line_users FOR ALL
USING (auth.role() = 'admin');

-- 音声記録のRLSポリシー
CREATE POLICY "staff can select own and admin can select all"
ON public.audio_records FOR SELECT
USING (
  auth.role() = 'admin' OR 
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND (created_by = auth.uid() OR assigned_to = auth.uid()))
);

CREATE POLICY "staff can insert self"
ON public.audio_records FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.customer_leads WHERE id = lead_id AND created_by = auth.uid())
);

-- 7. サンプルデータの挿入（本番環境用）
INSERT INTO customer_leads (
  type,
  source,
  last_name,
  first_name,
  last_name_kana,
  first_name_kana,
  email,
  phone,
  prefecture,
  city,
  extra,
  status,
  note
) VALUES 
(
  'purchase',
  'Webサイト',
  '田中',
  '太郎',
  'タナカ',
  'タロウ',
  'tanaka@example.com',
  '090-1234-5678',
  '奈良県',
  '奈良市',
  '{"type": "purchase", "budget": 50000000, "desired_area": "奈良市", "layout": "3LDK", "move_in_timing": "2025年春", "loan_preapproved": true}',
  'new',
  '3LDKのマンションを探している。駅から徒歩10分以内希望。'
),
(
  'sell',
  '紹介',
  '佐藤',
  '花子',
  'サトウ',
  'ハナコ',
  'sato@example.com',
  '080-9876-5432',
  '奈良県',
  '生駒市',
  '{"type": "sell", "property_type": "一戸建て", "building_name": "佐藤邸", "land_size": 150, "floor_area": 120, "year_built": "2000", "expected_price": 45000000, "psychological_defect": false, "parking_state": "有", "current_status": "occupied"}',
  'in_progress',
  '築20年の一戸建てを売却希望。リフォーム済み。'
),
(
  'reform',
  'DM',
  '高橋',
  '次郎',
  'タカハシ',
  'ジロウ',
  'takahashi@example.com',
  '070-5555-1234',
  '奈良県',
  '大和郡山市',
  '{"type": "reform", "target_rooms": ["キッチン", "リビング"], "wish_items": ["システムキッチン", "フローリング"], "rough_budget": 8000000, "desired_deadline": "2025年3月", "visit_request": true}',
  'won',
  'キッチンのリフォームを希望。予算内で対応可能。'
);

-- 8. 完了メッセージ
SELECT 'ホームマート統合システム 本番環境セットアップ完了' as status;
