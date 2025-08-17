-- チェックリストテンプレートの作成
-- このSQLはSupabaseダッシュボードで実行してください

-- 1. チェックリストテンプレートテーブルの作成
CREATE TABLE IF NOT EXISTS checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'seller', 'buyer', 'reform'
  title VARCHAR(255) NOT NULL,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. チェックリスト項目テーブルの作成
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
  label VARCHAR(500) NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  completed_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. リマインドテーブルの作成
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP NOT NULL,
  channel VARCHAR(50) DEFAULT 'email', -- 'email', 'line', 'phone'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'cancelled'
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. ミーティングテーブルの作成
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  attendees TEXT[], -- 参加者リスト
  summary TEXT,
  source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'plaudenotopin'
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. ミーティングノートテーブルの作成
CREATE TABLE IF NOT EXISTS meeting_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. タスクテーブルの作成
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignee_user_id VARCHAR(100),
  assignee_name VARCHAR(100),
  due_date DATE,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'done', 'cancelled'
  priority VARCHAR(20) DEFAULT 'medium',
  source_meeting_id UUID REFERENCES meetings(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. 文書テーブルの作成
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'meeting_photo', 'contract', 'estimate', 'other'
  filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_checklists_customer_id ON checklists(customer_id);
CREATE INDEX IF NOT EXISTS idx_checklists_type ON checklists(type);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_reminders_customer_id ON reminders(customer_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_at ON reminders(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_meetings_customer_id ON meetings(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_customer_id ON tasks(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON documents(customer_id);

-- 9. 売却チェックリストテンプレートの作成
INSERT INTO checklists (type, title, due_date) VALUES 
('seller', '売却案件チェックリスト', NULL)
ON CONFLICT DO NOTHING;

-- 売却チェックリスト項目の作成
INSERT INTO checklist_items (checklist_id, label, order_index) 
SELECT 
  c.id,
  item.label,
  item.order_index
FROM checklists c
CROSS JOIN (
  VALUES 
    ('物件の現況確認', 1),
    ('査定依頼', 2),
    ('媒介契約書の作成', 3),
    ('物件情報の登録', 4),
    ('チラシ・LPの作成', 5),
    ('内覧の設定', 6),
    ('買主との交渉', 7),
    ('売買契約の締結', 8),
    ('引渡しの完了', 9)
) AS item(label, order_index)
WHERE c.type = 'seller' AND c.customer_id IS NULL
ON CONFLICT DO NOTHING;

-- 10. 購入チェックリストテンプレートの作成
INSERT INTO checklists (type, title, due_date) VALUES 
('buyer', '購入案件チェックリスト', NULL)
ON CONFLICT DO NOTHING;

-- 購入チェックリスト項目の作成
INSERT INTO checklist_items (checklist_id, label, order_index) 
SELECT 
  c.id,
  item.label,
  item.order_index
FROM checklists c
CROSS JOIN (
  VALUES 
    ('購入希望条件の詳細ヒアリング', 1),
    ('物件の検索・提案', 2),
    ('内覧の設定', 3),
    ('物件の詳細調査', 4),
    ('価格交渉', 5),
    ('ローン審査', 6),
    ('売買契約の締結', 7),
    ('引渡しの完了', 8)
) AS item(label, order_index)
WHERE c.type = 'buyer' AND c.customer_id IS NULL
ON CONFLICT DO NOTHING;

-- 11. リフォームチェックリストテンプレートの作成
INSERT INTO checklists (type, title, due_date) VALUES 
('reform', 'リフォーム案件チェックリスト', NULL)
ON CONFLICT DO NOTHING;

-- リフォームチェックリスト項目の作成
INSERT INTO checklist_items (checklist_id, label, order_index) 
SELECT 
  c.id,
  item.label,
  item.order_index
FROM checklists c
CROSS JOIN (
  VALUES 
    ('現地調査・見積もり', 1),
    ('提案書の作成', 2),
    ('契約の締結', 3),
    ('着工準備', 4),
    ('工事の開始', 5),
    ('工事の進行管理', 6),
    ('工事の完了', 7),
    ('引渡し・アフターケア', 8)
) AS item(label, order_index)
WHERE c.type = 'reform' AND c.customer_id IS NULL
ON CONFLICT DO NOTHING;

-- 12. updated_atトリガーの作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_checklists_updated_at 
    BEFORE UPDATE ON checklists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完了メッセージ
SELECT 'チェックリストテンプレートと関連テーブルの作成が完了しました！' as message;
