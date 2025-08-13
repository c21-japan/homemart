-- Supabase Storageのimagesバケットにポリシーを設定

-- 1. 画像のアップロードを許可（認証済みユーザーのみ）
CREATE POLICY "認証済みユーザーは画像をアップロード可能" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND 
    auth.role() = 'authenticated'
  );

-- 2. 画像の読み取りを許可（誰でもアクセス可能）
CREATE POLICY "誰でも画像を読み取り可能" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'images'
  );

-- 3. 画像の更新を許可（認証済みユーザーのみ）
CREATE POLICY "認証済みユーザーは画像を更新可能" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' AND 
    auth.role() = 'authenticated'
  );

-- 4. 画像の削除を許可（認証済みユーザーのみ）
CREATE POLICY "認証済みユーザーは画像を削除可能" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' AND 
    auth.role() = 'authenticated'
  );

-- 内部申請用ストレージバケットの作成
INSERT INTO storage.buckets (id, name, public) 
VALUES ('internal-applications', 'internal-applications', false)
ON CONFLICT (id) DO NOTHING;

-- 医師の診断書用フォルダポリシー
CREATE POLICY "Doctor notes are accessible by admins" ON storage.objects
  FOR ALL USING (
    bucket_id = 'internal-applications' 
    AND storage.foldername(name) = 'doctor_notes'
    AND auth.role() = 'admin'
  );

-- レシート・領収書用フォルダポリシー
CREATE POLICY "Receipts are accessible by admins" ON storage.objects
  FOR ALL USING (
    bucket_id = 'internal-applications' 
    AND storage.foldername(name) = 'receipts'
    AND auth.role() = 'admin'
  );

-- ファイルアップロードポリシー（管理者のみ）
CREATE POLICY "Admins can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'internal-applications' 
    AND auth.role() = 'admin'
  );

-- ファイル削除ポリシー（管理者のみ）
CREATE POLICY "Admins can delete files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'internal-applications' 
    AND auth.role() = 'admin'
  );

-- ファイル更新ポリシー（管理者のみ）
CREATE POLICY "Admins can update files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'internal-applications' 
    AND auth.role() = 'admin'
  );
