-- 社内申請テーブルの作成
CREATE TABLE IF NOT EXISTS internal_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  application_type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 有給・病気休暇用フィールド
  start_date DATE,
  end_date DATE,
  days INTEGER,
  reason TEXT,
  symptoms TEXT,
  doctor_note BOOLEAN DEFAULT FALSE,
  
  -- 残業申請用フィールド
  date DATE,
  start_time TIME,
  end_time TIME,
  hours DECIMAL(4,2),
  project_name VARCHAR(255),
  approval_required BOOLEAN DEFAULT TRUE,
  
  -- 経費申請用フィールド
  expense_date DATE,
  amount DECIMAL(10,2),
  category VARCHAR(100),
  receipt_attached BOOLEAN DEFAULT FALSE,
  payment_method VARCHAR(50),
  
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
COMMENT ON COLUMN internal_applications.application_type IS '申請種別（paid_leave, sick_leave, overtime, expense, other）';
COMMENT ON COLUMN internal_applications.title IS '申請タイトル';
COMMENT ON COLUMN internal_applications.description IS '詳細説明';
COMMENT ON COLUMN internal_applications.status IS 'ステータス（pending, approved, rejected）';
COMMENT ON COLUMN internal_applications.created_at IS '申請作成日時';
COMMENT ON COLUMN internal_applications.start_date IS '開始日（休暇申請用）';
COMMENT ON COLUMN internal_applications.end_date IS '終了日（休暇申請用）';
COMMENT ON COLUMN internal_applications.days IS '日数（休暇申請用）';
COMMENT ON COLUMN internal_applications.reason IS '申請理由';
COMMENT ON COLUMN internal_applications.symptoms IS '症状・病名（病気休暇用）';
COMMENT ON COLUMN internal_applications.doctor_note IS '医師の診断書添付（病気休暇用）';
COMMENT ON COLUMN internal_applications.date IS '残業日（残業申請用）';
COMMENT ON COLUMN internal_applications.start_time IS '開始時間（残業申請用）';
COMMENT ON COLUMN internal_applications.end_time IS '終了時間（残業申請用）';
COMMENT ON COLUMN internal_applications.hours IS '残業時間（残業申請用）';
COMMENT ON COLUMN internal_applications.project_name IS 'プロジェクト名（残業申請用）';
COMMENT ON COLUMN internal_applications.approval_required IS '事前承認必要（残業申請用）';
COMMENT ON COLUMN internal_applications.expense_date IS '経費発生日（経費申請用）';
COMMENT ON COLUMN internal_applications.amount IS '金額（経費申請用）';
COMMENT ON COLUMN internal_applications.category IS '経費カテゴリ（経費申請用）';
COMMENT ON COLUMN internal_applications.receipt_attached IS 'レシート添付（経費申請用）';
COMMENT ON COLUMN internal_applications.payment_method IS '支払い方法（経費申請用）';
COMMENT ON COLUMN internal_applications.urgency IS '緊急度（low, normal, high, urgent）';

-- サンプルデータの挿入（テスト用）
INSERT INTO internal_applications (
  employee_name,
  application_type,
  title,
  description,
  status,
  start_date,
  end_date,
  days,
  reason,
  created_at
) VALUES 
(
  '田中太郎',
  'paid_leave',
  '夏季有給休暇申請',
  '家族旅行のため夏季有給休暇を申請します。',
  'pending',
  '2025-08-15',
  '2025-08-17',
  3,
  '夏季休暇のため、家族で沖縄旅行を予定しています。',
  NOW() - INTERVAL '2 days'
),
(
  '佐藤花子',
  'sick_leave',
  '風邪による病気休暇申請',
  '発熱と咳の症状があり、医師の指示で自宅療養が必要です。',
  'approved',
  '2025-01-20',
  '2025-01-22',
  3,
  '風邪の症状が悪化し、医師から2日間の自宅療養を指示されました。',
  NOW() - INTERVAL '5 days'
),
(
  '山田次郎',
  'overtime',
  'プロジェクト完了のための残業申請',
  'Webサイトリニューアルプロジェクトの納期が迫っており、品質確保のため残業が必要です。',
  'pending',
  NULL,
  NULL,
  NULL,
  'プロジェクトの納期が迫っており、品質を確保するために残業が必要です。',
  NOW() - INTERVAL '1 day'
),
(
  '鈴木美咲',
  'expense',
  '会議用備品購入費',
  '来週の顧客プレゼンテーション用にホワイトボードとマーカーを購入しました。',
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
