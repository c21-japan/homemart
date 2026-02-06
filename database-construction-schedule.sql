-- 工程表（カレンダー）用テーブル

CREATE TABLE IF NOT EXISTS construction_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  reform_project_id UUID REFERENCES reform_projects(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  work_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  task_name TEXT NOT NULL,
  site_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE construction_schedules
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

ALTER TABLE construction_schedules
  ADD COLUMN IF NOT EXISTS reform_project_id UUID REFERENCES reform_projects(id) ON DELETE SET NULL;

ALTER TABLE construction_schedules
  ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES staff_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_construction_schedules_work_date
  ON construction_schedules(work_date);

CREATE INDEX IF NOT EXISTS idx_construction_schedules_customer_id
  ON construction_schedules(customer_id);

CREATE INDEX IF NOT EXISTS idx_construction_schedules_reform_project_id
  ON construction_schedules(reform_project_id);

CREATE INDEX IF NOT EXISTS idx_construction_schedules_assignee_id
  ON construction_schedules(assignee_id);

CREATE INDEX IF NOT EXISTS idx_construction_schedules_time_range
  ON construction_schedules(work_date, start_time, end_time);

ALTER TABLE construction_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "管理者のみアクセス可能_construction_schedules" ON construction_schedules
  FOR ALL USING (auth.role() = 'authenticated');
