-- リフォーム施工実績テーブルの作成
CREATE TABLE IF NOT EXISTS reform_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_reform_projects_created_at ON reform_projects(created_at DESC);

-- RLS（Row Level Security）の有効化
ALTER TABLE reform_projects ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシー
CREATE POLICY "管理者のみアクセス可能" ON reform_projects
  FOR ALL USING (auth.role() = 'authenticated');

-- 更新時のタイムスタンプ自動更新のためのトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_reform_projects_updated_at
  BEFORE UPDATE ON reform_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入（オプション）
INSERT INTO reform_projects (title, description, image_url) VALUES
  ('キッチンリフォーム', '古いキッチンを最新のシステムキッチンにリフォーム。作業台と収納スペースを大幅に拡張し、使いやすさを向上させました。', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'),
  ('浴室リフォーム', 'ユニットバスを導入し、シャワーと浴槽を分離。安全性と快適性を向上させ、高齢者にも使いやすい設計にしました。', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800'),
  ('外壁塗装', '経年劣化した外壁を美しく塗り直し、断熱性も向上。建物の耐久性と美観を大幅に改善しました。', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800')
ON CONFLICT DO NOTHING;
