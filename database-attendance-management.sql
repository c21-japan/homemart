-- 勤怠管理機能のデータベース設定
-- SupabaseダッシュボードのSQL Editorで実行してください

-- 従業員テーブル
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 勤怠記録テーブル
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    clock_in_at TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_id ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_clock_in_at ON attendance_records(clock_in_at);
CREATE INDEX IF NOT EXISTS idx_employees_auth_user_id ON employees(auth_user_id);

-- 日次勤務時間ビュー
CREATE OR REPLACE VIEW attendance_daily_view AS
SELECT 
    ar.employee_id,
    e.name as employee_name,
    ar.clock_in_at AT TIME ZONE 'Asia/Tokyo' as clock_in_jst,
    ar.clock_out_at AT TIME ZONE 'Asia/Tokyo' as clock_out_jst,
    CASE 
        WHEN ar.clock_out_at IS NOT NULL THEN
            EXTRACT(EPOCH FROM (ar.clock_out_at - ar.clock_in_at)) / 3600
        ELSE
            EXTRACT(EPOCH FROM (NOW() - ar.clock_in_at)) / 3600
    END as work_hours,
    ar.clock_in_at::date as work_date
FROM attendance_records ar
JOIN employees e ON ar.employee_id = e.id
WHERE ar.clock_in_at::date = CURRENT_DATE AT TIME ZONE 'Asia/Tokyo';

-- 月次勤務時間ビュー
CREATE OR REPLACE VIEW attendance_monthly_view AS
SELECT 
    ar.employee_id,
    e.name as employee_name,
    DATE_TRUNC('month', ar.clock_in_at AT TIME ZONE 'Asia/Tokyo') as month,
    SUM(
        CASE 
            WHEN ar.clock_out_at IS NOT NULL THEN
                EXTRACT(EPOCH FROM (ar.clock_out_at - ar.clock_in_at)) / 3600
            ELSE
                EXTRACT(EPOCH FROM (NOW() - ar.clock_in_at)) / 3600
        END
    ) as total_work_hours
FROM attendance_records ar
JOIN employees e ON ar.employee_id = e.id
WHERE DATE_TRUNC('month', ar.clock_in_at AT TIME ZONE 'Asia/Tokyo') = DATE_TRUNC('month', CURRENT_DATE AT TIME ZONE 'Asia/Tokyo')
GROUP BY ar.employee_id, e.name, DATE_TRUNC('month', ar.clock_in_at AT TIME ZONE 'Asia/Tokyo');

-- 出社打刻関数
CREATE OR REPLACE FUNCTION punch_in(employee_uuid UUID)
RETURNS JSON AS $$
DECLARE
    active_record_count INTEGER;
    new_record_id UUID;
BEGIN
    -- 未退勤のレコードがあるかチェック
    SELECT COUNT(*) INTO active_record_count
    FROM attendance_records
    WHERE employee_id = employee_uuid AND clock_out_at IS NULL;
    
    IF active_record_count > 0 THEN
        RETURN json_build_object('success', false, 'message', '既に勤務中のため出社できません');
    END IF;
    
    -- 新規打刻レコード作成
    INSERT INTO attendance_records (employee_id, clock_in_at)
    VALUES (employee_uuid, NOW())
    RETURNING id INTO new_record_id;
    
    RETURN json_build_object('success', true, 'record_id', new_record_id, 'message', '出社しました');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 退勤打刻関数
CREATE OR REPLACE FUNCTION punch_out(employee_uuid UUID)
RETURNS JSON AS $$
DECLARE
    active_record_count INTEGER;
    updated_record_id UUID;
BEGIN
    -- 未退勤のレコードがあるかチェック
    SELECT COUNT(*) INTO active_record_count
    FROM attendance_records
    WHERE employee_id = employee_uuid AND clock_out_at IS NULL;
    
    IF active_record_count = 0 THEN
        RETURN json_build_object('success', false, 'message', '勤務中のレコードがありません');
    END IF;
    
    -- 退勤時間を記録
    UPDATE attendance_records
    SET clock_out_at = NOW(), updated_at = NOW()
    WHERE employee_id = employee_uuid AND clock_out_at IS NULL
    RETURNING id INTO updated_record_id;
    
    RETURN json_build_object('success', true, 'record_id', updated_record_id, 'message', '退勤しました');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLSポリシー
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- 従業員テーブルのポリシー
CREATE POLICY "従業員は自分の情報のみ閲覧可能" ON employees
    FOR SELECT USING (auth_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "管理者は全従業員情報にアクセス可能" ON employees
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
    );

-- 勤怠記録テーブルのポリシー
CREATE POLICY "従業員は自分の勤怠記録のみ閲覧可能" ON attendance_records
    FOR SELECT USING (employee_id IN (
        SELECT id FROM employees WHERE auth_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ));

CREATE POLICY "従業員は自分の勤怠記録のみ作成可能" ON attendance_records
    FOR INSERT WITH CHECK (employee_id IN (
        SELECT id FROM employees WHERE auth_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ));

CREATE POLICY "従業員は自分の勤怠記録のみ更新可能" ON attendance_records
    FOR UPDATE USING (employee_id IN (
        SELECT id FROM employees WHERE auth_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ));

CREATE POLICY "管理者は全勤怠記録にアクセス可能" ON attendance_records
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
    );

-- テスト用のサンプルデータ（必要に応じて実行）
-- INSERT INTO employees (auth_user_id, name, is_active)
-- VALUES 
--   ('user_2abc123def456', '田中太郎', true),
--   ('user_2def456ghi789', '佐藤花子', true);
