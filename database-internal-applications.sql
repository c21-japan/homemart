-- 社内申請テーブルの作成
CREATE TABLE IF NOT EXISTS internal_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  application_type VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 有給・病気休暇用フィールド
  start_date DATE,
  end_date DATE,
  days INTEGER,
  reason TEXT,
  symptoms TEXT,
  doctor_note_file VARCHAR(500), -- 医師の診断書ファイルパス
  
  -- 経費申請用フィールド
  expense_date DATE,
  amount DECIMAL(10,2),
  category VARCHAR(100),
  expense_item VARCHAR(200),
  receipt_file VARCHAR(500), -- レシート・領収書ファイルパス
  payment_method VARCHAR(50),
  parking_related BOOLEAN DEFAULT false,
  expense_salesperson VARCHAR(100),
  expense_site_type VARCHAR(50),
  expense_site_name VARCHAR(200),
  expense_site_address VARCHAR(300),
  expense_customer_name VARCHAR(100),
  expense_work_type VARCHAR(100),
  
  -- その他共通フィールド
  urgency VARCHAR(20) DEFAULT 'normal'
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_internal_applications_type ON internal_applications(application_type);
CREATE INDEX IF NOT EXISTS idx_internal_applications_status ON internal_applications(status);
CREATE INDEX IF NOT EXISTS idx_internal_applications_created_at ON internal_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_internal_applications_employee ON internal_applications(employee_name);

-- コメントの追加
COMMENT ON TABLE internal_applications IS '社内申請テーブル';
COMMENT ON COLUMN internal_applications.employee_name IS '申請者名';
COMMENT ON COLUMN internal_applications.application_type IS '申請種別（paid_leave, sick_leave, expense, other）';
COMMENT ON COLUMN internal_applications.description IS '詳細説明';
COMMENT ON COLUMN internal_applications.status IS 'ステータス（pending, approved, rejected）';
COMMENT ON COLUMN internal_applications.created_at IS '申請作成日時';
COMMENT ON COLUMN internal_applications.start_date IS '開始日（休暇申請用）';
COMMENT ON COLUMN internal_applications.end_date IS '終了日（休暇申請用）';
COMMENT ON COLUMN internal_applications.days IS '日数（休暇申請用）';
COMMENT ON COLUMN internal_applications.reason IS '申請理由';
COMMENT ON COLUMN internal_applications.symptoms IS '症状・病名（病気休暇用）';
COMMENT ON COLUMN internal_applications.doctor_note_file IS '医師の診断書ファイルパス（病気休暇用）';
COMMENT ON COLUMN internal_applications.expense_date IS '経費発生日（経費申請用）';
COMMENT ON COLUMN internal_applications.amount IS '金額（経費申請用）';
COMMENT ON COLUMN internal_applications.category IS '経費カテゴリ（経費申請用）';
COMMENT ON COLUMN internal_applications.expense_item IS '経費の品目・内容（経費申請用）';
COMMENT ON COLUMN internal_applications.receipt_file IS 'レシート・領収書ファイルパス（経費申請用）';
COMMENT ON COLUMN internal_applications.payment_method IS '支払い方法（経費申請用）';
COMMENT ON COLUMN internal_applications.parking_related IS '駐車場関連経費かどうか（経費申請用）';
COMMENT ON COLUMN internal_applications.expense_salesperson IS '関連営業担当（経費申請用）';
COMMENT ON COLUMN internal_applications.expense_site_type IS '現場種別（経費申請用）';
COMMENT ON COLUMN internal_applications.expense_site_name IS '現場名（経費申請用）';
COMMENT ON COLUMN internal_applications.expense_site_address IS '現場住所（経費申請用）';
COMMENT ON COLUMN internal_applications.expense_customer_name IS '顧客名（経費申請用）';
COMMENT ON COLUMN internal_applications.expense_work_type IS '作業種別（経費申請用）';
COMMENT ON COLUMN internal_applications.urgency IS '緊急度（low, normal, high, urgent）';

-- サンプルデータの挿入（テスト用）
INSERT INTO internal_applications (
  employee_name,
  application_type,
  description,
  status,
  start_date,
  end_date,
  days,
  reason,
  created_at
) VALUES 
(
  '豊田',
  'paid_leave',
  '夏季有給休暇の申請です。',
  'pending',
  '2025-08-15',
  '2025-08-17',
  3,
  '夏季休暇のため、家族で沖縄旅行を予定しています。',
  NOW() - INTERVAL '2 days'
),
(
  '今津',
  'sick_leave',
  '風邪による病気休暇の申請です。',
  'approved',
  '2025-01-20',
  '2025-01-22',
  3,
  '風邪の症状が悪化し、医師から2日間の自宅療養を指示されました。',
  NOW() - INTERVAL '5 days'
),
(
  '山尾',
  'expense',
  '会議用備品購入費の申請です。',
  'pending',
  NULL,
  NULL,
  NULL,
  '顧客プレゼンテーションの準備のため、会議室の備品を購入しました。',
  NOW() - INTERVAL '3 days'
);

-- RLSポリシーの設定（必要に応じて）
-- ALTER TABLE internal_applications ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシー
-- CREATE POLICY "Admin can manage all applications" ON internal_applications
--   FOR ALL USING (auth.role() = 'admin');

-- 従業員は自分の申請のみ閲覧可能なポリシー
-- CREATE POLICY "Employees can view own applications" ON internal_applications
--   FOR SELECT USING (auth.email() = employee_email);
