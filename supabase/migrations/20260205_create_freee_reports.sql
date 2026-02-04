-- Create freee_reports table to store uploaded CSV data
CREATE TABLE IF NOT EXISTS public.freee_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by TEXT NOT NULL,
  trial_balance JSONB,
  journal JSONB,
  general_ledger JSONB,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_freee_reports_uploaded_at ON public.freee_reports(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_freee_reports_period ON public.freee_reports(period_start, period_end);

-- Enable Row Level Security
ALTER TABLE public.freee_reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read
CREATE POLICY "Allow authenticated users to read freee reports"
  ON public.freee_reports
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert freee reports"
  ON public.freee_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update their own reports
CREATE POLICY "Allow authenticated users to update freee reports"
  ON public.freee_reports
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add comment
COMMENT ON TABLE public.freee_reports IS 'Stores uploaded freee CSV data (trial balance, journal, general ledger)';
