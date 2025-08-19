-- シフト申請システム改修用マイグレーション
-- 後方互換性を保ちながら「勤務可能日」方式に対応

-- 1. 期間列をNULL許容化（既存データは保持）
ALTER TABLE shift_requests
  ALTER COLUMN start_date DROP NOT NULL,
  ALTER COLUMN end_date DROP NOT NULL;

-- 2. 申請スコープ列を追加（将来の拡張に備え）
ALTER TABLE shift_requests
  ADD COLUMN IF NOT EXISTS request_scope text DEFAULT 'availability';

-- 3. 重複防止用のユニークインデックスを追加
CREATE UNIQUE INDEX IF NOT EXISTS ux_shift_detail_unique
ON shift_request_details(employee_id, date, start_time, end_time);

-- 4. 既存データの移行（request_scopeを設定）
UPDATE shift_requests 
SET request_scope = 'availability' 
WHERE request_scope IS NULL;

-- 5. インデックスの確認
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE tablename IN ('shift_requests', 'shift_request_details')
ORDER BY tablename, indexname;
