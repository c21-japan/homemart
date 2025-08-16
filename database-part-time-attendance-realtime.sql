-- アルバイトのリアルタイム勤怠通知用テーブル
CREATE TABLE IF NOT EXISTS part_time_attendance_realtime (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES part_time_employees(id) ON DELETE CASCADE,
  attendance_type TEXT NOT NULL CHECK (attendance_type IN ('clock_in', 'clock_out')),
  location_data JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスを作成してパフォーマンスを向上
CREATE INDEX IF NOT EXISTS idx_part_time_attendance_realtime_employee_id ON part_time_attendance_realtime(employee_id);
CREATE INDEX IF NOT EXISTS idx_part_time_attendance_realtime_timestamp ON part_time_attendance_realtime(timestamp);
CREATE INDEX IF NOT EXISTS idx_part_time_attendance_realtime_created_at ON part_time_attendance_realtime(created_at);

-- 既存のpart_time_attendanceテーブルに位置情報カラムを追加（もし存在しない場合）
DO $$ 
BEGIN
  -- clock_in_locationカラムが存在しない場合に追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'part_time_attendance' AND column_name = 'clock_in_location') THEN
    ALTER TABLE part_time_attendance ADD COLUMN clock_in_location TEXT;
  END IF;
  
  -- clock_out_locationカラムが存在しない場合に追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'part_time_attendance' AND column_name = 'clock_out_location') THEN
    ALTER TABLE part_time_attendance ADD COLUMN clock_out_location TEXT;
  END IF;
  
  -- clock_in_addressカラムが存在しない場合に追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'part_time_attendance' AND column_name = 'clock_in_address') THEN
    ALTER TABLE part_time_attendance ADD COLUMN clock_in_address TEXT;
  END IF;
  
  -- clock_out_addressカラムが存在しない場合に追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'part_time_attendance' AND column_name = 'clock_out_address') THEN
    ALTER TABLE part_time_attendance ADD COLUMN clock_out_address TEXT;
  END IF;
END $$;

-- リアルタイム通知の履歴を保持するためのポリシー（必要に応じて古いデータを削除）
-- 30日以上古いデータを自動削除する関数
CREATE OR REPLACE FUNCTION cleanup_old_realtime_attendance()
RETURNS void AS $$
BEGIN
  DELETE FROM part_time_attendance_realtime 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 毎日実行されるクリーンアップジョブ（PostgreSQLのpg_cron拡張が必要）
-- SELECT cron.schedule('cleanup-realtime-attendance', '0 2 * * *', 'SELECT cleanup_old_realtime_attendance();');

-- サンプルデータ（テスト用）
INSERT INTO part_time_attendance_realtime (employee_id, attendance_type, location_data, timestamp) VALUES
(
  (SELECT id FROM part_time_employees LIMIT 1),
  'clock_in',
  '{"latitude": 35.6762, "longitude": 139.6503, "address": "東京都渋谷区"}',
  NOW() - INTERVAL '2 hours'
),
(
  (SELECT id FROM part_time_employees LIMIT 1),
  'clock_out',
  '{"latitude": 35.6762, "longitude": 139.6503, "address": "東京都渋谷区"}',
  NOW() - INTERVAL '1 hour'
);

-- テーブルの説明
COMMENT ON TABLE part_time_attendance_realtime IS 'アルバイトのリアルタイム勤怠通知を保存するテーブル';
COMMENT ON COLUMN part_time_attendance_realtime.employee_id IS '従業員ID';
COMMENT ON COLUMN part_time_attendance_realtime.attendance_type IS '勤怠タイプ（出社/退社）';
COMMENT ON COLUMN part_time_attendance_realtime.location_data IS 'GPS位置情報と住所（JSON形式）';
COMMENT ON COLUMN part_time_attendance_realtime.timestamp IS '勤怠記録の時刻';
COMMENT ON COLUMN part_time_attendance_realtime.created_at IS 'レコード作成時刻';
COMMENT ON COLUMN part_time_attendance_realtime.updated_at IS 'レコード更新時刻';
