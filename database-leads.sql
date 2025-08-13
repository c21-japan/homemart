-- リード（顧客情報）管理用テーブル

-- リード基本情報テーブル
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  lead_type TEXT NOT NULL CHECK (lead_type IN ('purchase', 'sell', 'reform')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'won', 'lost')),
  source TEXT, -- リードの獲得元（Webサイト、紹介、DM等）
  budget_min DECIMAL(12,0), -- 予算下限
  budget_max DECIMAL(12,0), -- 予算上限
  preferred_area TEXT, -- 希望エリア
  property_type TEXT, -- 希望物件種別
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  notes TEXT, -- 備考・詳細
  assigned_staff TEXT, -- 担当スタッフ
  next_action TEXT, -- 次のアクション
  next_action_date DATE, -- 次のアクション予定日
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- リード履歴テーブル（コミュニケーション履歴）
CREATE TABLE IF NOT EXISTS lead_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('call', 'email', 'meeting', 'visit', 'proposal', 'other')),
  action_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  summary TEXT NOT NULL, -- アクションの概要
  details TEXT, -- 詳細内容
  next_action TEXT, -- 次のアクション
  next_action_date DATE, -- 次のアクション予定日
  created_by TEXT, -- 実行者
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- リードファイル添付テーブル
CREATE TABLE IF NOT EXISTS lead_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by TEXT
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_staff ON leads(assigned_staff);
CREATE INDEX IF NOT EXISTS idx_leads_next_action_date ON leads(next_action_date);
CREATE INDEX IF NOT EXISTS idx_lead_history_lead_id ON lead_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_history_action_date ON lead_history(action_date DESC);
CREATE INDEX IF NOT EXISTS idx_lead_attachments_lead_id ON lead_attachments(lead_id);

-- RLS（Row Level Security）の有効化
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_attachments ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシー
CREATE POLICY "管理者のみアクセス可能_leads" ON leads
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "管理者のみアクセス可能_lead_history" ON lead_history
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "管理者のみアクセス可能_lead_attachments" ON lead_attachments
  FOR ALL USING (auth.role() = 'authenticated');

-- 更新時のタイムスタンプ自動更新のためのトリガー関数
CREATE OR REPLACE FUNCTION update_leads_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at_column();

-- サンプルデータの挿入（テスト用）
INSERT INTO leads (
  name,
  email,
  phone,
  lead_type,
  status,
  source,
  budget_min,
  budget_max,
  preferred_area,
  property_type,
  urgency,
  notes,
  assigned_staff,
  next_action,
  next_action_date
) VALUES 
(
  '田中太郎',
  'tanaka@example.com',
  '090-1234-5678',
  'purchase',
  'new',
  'Webサイト',
  30000000,
  50000000,
  '奈良市',
  'マンション',
  'high',
  '3LDKのマンションを探している。駅から徒歩10分以内希望。',
  '山田',
  '物件情報の送付',
  CURRENT_DATE + INTERVAL '3 days'
),
(
  '佐藤花子',
  'sato@example.com',
  '080-9876-5432',
  'sell',
  'in_progress',
  '紹介',
  40000000,
  60000000,
  '生駒市',
  '一戸建て',
  'normal',
  '築20年の一戸建てを売却希望。リフォーム済み。',
  '鈴木',
  '現地調査の実施',
  CURRENT_DATE + INTERVAL '1 week'
),
(
  '高橋次郎',
  'takahashi@example.com',
  '070-5555-1234',
  'reform',
  'won',
  'DM',
  5000000,
  8000000,
  '大和郡山市',
  'リフォーム',
  'low',
  'キッチンのリフォームを希望。予算内で対応可能。',
  '田中',
  '工事日程の調整',
  CURRENT_DATE + INTERVAL '2 weeks'
);

-- サンプル履歴データの挿入
INSERT INTO lead_history (
  lead_id,
  action_type,
  summary,
  details,
  next_action,
  next_action_date,
  created_by
) VALUES 
(
  (SELECT id FROM leads WHERE name = '田中太郎' LIMIT 1),
  'call',
  '初回電話相談',
  '物件の希望条件を詳しくヒアリング。予算と希望エリアを確認。',
  '物件情報の送付',
  CURRENT_DATE + INTERVAL '3 days',
  '山田'
),
(
  (SELECT id FROM leads WHERE name = '佐藤花子' LIMIT 1),
  'meeting',
  '現地調査の実施',
  '物件の現状を確認。写真撮影と詳細な調査を実施。',
  '査定額の算出',
  CURRENT_DATE + INTERVAL '1 week',
  '鈴木'
);
