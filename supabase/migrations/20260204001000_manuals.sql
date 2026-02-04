-- Manuals table for internal knowledge base
CREATE TABLE IF NOT EXISTS manuals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid()
);

ALTER TABLE manuals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view manuals" ON manuals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert manuals" ON manuals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update manuals" ON manuals
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete manuals" ON manuals
  FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE manuals
  ADD CONSTRAINT manuals_category_check
  CHECK (category IN ('工務部', '営業/事務'));

CREATE INDEX IF NOT EXISTS manuals_category_idx ON manuals(category);
CREATE INDEX IF NOT EXISTS manuals_updated_at_idx ON manuals(updated_at DESC);

-- Videos linked to manuals
CREATE TABLE IF NOT EXISTS manual_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manual_id UUID NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  title TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid()
);

ALTER TABLE manual_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view manual videos" ON manual_videos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert manual videos" ON manual_videos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update manual videos" ON manual_videos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete manual videos" ON manual_videos
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS manual_videos_manual_id_idx ON manual_videos(manual_id);

-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_manuals_updated_at ON manuals;
CREATE TRIGGER update_manuals_updated_at
  BEFORE UPDATE ON manuals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for manual videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('manual-videos', 'manual-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for manual videos
CREATE POLICY "Manual videos are readable by authenticated users" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'manual-videos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Manual videos are insertable by authenticated users" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'manual-videos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Manual videos are updatable by authenticated users" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'manual-videos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Manual videos are deletable by authenticated users" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'manual-videos' AND auth.role() = 'authenticated'
  );
