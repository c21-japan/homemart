-- 物件検索パフォーマンス最適化のためのインデックス作成
-- 実行前に必ずバックアップを取得してください

-- 1. 基本的な検索用インデックス
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_status_created 
ON properties(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_status_type 
ON properties(status, property_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_city 
ON properties(city);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_price 
ON properties(price);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_land_area 
ON properties(land_area);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_building_area 
ON properties(building_area);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_building_age 
ON properties(building_age);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_walking_time 
ON properties(walking_time);

-- 2. 複合検索用インデックス
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_search_composite 
ON properties(status, city, property_type, price, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_area_search 
ON properties(status, city, address);

-- 3. 全文検索用インデックス（PostgreSQLの全文検索機能を使用）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_name_search 
ON properties USING gin(to_tsvector('japanese', name));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_address_search 
ON properties USING gin(to_tsvector('japanese', address));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_staff_comment_search 
ON properties USING gin(to_tsvector('japanese', COALESCE(staff_comment, '')));

-- 4. 部分インデックス（publishedステータスのみ）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_published_only 
ON properties(created_at DESC) 
WHERE status = 'published';

-- 5. インデックス使用状況の確認用クエリ
-- 以下のクエリでインデックスの使用状況を確認できます
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename = 'properties'
ORDER BY idx_scan DESC;
*/

-- 6. パフォーマンステスト用クエリ
-- 以下のクエリで検索パフォーマンスをテストできます
/*
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, name, price, city, property_type, created_at
FROM properties 
WHERE status = 'published' 
  AND city = '奈良市'
  AND property_type = '中古戸建'
  AND price BETWEEN 2000 AND 5000
ORDER BY created_at DESC
LIMIT 20;
*/
