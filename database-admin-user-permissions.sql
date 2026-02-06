-- 管理画面ユーザー権限（JSONベース）

CREATE TABLE IF NOT EXISTS admin_user_permissions (
  user_id TEXT PRIMARY KEY,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_user_permissions_updated_at
  ON admin_user_permissions(updated_at);

ALTER TABLE admin_user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_user_permissions_read" ON admin_user_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "admin_user_permissions_write" ON admin_user_permissions
  FOR ALL USING (auth.role() = 'authenticated');
