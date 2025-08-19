-- シフト申請システムのセットアップと改修（修正版）
-- テーブルの作成順序を依存関係に合わせて修正

-- 1. まず依存関係のないテーブルから作成
-- part_time_employeesテーブルの作成（最初に作成）
CREATE TABLE IF NOT EXISTS part_time_employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. shift_requestsテーブルの作成（part_time_employeesに依存）
CREATE TABLE IF NOT EXISTS shift_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES part_time_employees(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('shift_request', 'availability', 'time_off')),
  start_date DATE, -- NULL許容に変更
  end_date DATE,   -- NULL許容に変更
  start_time TIME,
  end_time TIME,
  total_hours DECIMAL(4,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  notes TEXT,
  request_scope TEXT DEFAULT 'availability', -- 新規追加
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. shift_request_detailsテーブルの作成（shift_requestsに依存）
CREATE TABLE IF NOT EXISTS shift_request_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_request_id UUID NOT NULL REFERENCES shift_requests(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  hours DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_shift_requests_employee_id ON shift_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_requests_date_range ON shift_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_shift_requests_status ON shift_requests(status);
CREATE INDEX IF NOT EXISTS idx_shift_request_details_date ON shift_request_details(date);

-- 5. 重複防止用のユニークインデックスを追加
CREATE UNIQUE INDEX IF NOT EXISTS ux_shift_detail_unique
ON shift_request_details(employee_id, date, start_time, end_time);

-- 6. RLS（Row Level Security）の有効化
ALTER TABLE part_time_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_request_details ENABLE ROW LEVEL SECURITY;

-- 7. 管理者のみアクセス可能なポリシー
CREATE POLICY "管理者のみアクセス可能_part_time_employees" ON part_time_employees
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "管理者のみアクセス可能_shifts" ON shift_requests
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "管理者のみアクセス可能_shift_details" ON shift_request_details
  FOR ALL USING (auth.role() = 'authenticated');

-- 8. サンプルデータの挿入（テスト用）
INSERT INTO part_time_employees (name, email, phone, position) VALUES
  ('テスト従業員1', 'test1@example.com', '090-1234-5678', 'アルバイト'),
  ('テスト従業員2', 'test2@example.com', '090-8765-4321', 'アルバイト')
ON CONFLICT DO NOTHING;

-- 9. テーブル作成確認
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('shift_requests', 'shift_request_details', 'part_time_employees')
ORDER BY table_name, ordinal_position;

-- 10. インデックス確認
SELECT 
  indexname, 
  tablename, 
  indexdef 
FROM pg_indexes 
WHERE tablename IN ('shift_requests', 'shift_request_details', 'part_time_employees')
ORDER BY tablename, indexname;
