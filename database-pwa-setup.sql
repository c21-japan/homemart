-- PWA機能用データベーススキーマ
-- ホームマート PWA システム

-- お気に入り物件テーブル
CREATE TABLE IF NOT EXISTS favorite_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- 検索履歴テーブル
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  search_type VARCHAR(100),
  search_filters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 社員テーブル（権限管理用）
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'part_time')),
  department VARCHAR(100),
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 社員権限テーブル
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 社員権限関連テーブル
CREATE TABLE IF NOT EXISTS staff_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES staff_members(id),
  UNIQUE(staff_id, permission_id)
);

-- お気に入り物件のインデックス
CREATE INDEX IF NOT EXISTS idx_favorite_properties_user_id ON favorite_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_properties_property_id ON favorite_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_favorite_properties_created_at ON favorite_properties(created_at);

-- 検索履歴のインデックス
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_search_history_search_type ON search_history(search_type);

-- 社員テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_staff_members_role ON staff_members(role);
CREATE INDEX IF NOT EXISTS idx_staff_members_department ON staff_members(department);
CREATE INDEX IF NOT EXISTS idx_staff_members_email ON staff_members(email);

-- 権限テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);

-- 社員権限関連テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_staff_permissions_staff_id ON staff_permissions(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_permissions_permission_id ON staff_permissions(permission_id);

-- 基本的な権限データの挿入
INSERT INTO permissions (name, description, category) VALUES
('property:view', '物件の閲覧', '物件管理'),
('property:create', '物件の作成', '物件管理'),
('property:edit', '物件の編集', '物件管理'),
('property:delete', '物件の削除', '物件管理'),
('property:publish', '物件の公開', '物件管理'),
('lead:view', 'リードの閲覧', 'リード管理'),
('lead:create', 'リードの作成', 'リード管理'),
('lead:edit', 'リードの編集', 'リード管理'),
('lead:delete', 'リードの削除', 'リード管理'),
('lead:assign', 'リードの割り当て', 'リード管理'),
('inquiry:view', 'お問い合わせの閲覧', 'お問い合わせ管理'),
('inquiry:create', 'お問い合わせの作成', 'お問い合わせ管理'),
('inquiry:edit', 'お問い合わせの編集', 'お問い合わせ管理'),
('inquiry:delete', 'お問い合わせの削除', 'お問い合わせ管理'),
('inquiry:respond', 'お問い合わせへの対応', 'お問い合わせ管理'),
('staff:view', '社員情報の閲覧', '社員管理'),
('staff:create', '社員の作成', '社員管理'),
('staff:edit', '社員情報の編集', '社員管理'),
('staff:delete', '社員の削除', '社員管理'),
('staff:permissions', '社員権限の管理', '社員管理'),
('attendance:view', '勤怠の閲覧', '勤怠管理'),
('attendance:create', '勤怠の作成', '勤怠管理'),
('attendance:edit', '勤怠の編集', '勤怠管理'),
('attendance:approve', '勤怠の承認', '勤怠管理'),
('expense:view', '経費の閲覧', '経費管理'),
('expense:create', '経費の作成', '経費管理'),
('expense:edit', '経費の編集', '経費管理'),
('expense:approve', '経費の承認', '経費管理'),
('reform:view', 'リフォームの閲覧', 'リフォーム管理'),
('reform:create', 'リフォームの作成', 'リフォーム管理'),
('reform:edit', 'リフォームの編集', 'リフォーム管理'),
('reform:delete', 'リフォームの削除', 'リフォーム管理'),
('media:view', 'メディアの閲覧', 'メディア管理'),
('media:upload', 'メディアのアップロード', 'メディア管理'),
('media:delete', 'メディアの削除', 'メディア管理'),
('report:view', 'レポートの閲覧', 'レポート・分析'),
('report:export', 'レポートのエクスポート', 'レポート・分析'),
('analytics:view', '分析データの閲覧', 'レポート・分析'),
('settings:view', '設定の閲覧', 'システム設定'),
('settings:edit', '設定の編集', 'システム設定')
ON CONFLICT (name) DO NOTHING;

-- サンプル管理者アカウントの作成（実際の運用では適切な値に変更してください）
-- INSERT INTO staff_members (id, email, name, role, department, permissions) VALUES
-- ('管理者のUUID', 'admin@homemart.com', 'システム管理者', 'admin', 'システム部', ARRAY[]);

-- RLS（Row Level Security）の設定
ALTER TABLE favorite_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_permissions ENABLE ROW LEVEL SECURITY;

-- お気に入り物件のRLSポリシー
CREATE POLICY "Users can view their own favorites" ON favorite_properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorite_properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorite_properties
  FOR DELETE USING (auth.uid() = user_id);

-- 検索履歴のRLSポリシー
CREATE POLICY "Users can view their own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history" ON search_history
  FOR DELETE USING (auth.uid() = user_id);

-- 社員情報のRLSポリシー
CREATE POLICY "Staff can view their own information" ON staff_members
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all staff" ON staff_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff_members sm 
      WHERE sm.id = auth.uid() AND sm.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage staff" ON staff_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_members sm 
      WHERE sm.id = auth.uid() AND sm.role = 'admin'
    )
  );

-- 権限のRLSポリシー
CREATE POLICY "Everyone can view permissions" ON permissions
  FOR SELECT USING (true);

-- 社員権限関連のRLSポリシー
CREATE POLICY "Staff can view their own permissions" ON staff_permissions
  FOR SELECT USING (staff_id = auth.uid());

CREATE POLICY "Admins can manage all permissions" ON staff_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_members sm 
      WHERE sm.id = auth.uid() AND sm.role = 'admin'
    )
  );

-- 関数とトリガーの作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 社員テーブルの更新日時を自動更新
CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- コメント
COMMENT ON TABLE favorite_properties IS 'ユーザーがお気に入りに登録した物件';
COMMENT ON TABLE search_history IS 'ユーザーの検索履歴';
COMMENT ON TABLE staff_members IS '社員情報と権限';
COMMENT ON TABLE permissions IS 'システムで使用可能な権限の定義';
COMMENT ON TABLE staff_permissions IS '社員と権限の関連';

COMMENT ON COLUMN staff_members.role IS '役職: admin(管理者), manager(管理職), staff(一般社員), part_time(パートタイム)';
COMMENT ON COLUMN staff_members.permissions IS 'カスタム権限の配列（役職のデフォルト権限とは別）';
