-- ==================================================
-- チラシマーケティング管理システム
-- データベーススキーマ定義
-- ==================================================

-- UUID拡張有効化(既に有効な場合はスキップ)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================
-- 1. チラシデザイン管理テーブル
-- ==================================================
CREATE TABLE IF NOT EXISTS flyer_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  design_id VARCHAR(50) UNIQUE NOT NULL,
  design_name VARCHAR(200) NOT NULL,
  design_image_url TEXT,
  designer_name VARCHAR(100),
  designer_source VARCHAR(50) CHECK (designer_source IN ('crowdworks', 'internal', 'ai-generated', 'other')),
  appeal_point TEXT,
  adopted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_date DATE,
  end_date DATE,
  total_distributed INTEGER DEFAULT 0,
  total_inquiries INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_distributed > 0 
      THEN ROUND((total_inquiries::DECIMAL / total_distributed) * 100, 2)
      ELSE 0 
    END
  ) STORED,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_flyer_designs_active ON flyer_designs(is_active) WHERE is_active = true;
CREATE INDEX idx_flyer_designs_dates ON flyer_designs(start_date, end_date);

-- 更新日時自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_flyer_designs_updated_at
  BEFORE UPDATE ON flyer_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- 2. チラシ配布記録テーブル
-- ==================================================
CREATE TABLE IF NOT EXISTS flyer_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  distribution_date DATE NOT NULL,
  design_id VARCHAR(50) NOT NULL,
  area VARCHAR(200) NOT NULL,
  start_point VARCHAR(200),
  end_point VARCHAR(200),
  undistributed_buildings TEXT,
  communication_notes TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  distributor_name VARCHAR(100),
  print_date DATE,
  print_quantity INTEGER CHECK (print_quantity > 0),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_design FOREIGN KEY (design_id) REFERENCES flyer_designs(design_id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_distributions_date ON flyer_distributions(distribution_date DESC);
CREATE INDEX idx_distributions_design ON flyer_distributions(design_id);
CREATE INDEX idx_distributions_area ON flyer_distributions(area);

CREATE TRIGGER update_flyer_distributions_updated_at
  BEFORE UPDATE ON flyer_distributions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- 3. チラシ印刷記録テーブル
-- ==================================================
CREATE TABLE IF NOT EXISTS flyer_print_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  print_date DATE NOT NULL DEFAULT CURRENT_DATE,
  design_id VARCHAR(50) NOT NULL,
  printer_name VARCHAR(100) NOT NULL,
  range_start INTEGER NOT NULL,
  range_end INTEGER NOT NULL,
  printed_quantity INTEGER NOT NULL DEFAULT 0 CHECK (printed_quantity >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_print_design FOREIGN KEY (design_id) REFERENCES flyer_designs(design_id) ON DELETE CASCADE,
  CONSTRAINT chk_print_range CHECK (range_end >= range_start)
);

CREATE INDEX idx_print_jobs_date ON flyer_print_jobs(print_date DESC);
CREATE INDEX idx_print_jobs_design ON flyer_print_jobs(design_id);
CREATE INDEX idx_print_jobs_printer ON flyer_print_jobs(printer_name);

CREATE TRIGGER update_flyer_print_jobs_updated_at
  BEFORE UPDATE ON flyer_print_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- 4. 問い合わせ記録テーブル
-- ==================================================
CREATE TABLE IF NOT EXISTS flyer_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_datetime TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  inquiry_channel VARCHAR(50) NOT NULL CHECK (inquiry_channel IN ('phone', 'line', 'web', 'visit', 'other')),
  inquiry_type VARCHAR(100) NOT NULL,
  design_id VARCHAR(50),
  distribution_area VARCHAR(200),
  lead_id UUID,
  conversion_possibility VARCHAR(20) CHECK (conversion_possibility IN ('high', 'medium', 'low')),
  handler_name VARCHAR(100),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_design_inquiry FOREIGN KEY (design_id) REFERENCES flyer_designs(design_id) ON DELETE SET NULL
);

-- インデックス
CREATE INDEX idx_inquiries_datetime ON flyer_inquiries(inquiry_datetime DESC);
CREATE INDEX idx_inquiries_design ON flyer_inquiries(design_id);
CREATE INDEX idx_inquiries_area ON flyer_inquiries(distribution_area);
CREATE INDEX idx_inquiries_channel ON flyer_inquiries(inquiry_channel);

CREATE TRIGGER update_flyer_inquiries_updated_at
  BEFORE UPDATE ON flyer_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- 5. AI分析結果保存テーブル
-- ==================================================
CREATE TABLE IF NOT EXISTS flyer_ai_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_week DATE NOT NULL UNIQUE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_distributed INTEGER DEFAULT 0,
  total_inquiries INTEGER DEFAULT 0,
  overall_response_rate DECIMAL(5,2),
  top_performing_designs JSONB,
  top_performing_areas JSONB,
  recommendations TEXT,
  next_week_schedule JSONB,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_ai_analysis_week ON flyer_ai_analysis(analysis_week DESC);

-- ==================================================
-- 6. ビュー: 週次サマリー
-- ==================================================
CREATE OR REPLACE VIEW flyer_weekly_summary AS
SELECT 
  DATE_TRUNC('week', distribution_date) AS week_start,
  COUNT(DISTINCT id) AS distribution_count,
  SUM(quantity) AS total_distributed,
  COUNT(DISTINCT design_id) AS unique_designs,
  COUNT(DISTINCT area) AS unique_areas
FROM flyer_distributions
GROUP BY DATE_TRUNC('week', distribution_date)
ORDER BY week_start DESC;

