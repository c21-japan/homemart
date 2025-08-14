-- FP（ファイナンシャルプランナー）関連フィールドの追加
-- 顧客情報管理テーブルにFP関連の項目を追加

-- customer_leadsテーブルにFP関連のフィールドを追加
ALTER TABLE public.customer_leads 
ADD COLUMN IF NOT EXISTS fp_info JSONB DEFAULT '{}'::jsonb;

-- FP情報の構造例（JSONBで柔軟に管理）
-- {
--   "fp_assigned": "FP担当者名",
--   "fp_company": "FP会社名",
--   "fp_contact_date": "2024-01-01",
--   "financial_goals": ["住宅購入", "老後資金準備"],
--   "current_assets": {
--     "savings": 10000000,
--     "investments": 5000000,
--     "insurance": 20000000
--   },
--   "monthly_income": 500000,
--   "monthly_expenses": 300000,
--   "loan_amount": 30000000,
--   "loan_terms": 35,
--   "interest_rate": 0.8,
--   "repayment_method": "元金均等返済",
--   "fp_notes": "FP担当者からの備考",
--   "next_fp_meeting": "2024-02-01",
--   "fp_status": "active"
-- }

-- 既存のデータに対してデフォルト値を設定
UPDATE public.customer_leads 
SET fp_info = '{}'::jsonb 
WHERE fp_info IS NULL;

-- インデックスの追加（FP情報の検索を高速化）
CREATE INDEX IF NOT EXISTS idx_customer_leads_fp_info 
ON public.customer_leads USING GIN (fp_info);

-- FP情報の更新日時を自動更新するためのトリガー関数
CREATE OR REPLACE FUNCTION update_fp_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
DROP TRIGGER IF EXISTS trigger_update_fp_info_updated_at ON public.customer_leads;
CREATE TRIGGER trigger_update_fp_info_updated_at
  BEFORE UPDATE ON public.customer_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_fp_info_updated_at();

-- コメントの追加
COMMENT ON COLUMN public.customer_leads.fp_info IS 'FP（ファイナンシャルプランナー）関連の情報を格納するJSONBフィールド';
