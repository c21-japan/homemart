-- Flyer print jobs + distribution range + expense context fields

-- 1) Extend flyer_distributions with range/notes fields
ALTER TABLE IF EXISTS flyer_distributions
  ADD COLUMN IF NOT EXISTS start_point VARCHAR(200),
  ADD COLUMN IF NOT EXISTS end_point VARCHAR(200),
  ADD COLUMN IF NOT EXISTS undistributed_buildings TEXT,
  ADD COLUMN IF NOT EXISTS communication_notes TEXT;

-- 2) Flyer print jobs table
CREATE TABLE IF NOT EXISTS flyer_print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  print_date DATE NOT NULL DEFAULT CURRENT_DATE,
  design_id VARCHAR(50) NOT NULL,
  printer_name VARCHAR(100) NOT NULL,
  range_start INTEGER NOT NULL,
  range_end INTEGER NOT NULL,
  printed_quantity INTEGER NOT NULL DEFAULT 0 CHECK (printed_quantity >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_print_design FOREIGN KEY (design_id) REFERENCES flyer_designs(design_id) ON DELETE CASCADE,
  CONSTRAINT chk_print_range CHECK (range_end >= range_start)
);

CREATE INDEX IF NOT EXISTS idx_print_jobs_date ON flyer_print_jobs(print_date DESC);
CREATE INDEX IF NOT EXISTS idx_print_jobs_design ON flyer_print_jobs(design_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_printer ON flyer_print_jobs(printer_name);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_flyer_print_jobs_updated_at'
  ) THEN
    CREATE TRIGGER update_flyer_print_jobs_updated_at
      BEFORE UPDATE ON flyer_print_jobs
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS policies for flyer_print_jobs
ALTER TABLE flyer_print_jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = '全員が閲覧可能' AND tablename = 'flyer_print_jobs'
  ) THEN
    CREATE POLICY "全員が閲覧可能" ON flyer_print_jobs
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = '認証ユーザーが作成可能' AND tablename = 'flyer_print_jobs'
  ) THEN
    CREATE POLICY "認証ユーザーが作成可能" ON flyer_print_jobs
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = '認証ユーザーが更新可能' AND tablename = 'flyer_print_jobs'
  ) THEN
    CREATE POLICY "認証ユーザーが更新可能" ON flyer_print_jobs
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 3) Extend internal_applications for expense context
ALTER TABLE IF EXISTS internal_applications
  ADD COLUMN IF NOT EXISTS expense_item VARCHAR(200),
  ADD COLUMN IF NOT EXISTS parking_related BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS expense_salesperson VARCHAR(100),
  ADD COLUMN IF NOT EXISTS expense_site_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS expense_site_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS expense_site_address VARCHAR(300),
  ADD COLUMN IF NOT EXISTS expense_customer_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS expense_work_type VARCHAR(100);
