-- 顧客情報管理用テーブル（新仕様）

-- 既存のテーブルを削除（データがある場合は注意）
DROP TABLE IF EXISTS lead_attachments CASCADE;
DROP TABLE IF EXISTS lead_history CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- 顧客リードテーブル
CREATE TABLE IF NOT EXISTS public.customer_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('purchase','sell','reform')), -- 購入/売却/リフォーム
  source TEXT,                      -- 取得経路（現地/電話/紹介/チラシ/サイト 等）
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name_kana TEXT,
  first_name_kana TEXT,
  email TEXT,
  phone TEXT,
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  address1 TEXT,
  address2 TEXT,
  residence_structure TEXT,         -- 居住形態（持家/賃貸/社宅 等）
  household TEXT,                   -- 家族構成メモ
  note TEXT,                        -- 備考
  extra JSONB NOT NULL DEFAULT '{}'::jsonb, -- 用途別の追加項目を格納
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb, -- 写真等の添付（Supabase Storageのパス配列）
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','won','lost')),
  assigned_to UUID REFERENCES auth.users(id),
  location JSONB DEFAULT NULL -- 位置情報（緯度・経度）
);

-- 媒介契約テーブル（売却時のみ）
CREATE TABLE IF NOT EXISTS public.listing_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.customer_leads(id) ON DELETE CASCADE,
  property_id UUID,                          -- 物件テーブルがあれば参照
  contract_type TEXT NOT NULL CHECK (contract_type IN ('専属専任','専任','一般')),
  signed_at DATE NOT NULL,                   -- 媒介契約締結日
  reins_required_by DATE,                    -- レインズ登録期限（専属専任=5営業日, 専任=7営業日）
  reins_registered_at DATE,
  report_interval_days INTEGER NOT NULL,     -- 専属専任=7, 専任=14, 一般=0
  next_report_date DATE,                     -- 次回自動送信予定日
  last_report_sent_at TIMESTAMPTZ,
  report_channel TEXT DEFAULT 'email',       -- email / LINE等（将来拡張）
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 送信ログテーブル
CREATE TABLE IF NOT EXISTS public.listing_report_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.listing_agreements(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  to_email TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb, -- 閲覧数/反響/内見数等
  success BOOLEAN NOT NULL DEFAULT true,
  error TEXT
);

