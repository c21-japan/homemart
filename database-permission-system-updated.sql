-- ========================================
-- ホームマート権限管理システム用テーブル作成（更新版）
-- ========================================

-- ユーザーテーブル（認証情報）
CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff', 'part_time')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ユーザープロファイル（詳細情報）
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth_users(id) ON DELETE CASCADE,
  employee_code VARCHAR(20) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  first_name_kana VARCHAR(100),
  last_name_kana VARCHAR(100),
  phone VARCHAR(20),
  department VARCHAR(50),
  position VARCHAR(50),
  hire_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 権限マスタ
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ロール別権限設定
CREATE TABLE IF NOT EXISTS role_permissions (
  role VARCHAR(20) NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_id)
);

-- ユーザー個別権限（ロール権限を上書き）
CREATE TABLE IF NOT EXISTS user_custom_permissions (
  auth_user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true, -- true: 付与, false: 剥奪
  PRIMARY KEY (auth_user_id, permission_id)
);

-- アクティビティログ
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth_users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- セッション管理
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_auth_users_email ON auth_users(email);
CREATE INDEX idx_auth_users_role ON auth_users(role);
CREATE INDEX idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(auth_user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- ========================================
-- 初期データ投入
-- ========================================

-- 権限マスタデータ
INSERT INTO permissions (code, name, description, category) VALUES
-- システム管理
('system.manage', 'システム管理', '全システム設定の管理', 'system'),
('user.create', 'ユーザー作成', '新規ユーザーの作成', 'system'),
('user.read', 'ユーザー閲覧', 'ユーザー情報の閲覧', 'system'),
('user.update', 'ユーザー更新', 'ユーザー情報の更新', 'system'),
('user.delete', 'ユーザー削除', 'ユーザーの削除', 'system'),
('role.manage', '権限管理', 'ロールと権限の管理', 'system'),

-- 物件管理
('property.create', '物件登録', '新規物件の登録', 'property'),
('property.read', '物件閲覧', '物件情報の閲覧', 'property'),
('property.update', '物件更新', '物件情報の更新', 'property'),
('property.delete', '物件削除', '物件の削除', 'property'),
('property.approve', '物件承認', '物件公開の承認', 'property'),

-- リード管理
('lead.create', 'リード作成', '新規リードの作成', 'lead'),
('lead.read', 'リード閲覧', 'リード情報の閲覧', 'lead'),
('lead.update', 'リード更新', 'リード情報の更新', 'lead'),
('lead.delete', 'リード削除', 'リードの削除', 'lead'),
('lead.assign', 'リード割当', 'リードの担当者割当', 'lead'),

-- 勤怠管理
('attendance.create', '勤怠入力', '勤怠情報の入力', 'hr'),
('attendance.read', '勤怠閲覧', '勤怠情報の閲覧', 'hr'),
('attendance.update', '勤怠修正', '勤怠情報の修正', 'hr'),
('attendance.approve', '勤怠承認', '勤怠の承認', 'hr'),

-- レポート
('report.view', 'レポート閲覧', '各種レポートの閲覧', 'report'),
('report.export', 'レポート出力', 'レポートのエクスポート', 'report'),
('report.financial', '財務レポート', '財務レポートの閲覧', 'report');

-- ロール別権限設定
-- オーナー（全権限）
INSERT INTO role_permissions (role, permission_id)
SELECT 'owner', id FROM permissions;

-- マネージャー（システム管理以外）
INSERT INTO role_permissions (role, permission_id)
SELECT 'manager', id FROM permissions 
WHERE category != 'system' OR code IN ('user.read', 'user.update');

-- スタッフ（基本業務権限）
INSERT INTO role_permissions (role, permission_id)
SELECT 'staff', id FROM permissions 
WHERE code IN (
  'property.create', 'property.read', 'property.update',
  'lead.create', 'lead.read', 'lead.update',
  'attendance.create', 'attendance.read',
  'report.view'
);

-- パートタイム（最小権限）
INSERT INTO role_permissions (role, permission_id)
SELECT 'part_time', id FROM permissions 
WHERE code IN (
  'attendance.create', 'attendance.read',
  'property.read', 'lead.read'
);

-- 初期ユーザー作成（乾代表）- 正しいパスワードハッシュ
INSERT INTO auth_users (email, password_hash, role) VALUES
('inui@homemart.co.jp', '$2b$12$VdaWVN22Wnh5edoTjFL.Fuiuih1YYFBrgCfF3.XS6M.EYTp95ww5q', 'owner');

INSERT INTO user_profiles (auth_user_id, employee_code, first_name, last_name, first_name_kana, last_name_kana, phone, department, position)
SELECT id, 'HM001', '佑企', '乾', 'ユウキ', 'イヌイ', '090-7962-0019', '経営', '代表取締役'
FROM auth_users WHERE email = 'inui@homemart.co.jp';

-- 追加ユーザー作成（サンプル）
INSERT INTO auth_users (email, password_hash, role) VALUES
('yasuda@homemart.co.jp', '$2b$12$VdaWVN22Wnh5edoTjFL.Fuiuih1YYFBrgCfF3.XS6M.EYTp95ww5q', 'manager'),
('toyota@homemart.co.jp', '$2b$12$VdaWVN22Wnh5edoTjFL.Fuiuih1YYFBrgCfF3.XS6M.EYTp95ww5q', 'staff'),
('imazu@homemart.co.jp', '$2b$12$VdaWVN22Wnh5edoTjFL.Fuiuih1YYFBrgCfF3.XS6M.EYTp95ww5q', 'staff'),
('yamao@homemart.co.jp', '$2b$12$VdaWVN22Wnh5edoTjFL.Fuiuih1YYFBrgCfF3.XS6M.EYTp95ww5q', 'staff'),
('kadotani@homemart.co.jp', '$2b$12$VdaWVN22Wnh5edoTjFL.Fuiuih1YYFBrgCfF3.XS6M.EYTp95ww5q', 'part_time'),
('toyama@homemart.co.jp', '$2b$12$VdaWVN22Wnh5edoTjFL.Fuiuih1YYFBrgCfF3.XS6M.EYTp95ww5q', 'part_time');

-- 追加ユーザーのプロファイル作成
INSERT INTO user_profiles (auth_user_id, employee_code, first_name, last_name, first_name_kana, last_name_kana, phone, department, position)
SELECT id, 'HM002', '安田', '安田', 'ヤスダ', 'ヤスダ', '090-0000-0002', '営業', '営業部長'
FROM auth_users WHERE email = 'yasuda@homemart.co.jp';

INSERT INTO user_profiles (auth_user_id, employee_code, first_name, last_name, first_name_kana, last_name_kana, phone, department, position)
SELECT id, 'HM003', '豊田', '豊田', 'トヨタ', 'トヨタ', '090-0000-0003', '営業', '営業担当'
FROM auth_users WHERE email = 'toyota@homemart.co.jp';

INSERT INTO user_profiles (auth_user_id, employee_code, first_name, last_name, first_name_kana, last_name_kana, phone, department, position)
SELECT id, 'HM004', '今津', '今津', 'イマズ', 'イマズ', '090-0000-0004', '営業', 'ポスティング担当'
FROM auth_users WHERE email = 'imazu@homemart.co.jp';

INSERT INTO user_profiles (auth_user_id, employee_code, first_name, last_name, first_name_kana, last_name_kana, phone, department, position)
SELECT id, 'HM005', '山尾', '山尾', 'ヤマオ', 'ヤマオ', '090-0000-0005', '事務', '事務員'
FROM auth_users WHERE email = 'yamao@homemart.co.jp';

INSERT INTO user_profiles (auth_user_id, employee_code, first_name, last_name, first_name_kana, last_name_kana, phone, department, position)
SELECT id, 'HM006', 'かどたに', 'かどたに', 'カドタニ', 'カドタニ', '090-0000-0006', '営業', 'アルバイト'
FROM auth_users WHERE email = 'kadotani@homemart.co.jp';

INSERT INTO user_profiles (auth_user_id, employee_code, first_name, last_name, first_name_kana, last_name_kana, phone, department, position)
SELECT id, 'HM007', 'とやま', 'とやま', 'トヤマ', 'トヤマ', '090-0000-0007', '営業', 'アルバイト'
FROM auth_users WHERE email = 'toyama@homemart.co.jp';

-- Row Level Security (RLS) 設定
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view their own data" ON auth_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Owners and managers can view all users" ON auth_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth_users 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- 更新時のタイムスタンプ自動更新のためのトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_auth_users_updated_at
  BEFORE UPDATE ON auth_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- サンプルデータ（物件・リード等）
-- ========================================

-- サンプル物件データ
INSERT INTO reform_projects (title, description, image_url) VALUES
('マンションリフォーム', '築20年のマンションを全面リフォーム。キッチン、浴室、トイレを最新設備に更新し、内装もモダンなデザインに変更しました。', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'),
('戸建てリフォーム', '古い戸建て住宅の外壁塗装と屋根の修繕。断熱材も追加し、省エネ性能を向上させました。', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800'),
('オフィスリフォーム', '事務所の内装を一新し、オープンオフィス形式に変更。照明と空調設備も最新のものに更新しました。', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800');

-- ========================================
-- 完了メッセージ
-- ========================================
-- このSQLファイルを実行すると、ホームマートの完全な権限管理システムが構築されます。
-- 
-- 実行後、以下のユーザーでログインできます：
-- 
-- オーナー: inui@homemart.co.jp / HomeM@rt2024
-- マネージャー: yasuda@homemart.co.jp / HomeM@rt2024
-- スタッフ: toyota@homemart.co.jp / HomeM@rt2024
-- パートタイム: kadotani@homemart.co.jp / HomeM@rt2024
-- 
-- 全ユーザーのパスワードは「HomeM@rt2024」です。
-- 本番環境では必ず個別にパスワードを変更してください。
