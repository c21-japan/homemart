-- FP相談機能用データベーススキーマ
-- inquiriesテーブルにFP関連のフィールドを追加

-- inquiriesテーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS public.inquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FP相談関連のフィールドを追加
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS fp_consultation_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fp_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS fp_consultation_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fp_status VARCHAR(50) DEFAULT 'pending';

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_inquiries_fp_consultation_requested 
ON public.inquiries(fp_consultation_requested);

CREATE INDEX IF NOT EXISTS idx_inquiries_fp_status 
ON public.inquiries(fp_status);

CREATE INDEX IF NOT EXISTS idx_inquiries_fp_info 
ON public.inquiries USING GIN (fp_info);

-- 更新日時を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
DROP TRIGGER IF EXISTS trigger_update_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER trigger_update_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiries_updated_at();

-- RLS（Row Level Security）の有効化
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成（認証されたユーザーは全て操作可能）
CREATE POLICY "Enable all operations for authenticated users" ON public.inquiries
  FOR ALL USING (true) WITH CHECK (true);

-- サンプルデータの挿入（テスト用）
INSERT INTO public.inquiries (name, email, phone, message, fp_consultation_requested) 
VALUES 
  ('田中太郎', 'tanaka@example.com', '090-1234-5678', '住宅購入について相談したいです', true),
  ('佐藤花子', 'sato@example.com', '080-9876-5432', 'リフォームの見積もりをお願いします', false),
  ('山田次郎', 'yamada@example.com', '070-5555-1111', 'FP相談を希望します', true)
ON CONFLICT (id) DO NOTHING;

-- コメントの追加
COMMENT ON COLUMN public.inquiries.fp_consultation_requested IS 'FP相談の希望有無';
COMMENT ON COLUMN public.inquiries.fp_info IS 'FP相談の詳細情報（JSONB）';
COMMENT ON COLUMN public.inquiries.fp_consultation_date IS 'FP相談の予定日時';
COMMENT ON COLUMN public.inquiries.fp_status IS 'FP相談のステータス（pending/scheduled/completed/cancelled）';
