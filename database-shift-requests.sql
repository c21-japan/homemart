-- シフト申請・管理システム用テーブル

-- シフト申請テーブル
CREATE TABLE IF NOT EXISTS shift_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES part_time_employees(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('shift_request', 'availability', 'time_off')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  total_hours DECIMAL(4,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 日付範囲の制約
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- シフト詳細テーブル（複数日一括申請用）
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

-- 給与設定テーブル
CREATE TABLE IF NOT EXISTS salary_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES part_time_employees(id) ON DELETE CASCADE,
  hourly_rate DECIMAL(8,2) NOT NULL,
  overtime_rate DECIMAL(8,2) DEFAULT 1.25, -- 残業時の倍率
  holiday_rate DECIMAL(8,2) DEFAULT 1.35, -- 祝日の倍率
  effective_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 給与計算テーブル
CREATE TABLE IF NOT EXISTS salary_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES part_time_employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_regular_hours DECIMAL(6,2) DEFAULT 0,
  total_overtime_hours DECIMAL(6,2) DEFAULT 0,
  total_holiday_hours DECIMAL(6,2) DEFAULT 0,
  regular_pay DECIMAL(10,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  holiday_pay DECIMAL(10,2) DEFAULT 0,
  total_pay DECIMAL(10,2) DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 年月の組み合わせは一意
  UNIQUE(employee_id, year, month)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_shift_requests_employee_id ON shift_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_requests_date_range ON shift_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_shift_requests_status ON shift_requests(status);
CREATE INDEX IF NOT EXISTS idx_shift_request_details_date ON shift_request_details(date);
CREATE INDEX IF NOT EXISTS idx_salary_settings_employee_id ON salary_settings(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_calculations_employee_year_month ON salary_calculations(employee_id, year, month);

-- RLS（Row Level Security）の有効化
ALTER TABLE shift_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_request_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_calculations ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシー
CREATE POLICY "管理者のみアクセス可能_shifts" ON shift_requests
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "管理者のみアクセス可能_shift_details" ON shift_request_details
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "管理者のみアクセス可能_salary_settings" ON salary_settings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "管理者のみアクセス可能_salary_calculations" ON salary_calculations
  FOR ALL USING (auth.role() = 'authenticated');

-- 更新時のタイムスタンプ自動更新のためのトリガー
CREATE TRIGGER update_shift_requests_updated_at
  BEFORE UPDATE ON shift_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salary_settings_updated_at
  BEFORE UPDATE ON salary_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入
INSERT INTO salary_settings (employee_id, hourly_rate, effective_date) VALUES
  ((SELECT id FROM part_time_employees WHERE name = 'カドタニ'), 1000, CURRENT_DATE),
  ((SELECT id FROM part_time_employees WHERE name = 'トヤマ'), 1000, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- シフト申請のサンプルデータ
INSERT INTO shift_requests (employee_id, request_type, start_date, end_date, start_time, end_time, total_hours, status, notes) VALUES
  ((SELECT id FROM part_time_employees WHERE name = 'カドタニ'), 'shift_request', CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days', '09:00:00', '17:00:00', 24.0, 'approved', '来週のシフト申請'),
  ((SELECT id FROM part_time_employees WHERE name = 'トヤマ'), 'shift_request', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '4 days', '10:00:00', '18:00:00', 24.0, 'pending', '来週のシフト申請')
ON CONFLICT DO NOTHING;

-- シフト詳細のサンプルデータ
INSERT INTO shift_request_details (shift_request_id, date, start_time, end_time, hours) VALUES
  ((SELECT id FROM shift_requests WHERE employee_id = (SELECT id FROM part_time_employees WHERE name = 'カドタニ') LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '09:00:00', '17:00:00', 8.0),
  ((SELECT id FROM shift_requests WHERE employee_id = (SELECT id FROM part_time_employees WHERE name = 'カドタニ') LIMIT 1), CURRENT_DATE + INTERVAL '2 days', '09:00:00', '17:00:00', 8.0),
  ((SELECT id FROM shift_requests WHERE employee_id = (SELECT id FROM part_time_employees WHERE name = 'カドタニ') LIMIT 1), CURRENT_DATE + INTERVAL '3 days', '09:00:00', '17:00:00', 8.0),
  ((SELECT id FROM shift_requests WHERE employee_id = (SELECT id FROM part_time_employees WHERE name = 'トヤマ') LIMIT 1), CURRENT_DATE + INTERVAL '2 days', '10:00:00', '18:00:00', 8.0),
  ((SELECT id FROM shift_requests WHERE employee_id = (SELECT id FROM part_time_employees WHERE name = 'トヤマ') LIMIT 1), CURRENT_DATE + INTERVAL '3 days', '10:00:00', '18:00:00', 8.0),
  ((SELECT id FROM shift_requests WHERE employee_id = (SELECT id FROM part_time_employees WHERE name = 'トヤマ') LIMIT 1), CURRENT_DATE + INTERVAL '4 days', '10:00:00', '18:00:00', 8.0)
ON CONFLICT DO NOTHING;
