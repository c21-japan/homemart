-- 物件管理と顧客管理の連携機能 - 本番環境用マイグレーション（修正版）
-- 実行日: 2025-01-18
-- 注意: 実行前に必ずバックアップを取得してください

-- 1. seller_customer_idカラムを追加（NULL許容）
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS seller_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- 2. 既存データの移行（customer_idカラムが存在しない場合、このステップはスキップ）
-- 以下のSQLは、customer_idカラムが存在する場合のみ実行してください
-- UPDATE properties 
-- SET seller_customer_id = customer_id 
-- WHERE customer_id IS NOT NULL 
--   AND EXISTS (
--     SELECT 1 FROM customers c 
--     WHERE c.id = properties.customer_id 
--     AND c.category = 'seller'
--   );

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
