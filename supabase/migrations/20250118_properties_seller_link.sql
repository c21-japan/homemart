-- 物件テーブルに売主顧客IDを追加するマイグレーション
-- 作成日: 2025-01-18

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
