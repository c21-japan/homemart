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
