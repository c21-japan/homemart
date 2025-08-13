-- アルバイト勤怠管理システム用テーブル

-- アルバイト従業員テーブル
CREATE TABLE IF NOT EXISTS part_time_employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  position TEXT DEFAULT 'アルバイト',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- アルバイト勤怠記録テーブル
CREATE TABLE IF NOT EXISTS part_time_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES part_time_employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in_time TIMESTAMP WITH TIME ZONE,
  clock_out_time TIMESTAMP WITH TIME ZONE,
  clock_in_location POINT, -- GPS座標 (緯度, 経度)
  clock_out_location POINT, -- GPS座標 (緯度, 経度)
  clock_in_address TEXT, -- 住所情報
  clock_out_address TEXT, -- 住所情報
  total_hours DECIMAL(4,2), -- 総勤務時間（時間）
  notes TEXT, -- 備考
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 同じ従業員の同じ日付で複数レコードが作成されないように制約
  UNIQUE(employee_id, date)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_part_time_attendance_employee_id ON part_time_attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_part_time_attendance_date ON part_time_attendance(date);
CREATE INDEX IF NOT EXISTS idx_part_time_attendance_employee_date ON part_time_attendance(employee_id, date);

-- RLS（Row Level Security）の有効化
ALTER TABLE part_time_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_time_attendance ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシー（part_time_employees）
CREATE POLICY "管理者のみアクセス可能_employees" ON part_time_employees
  FOR ALL USING (auth.role() = 'authenticated');

-- 管理者のみアクセス可能なポリシー（part_time_attendance）
CREATE POLICY "管理者のみアクセス可能_attendance" ON part_time_attendance
  FOR ALL USING (auth.role() = 'authenticated');

-- 更新時のタイムスタンプ自動更新のためのトリガー関数（既存のものを使用）
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_part_time_employees_updated_at
  BEFORE UPDATE ON part_time_employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_part_time_attendance_updated_at
  BEFORE UPDATE ON part_time_attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入
INSERT INTO part_time_employees (name, email, phone, position) VALUES
  ('カドタニ', 'kadotani@example.com', '080-1234-5678', 'アルバイト'),
  ('トヤマ', 'toyama@example.com', '080-8765-4321', 'アルバイト')
ON CONFLICT DO NOTHING;

-- 勤怠記録のサンプルデータ（過去1週間分）
INSERT INTO part_time_attendance (employee_id, date, clock_in_time, clock_out_time, total_hours, notes) VALUES
  ((SELECT id FROM part_time_employees WHERE name = 'カドタニ'), CURRENT_DATE - INTERVAL '6 days', 
   (CURRENT_DATE - INTERVAL '6 days') + INTERVAL '9 hours', 
   (CURRENT_DATE - INTERVAL '6 days') + INTERVAL '17 hours', 8.0, '通常勤務'),
  ((SELECT id FROM part_time_employees WHERE name = 'トヤマ'), CURRENT_DATE - INTERVAL '6 days', 
   (CURRENT_DATE - INTERVAL '6 days') + INTERVAL '10 hours', 
   (CURRENT_DATE - INTERVAL '6 days') + INTERVAL '18 hours', 8.0, '通常勤務'),
  ((SELECT id FROM part_time_employees WHERE name = 'カドタニ'), CURRENT_DATE - INTERVAL '5 days', 
   (CURRENT_DATE - INTERVAL '5 days') + INTERVAL '9 hours', 
   (CURRENT_DATE - INTERVAL '5 days') + INTERVAL '17 hours', 8.0, '通常勤務'),
  ((SELECT id FROM part_time_employees WHERE name = 'トヤマ'), CURRENT_DATE - INTERVAL '5 days', 
   (CURRENT_DATE - INTERVAL '5 days') + INTERVAL '10 hours', 
   (CURRENT_DATE - INTERVAL '5 days') + INTERVAL '18 hours', 8.0, '通常勤務'),
  ((SELECT id FROM part_time_employees WHERE name = 'カドタニ'), CURRENT_DATE - INTERVAL '4 days', 
   (CURRENT_DATE - INTERVAL '4 days') + INTERVAL '9 hours', 
   (CURRENT_DATE - INTERVAL '4 days') + INTERVAL '17 hours', 8.0, '通常勤務'),
  ((SELECT id FROM part_time_employees WHERE name = 'トヤマ'), CURRENT_DATE - INTERVAL '4 days', 
   (CURRENT_DATE - INTERVAL '4 days') + INTERVAL '10 hours', 
   (CURRENT_DATE - INTERVAL '4 days') + INTERVAL '18 hours', 8.0, '通常勤務'),
  ((SELECT id FROM part_time_employees WHERE name = 'カドタニ'), CURRENT_DATE - INTERVAL '3 days', 
   (CURRENT_DATE - INTERVAL '3 days') + INTERVAL '9 hours', 
   (CURRENT_DATE - INTERVAL '3 days') + INTERVAL '17 hours', 8.0, '通常勤務'),
  ((SELECT id FROM part_time_employees WHERE name = 'トヤマ'), CURRENT_DATE - INTERVAL '3 days', 
   (CURRENT_DATE - INTERVAL '3 days') + INTERVAL '10 hours', 
   (CURRENT_DATE - INTERVAL '3 days') + INTERVAL '18 hours', 8.0, '通常勤務'),
  ((SELECT id FROM part_time_employees WHERE name = 'カドタニ'), CURRENT_DATE - INTERVAL '2 days', 
   (CURRENT_DATE - INTERVAL '2 days') + INTERVAL '9 hours', 
   (CURRENT_DATE - INTERVAL '2 days') + INTERVAL '17 hours', 8.0, '通常勤務'),
  ((SELECT id FROM part_time_employees WHERE name = 'トヤマ'), CURRENT_DATE - INTERVAL '2 days', 
   (CURRENT_DATE - INTERVAL '2 days') + INTERVAL '10 hours', 
   (CURRENT_DATE - INTERVAL '2 days') + INTERVAL '18 hours', 8.0, '通常勤務'),
  ((SELECT id FROM part_time_employees WHERE name = 'カドタニ'), CURRENT_DATE - INTERVAL '1 day', 
   (CURRENT_DATE - INTERVAL '1 day') + INTERVAL '9 hours', 
   (CURRENT_DATE - INTERVAL '1 day') + INTERVAL '17 hours', 8.0, '通常勤務'),
  ((SELECT id FROM part_time_employees WHERE name = 'トヤマ'), CURRENT_DATE - INTERVAL '1 day', 
   (CURRENT_DATE - INTERVAL '1 day') + INTERVAL '10 hours', 
   (CURRENT_DATE - INTERVAL '1 day') + INTERVAL '18 hours', 8.0, '通常勤務')
ON CONFLICT DO NOTHING;