-- 画像メタテーブル（オリジナル＆AI加工の両方）
CREATE TABLE IF NOT EXISTS public.lead_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.customer_leads(id) ON DELETE CASCADE,
  slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 30),
  category TEXT NOT NULL,                    -- 外観/間取り/リビング/...（固定カテゴリと一致）
  original_path TEXT NOT NULL,               -- Supabase Storage パス
  enhanced_path TEXT,                        -- 自動補正済み
  staged_path TEXT,                          -- バーチャル演出済み
  processing_status TEXT NOT NULL DEFAULT 'queued' CHECK (processing_status IN ('queued','enhanced','staged','error')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_customer_leads_updated ON public.customer_leads;
CREATE TRIGGER trg_customer_leads_updated BEFORE UPDATE ON public.customer_leads
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_listing_agreements_updated ON public.listing_agreements;
CREATE TRIGGER trg_listing_agreements_updated BEFORE UPDATE ON public.listing_agreements
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_customer_leads_type ON customer_leads(type);
CREATE INDEX IF NOT EXISTS idx_customer_leads_status ON customer_leads(status);
CREATE INDEX IF NOT EXISTS idx_customer_leads_created_at ON customer_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_leads_assigned_to ON customer_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_customer_leads_created_by ON customer_leads(created_by);
CREATE INDEX IF NOT EXISTS idx_customer_leads_name ON customer_leads(last_name, first_name);

CREATE INDEX IF NOT EXISTS idx_listing_agreements_lead_id ON listing_agreements(lead_id);
CREATE INDEX IF NOT EXISTS idx_listing_agreements_next_report_date ON listing_agreements(next_report_date);
CREATE INDEX IF NOT EXISTS idx_listing_agreements_reins_required_by ON listing_agreements(reins_required_by);
CREATE INDEX IF NOT EXISTS idx_listing_agreements_status ON listing_agreements(status);

CREATE INDEX IF NOT EXISTS idx_lead_photos_lead_id ON lead_photos(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_photos_slot ON lead_photos(slot);
CREATE INDEX IF NOT EXISTS idx_lead_photos_category ON lead_photos(category);

-- RLS（Row Level Security）の有効化
ALTER TABLE public.customer_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_report_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_photos ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "staff can select own and admin can select all"
ON public.customer_leads FOR SELECT
USING (
  auth.role() = 'admin' OR created_by = auth.uid() OR assigned_to = auth.uid()
);

CREATE POLICY "staff can insert self"
ON public.customer_leads FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "staff can update own and admin all"
ON public.customer_leads FOR UPDATE
USING (auth.role() = 'admin' OR created_by = auth.uid() OR assigned_to = auth.uid())
WITH CHECK (auth.role() = 'admin' OR created_by = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "admin can delete all"
ON public.customer_leads FOR DELETE
USING (auth.role() = 'admin');

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

-- 送信ログのRLSポリシー
CREATE POLICY "staff can select own and admin can select all"
ON public.listing_report_logs FOR SELECT
USING (
  auth.role() = 'admin' OR 
  EXISTS (
    SELECT 1 FROM public.listing_agreements la 
    JOIN public.customer_leads cl ON la.lead_id = cl.id 
    WHERE la.id = agreement_id AND (cl.created_by = auth.uid() OR cl.assigned_to = auth.uid())
  )
);

CREATE POLICY "staff can insert self"
ON public.listing_report_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listing_agreements la 
    JOIN public.customer_leads cl ON la.lead_id = cl.id 
    WHERE la.id = agreement_id AND cl.created_by = auth.uid()
  )
);

-- 画像のRLSポリシー
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

-- チェックリスト管理テーブル
CREATE TABLE IF NOT EXISTS public.customer_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.customer_leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('seller', 'buyer', 'reform')), -- 売主・買主・リフォーム
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- チェックリスト項目の配列
  progress_percentage INTEGER NOT NULL DEFAULT 0, -- 進捗率（0-100）
  total_items INTEGER NOT NULL DEFAULT 0, -- 総項目数
  completed_items INTEGER NOT NULL DEFAULT 0, -- 完了項目数
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- チェックリスト項目の詳細テーブル
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES public.customer_checklists(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL, -- 項目の識別キー
  label TEXT NOT NULL, -- 表示ラベル
  checked BOOLEAN NOT NULL DEFAULT false, -- チェック状態
  completed_at TIMESTAMPTZ, -- 完了日時
  note TEXT, -- 備考
  file_path TEXT, -- 添付ファイルのパス
  required BOOLEAN NOT NULL DEFAULT true, -- 必須項目かどうか
  order_index INTEGER NOT NULL, -- 表示順序
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- チェックリストファイル添付テーブル
CREATE TABLE IF NOT EXISTS public.checklist_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES public.customer_checklists(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, -- Supabase Storageのパス
  file_name TEXT NOT NULL, -- オリジナルファイル名
  file_size INTEGER NOT NULL, -- ファイルサイズ（バイト）
  file_type TEXT NOT NULL, -- MIMEタイプ
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_customer_checklists_updated ON public.customer_checklists;
CREATE TRIGGER trg_customer_checklists_updated BEFORE UPDATE ON public.customer_checklists
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_checklist_items_updated ON public.checklist_items;
CREATE TRIGGER trg_checklist_items_updated BEFORE UPDATE ON public.checklist_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_customer_checklists_lead_id ON customer_checklists(lead_id);
CREATE INDEX IF NOT EXISTS idx_customer_checklists_type ON customer_checklists(type);
CREATE INDEX IF NOT EXISTS idx_customer_checklists_progress ON customer_checklists(progress_percentage);

CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checked ON checklist_items(checked);
CREATE INDEX IF NOT EXISTS idx_checklist_items_order ON checklist_items(order_index);

CREATE INDEX IF NOT EXISTS idx_checklist_attachments_checklist_id ON checklist_attachments(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_attachments_item_id ON checklist_attachments(item_id);

-- RLS（Row Level Security）の有効化
ALTER TABLE public.customer_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_attachments ENABLE ROW LEVEL SECURITY;

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

-- 通知履歴テーブル
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- checklist_completion, incomplete_reminder, deadline_alert
  reference_id TEXT NOT NULL, -- 関連するID
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  recipients TEXT NOT NULL, -- カンマ区切りのメールアドレス
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  error TEXT
);

-- 通知履歴のインデックス
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_reference_id ON notification_logs(reference_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at DESC);

-- 通知履歴のRLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can manage all notifications"
ON public.notification_logs FOR ALL
USING (auth.role() = 'admin');

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

-- LINEユーザーのインデックス
CREATE INDEX IF NOT EXISTS idx_line_users_line_user_id ON line_users(line_user_id);

-- LINEユーザーのRLS
ALTER TABLE public.line_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can manage all line users"
ON public.line_users FOR ALL
USING (auth.role() = 'admin');

-- 音声記録管理テーブル
CREATE TABLE IF NOT EXISTS public.audio_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.customer_leads(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, -- Supabase Storageのパス
  file_name TEXT NOT NULL, -- オリジナルファイル名
  file_size INTEGER NOT NULL, -- ファイルサイズ（バイト）
  transcription TEXT, -- 音声認識結果
  context TEXT, -- 録音時の状況・メモ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 音声記録のインデックス
CREATE INDEX IF NOT EXISTS idx_audio_records_lead_id ON audio_records(lead_id);
CREATE INDEX IF NOT EXISTS idx_audio_records_created_at ON audio_records(created_at DESC);

-- 音声記録のRLS
ALTER TABLE public.audio_records ENABLE ROW LEVEL SECURITY;

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

-- サンプルデータの挿入（テスト用）
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
  '{"budget": 50000000, "desired_area": "奈良市", "layout": "3LDK", "move_in_timing": "2025年春", "loan_preapproved": true}',
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
  '{"property_type": "一戸建て", "building_name": "佐藤邸", "land_size": 150, "floor_area": 120, "year_built": "2000", "expected_price": 45000000, "psychological_defect": false, "parking_state": "有", "current_status": "occupied"}',
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
  '{"target_rooms": ["キッチン", "リビング"], "wish_items": ["システムキッチン", "フローリング"], "rough_budget": 8000000, "desired_deadline": "2025年3月", "visit_request": true}',
  'won',
  'キッチンのリフォームを希望。予算内で対応可能。'
);

-- ユーザーサブスクリプションテーブル（Web Push用）
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage own subscriptions"
ON public.user_subscriptions FOR ALL
USING (user_id = auth.uid());
