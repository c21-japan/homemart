-- ホームマート管理システム - パスワード更新スクリプト
-- 実行日時: $(date)

-- 乾代表のパスワードハッシュを更新
UPDATE auth_users 
SET password_hash = '$2b$12$0YGnxJsBgRiMArU6ejL1DOCqKGHCcxWwvbQGiEmArULXHBSJ9XEr2',
    updated_at = NOW()
WHERE email = 'inui@homemart.co.jp';

-- 更新結果を確認
SELECT 
    id,
    email,
    role,
    is_active,
    CASE 
        WHEN password_hash = '$2b$12$0YGnxJsBgRiMArU6ejL1DOCqKGHCcxWwvbQGiEmArULXHBSJ9XEr2' 
        THEN '✅ 更新完了' 
        ELSE '❌ 更新失敗' 
    END as update_status,
    LENGTH(password_hash) as hash_length,
    updated_at
FROM auth_users 
WHERE email = 'inui@homemart.co.jp';

-- 完了メッセージ
SELECT '🎉 パスワード更新が完了しました！' as message;
