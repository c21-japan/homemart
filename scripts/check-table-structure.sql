-- Supabaseで実行してテーブル構造を確認
-- このSQLをSupabaseダッシュボードのSQLエディタで実行してください

-- 1. customersテーブルの構造確認
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- 2. 必須カラムの存在確認
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN 'テーブルが存在しません'
    ELSE 'テーブルが存在します'
  END as table_exists
FROM information_schema.tables 
WHERE table_name = 'customers';

-- 3. サンプルデータの確認（もしあれば）
SELECT * FROM customers LIMIT 1;

-- 4. インデックスの確認
SELECT 
  indexname, 
  indexdef
FROM pg_indexes 
WHERE tablename = 'customers';