-- ==================================================
-- 7. ビュー: デザイン別パフォーマンス
-- ==================================================
CREATE OR REPLACE VIEW flyer_design_performance AS
SELECT 
  fd.design_id,
  fd.design_name,
  fd.total_distributed,
  fd.total_inquiries,
  fd.response_rate,
  COUNT(DISTINCT dist.area) AS areas_distributed,
  MAX(dist.distribution_date) AS last_distribution_date
FROM flyer_designs fd
LEFT JOIN flyer_distributions dist ON fd.design_id = dist.design_id
WHERE fd.is_active = true
GROUP BY fd.design_id, fd.design_name, fd.total_distributed, fd.total_inquiries, fd.response_rate
ORDER BY fd.response_rate DESC;

-- ==================================================
-- 8. ビュー: エリア別パフォーマンス
-- ==================================================
CREATE OR REPLACE VIEW flyer_area_performance AS
SELECT 
  dist.area,
  SUM(dist.quantity) AS total_distributed,
  COUNT(DISTINCT inq.id) AS total_inquiries,
  CASE 
    WHEN SUM(dist.quantity) > 0 
    THEN ROUND((COUNT(DISTINCT inq.id)::DECIMAL / SUM(dist.quantity)) * 100, 2)
    ELSE 0 
  END AS response_rate,
  COUNT(DISTINCT dist.design_id) AS unique_designs_used
FROM flyer_distributions dist
LEFT JOIN flyer_inquiries inq ON dist.area = inq.distribution_area
GROUP BY dist.area
ORDER BY response_rate DESC;

-- ==================================================
-- 9. 配布記録作成時のデザイン集計更新トリガー
-- ==================================================
CREATE OR REPLACE FUNCTION update_design_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- 配布枚数を更新
  IF TG_OP = 'INSERT' THEN
    UPDATE flyer_designs
    SET total_distributed = total_distributed + NEW.quantity
    WHERE design_id = NEW.design_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE flyer_designs
    SET total_distributed = total_distributed - OLD.quantity + NEW.quantity
    WHERE design_id = NEW.design_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE flyer_designs
    SET total_distributed = total_distributed - OLD.quantity
    WHERE design_id = OLD.design_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_design_statistics
  AFTER INSERT OR UPDATE OR DELETE ON flyer_distributions
  FOR EACH ROW
  EXECUTE FUNCTION update_design_statistics();

-- ==================================================
-- 10. 問い合わせ記録時のデザイン集計更新トリガー
-- ==================================================
CREATE OR REPLACE FUNCTION update_inquiry_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.design_id IS NOT NULL THEN
    UPDATE flyer_designs
    SET total_inquiries = total_inquiries + 1
    WHERE design_id = NEW.design_id;
  ELSIF TG_OP = 'DELETE' AND OLD.design_id IS NOT NULL THEN
    UPDATE flyer_designs
    SET total_inquiries = total_inquiries - 1
    WHERE design_id = OLD.design_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.design_id IS NOT NULL THEN
      UPDATE flyer_designs
      SET total_inquiries = total_inquiries - 1
      WHERE design_id = OLD.design_id;
    END IF;
    IF NEW.design_id IS NOT NULL THEN
      UPDATE flyer_designs
      SET total_inquiries = total_inquiries + 1
      WHERE design_id = NEW.design_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inquiry_statistics
  AFTER INSERT OR UPDATE OR DELETE ON flyer_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiry_statistics();

-- ==================================================
-- 11. Row Level Security (RLS) ポリシー
-- ==================================================

-- flyer_designs
ALTER TABLE flyer_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "全員が閲覧可能" ON flyer_designs
  FOR SELECT USING (true);

CREATE POLICY "認証ユーザーが作成可能" ON flyer_designs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "認証ユーザーが更新可能" ON flyer_designs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- flyer_distributions
ALTER TABLE flyer_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "全員が閲覧可能" ON flyer_distributions
  FOR SELECT USING (true);

CREATE POLICY "認証ユーザーが作成可能" ON flyer_distributions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "認証ユーザーが更新可能" ON flyer_distributions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- flyer_print_jobs
ALTER TABLE flyer_print_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "全員が閲覧可能" ON flyer_print_jobs
  FOR SELECT USING (true);

CREATE POLICY "認証ユーザーが作成可能" ON flyer_print_jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "認証ユーザーが更新可能" ON flyer_print_jobs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- flyer_inquiries
ALTER TABLE flyer_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "全員が閲覧可能" ON flyer_inquiries
  FOR SELECT USING (true);

CREATE POLICY "認証ユーザーが作成可能" ON flyer_inquiries
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "認証ユーザーが更新可能" ON flyer_inquiries
  FOR UPDATE USING (auth.role() = 'authenticated');

-- flyer_ai_analysis
ALTER TABLE flyer_ai_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "全員が閲覧可能" ON flyer_ai_analysis
  FOR SELECT USING (true);

CREATE POLICY "認証ユーザーが作成可能" ON flyer_ai_analysis
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==================================================
-- 12. サンプルデータ挿入
-- ==================================================

-- サンプルデザイン
INSERT INTO flyer_designs (design_id, design_name, designer_source, appeal_point, is_active) VALUES
('design-001', '買取強化キャンペーン_赤', 'internal', '高額買取を強調、赤系で目立つデザイン', true),
('design-002', 'リフォーム相談_青', 'internal', 'リフォーム事例写真掲載、信頼感のある青系', true),
('design-003', '地域密着_緑', 'internal', '地域実績を強調、親しみやすい緑系', true)
ON CONFLICT (design_id) DO NOTHING;

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE 'チラシマーケティング管理システムのデータベース構築が完了しました';
END $$;
