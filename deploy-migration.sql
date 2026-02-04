-- 物件管理と顧客管理の連携機能 - 本番環境用マイグレーション
-- 実行日: 2025-01-18
-- 注意: 実行前に必ずバックアップを取得してください

-- 1. seller_customer_idカラムを追加（NULL許容）
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS seller_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- 2. 既存のcustomer_idをseller_customer_idに移行（売主の場合のみ）
UPDATE properties 
SET seller_customer_id = customer_id 
WHERE customer_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM customers c 
    WHERE c.id = properties.customer_id 
    AND c.category = 'seller'
  );

-- 3. 売主物件のインデックスを作成
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_seller_customer 
ON properties(seller_customer_id) 
WHERE seller_customer_id IS NOT NULL;

-- 4. 顧客検索用の複合インデックスを作成（名前・かな・電話・メール）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_search_combined 
ON customers USING gin(
  to_tsvector('japanese', 
    COALESCE(name, '') || ' ' || 
    COALESCE(name_kana, '') || ' ' || 
    COALESCE(phone, '') || ' ' || 
    COALESCE(email, '')
  )
);

-- 5. 電話番号の前方一致検索用インデックス
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_phone_prefix 
ON customers(phone) 
WHERE phone IS NOT NULL;

-- 6. メールアドレスの前方一致検索用インデックス
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email_prefix 
ON customers(email) 
WHERE email IS NOT NULL;

-- 7. コメントを追加
COMMENT ON COLUMN properties.seller_customer_id IS '売主顧客ID（NULL許容）';
COMMENT ON INDEX idx_properties_seller_customer IS '売主顧客ID検索用インデックス';
COMMENT ON INDEX idx_customers_search_combined IS '顧客検索用全文検索インデックス';
COMMENT ON INDEX idx_customers_phone_prefix IS '電話番号前方一致検索用インデックス';
COMMENT ON INDEX idx_customers_email_prefix IS 'メールアドレス前方一致検索用インデックス';

-- 8. 移行完了の確認
SELECT 
  'Migration completed successfully' as status,
  COUNT(*) as total_properties,
  COUNT(seller_customer_id) as properties_with_seller
FROM properties;

-- 9. 社内マニュアル機能の追加
CREATE TABLE IF NOT EXISTS manuals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid()
);

ALTER TABLE manuals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'manuals' AND policyname = 'Authenticated users can view manuals'
  ) THEN
    CREATE POLICY "Authenticated users can view manuals" ON manuals
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'manuals' AND policyname = 'Authenticated users can insert manuals'
  ) THEN
    CREATE POLICY "Authenticated users can insert manuals" ON manuals
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'manuals' AND policyname = 'Authenticated users can update manuals'
  ) THEN
    CREATE POLICY "Authenticated users can update manuals" ON manuals
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'manuals' AND policyname = 'Authenticated users can delete manuals'
  ) THEN
    CREATE POLICY "Authenticated users can delete manuals" ON manuals
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'manuals_category_check'
  ) THEN
    ALTER TABLE manuals
      ADD CONSTRAINT manuals_category_check
      CHECK (category IN ('工務部', '営業/事務'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS manuals_category_idx ON manuals(category);
CREATE INDEX IF NOT EXISTS manuals_updated_at_idx ON manuals(updated_at DESC);

CREATE TABLE IF NOT EXISTS manual_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manual_id UUID NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  title TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid()
);

ALTER TABLE manual_videos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'manual_videos' AND policyname = 'Authenticated users can view manual videos'
  ) THEN
    CREATE POLICY "Authenticated users can view manual videos" ON manual_videos
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'manual_videos' AND policyname = 'Authenticated users can insert manual videos'
  ) THEN
    CREATE POLICY "Authenticated users can insert manual videos" ON manual_videos
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'manual_videos' AND policyname = 'Authenticated users can update manual videos'
  ) THEN
    CREATE POLICY "Authenticated users can update manual videos" ON manual_videos
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'manual_videos' AND policyname = 'Authenticated users can delete manual videos'
  ) THEN
    CREATE POLICY "Authenticated users can delete manual videos" ON manual_videos
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS manual_videos_manual_id_idx ON manual_videos(manual_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_manuals_updated_at ON manuals;
CREATE TRIGGER update_manuals_updated_at
  BEFORE UPDATE ON manuals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO storage.buckets (id, name, public)
VALUES ('manual-videos', 'manual-videos', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Manual videos are readable by authenticated users'
  ) THEN
    CREATE POLICY "Manual videos are readable by authenticated users" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'manual-videos' AND auth.role() = 'authenticated'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Manual videos are insertable by authenticated users'
  ) THEN
    CREATE POLICY "Manual videos are insertable by authenticated users" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'manual-videos' AND auth.role() = 'authenticated'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Manual videos are updatable by authenticated users'
  ) THEN
    CREATE POLICY "Manual videos are updatable by authenticated users" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'manual-videos' AND auth.role() = 'authenticated'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Manual videos are deletable by authenticated users'
  ) THEN
    CREATE POLICY "Manual videos are deletable by authenticated users" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'manual-videos' AND auth.role() = 'authenticated'
      );
  END IF;
END $$;
