# 🗄️ ホームマート権限管理システム - データベース設定手順

## 🎯 **完了する必要がある設定**

### **1. Supabaseプロジェクトの作成**

1. **Supabaseにアクセス**
   - https://supabase.com にアクセス
   - GitHubアカウントでログイン

2. **新しいプロジェクトを作成**
   - 「New Project」をクリック
   - プロジェクト名: `homemart-admin`
   - データベースパスワード: 安全なパスワードを設定
   - リージョン: `Asia Pacific (Tokyo)` を推奨

3. **プロジェクト情報を取得**
   - プロジェクトURL: `https://xxxxx.supabase.co`
   - anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **2. 環境変数の設定**

#### **ローカル開発環境**
`.env.local` ファイルを作成し、以下を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-super-secret-jwt-key-please-change-this-in-production
NODE_ENV=development
```

#### **Vercel本番環境**
Vercelダッシュボードで環境変数を設定：

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add JWT_SECRET
```

### **3. データベーススキーマの実行**

#### **Supabaseダッシュボードでの実行**

1. **SQL Editorにアクセス**
   - 左サイドバーの「SQL Editor」をクリック

2. **SQLファイルの実行**
   - `database-permission-system-updated.sql` の内容をコピー
   - SQL Editorに貼り付け
   - 「Run」ボタンをクリック

3. **実行結果の確認**
   - エラーがないことを確認
   - テーブルが作成されていることを確認

### **4. 初期データの確認**

#### **作成されるテーブル**
- `auth_users` - ユーザー認証情報
- `user_profiles` - ユーザープロファイル
- `permissions` - 権限マスタ
- `role_permissions` - ロール別権限
- `user_custom_permissions` - カスタム権限
- `activity_logs` - アクティビティログ
- `user_sessions` - セッション管理

#### **作成されるユーザー**
| メールアドレス | 役職 | ロール | パスワード |
|----------------|------|--------|------------|
| inui@homemart.co.jp | 代表取締役 | owner | HomeM@rt2024 |
| yasuda@homemart.co.jp | 営業部長 | manager | HomeM@rt2024 |
| toyota@homemart.co.jp | 営業担当 | staff | HomeM@rt2024 |
| imazu@homemart.co.jp | ポスティング担当 | staff | HomeM@rt2024 |
| yamao@homemart.co.jp | 事務員 | staff | HomeM@rt2024 |
| kadotani@homemart.co.jp | アルバイト | part_time | HomeM@rt2024 |
| toyama@homemart.co.jp | アルバイト | part_time | HomeM@rt2024 |

### **5. 権限システムの確認**

#### **ロール別権限**

**Owner（オーナー）**
- 全権限（システム管理、ユーザー管理、物件管理、リード管理、勤怠管理、レポート）

**Manager（マネージャー）**
- システム管理以外の全権限
- ユーザー閲覧・更新のみ可能

**Staff（スタッフ）**
- 基本業務権限（物件、リード、勤怠、レポート閲覧）

**Part-time（パートタイム）**
- 最小権限（勤怠入力・閲覧、物件・リード閲覧のみ）

### **6. 動作確認**

#### **ログインテスト**
1. アプリケーションにアクセス
2. `/admin/login` にアクセス
3. 上記のユーザーでログイン
4. 権限に応じたメニューが表示されることを確認

#### **権限テスト**
1. 各ロールのユーザーでログイン
2. アクセス可能なページと不可能なページを確認
3. 権限に応じた機能制限が動作することを確認

## 🚨 **重要な注意事項**

### **セキュリティ**
- 本番環境では必ず個別のパスワードを設定
- JWT_SECRETは強力なランダム文字列を使用
- 環境変数は絶対にGitにコミットしない

### **データベース**
- 本番環境では定期的なバックアップを設定
- RLS（Row Level Security）が有効になっていることを確認
- アクティビティログは定期的に確認

### **パフォーマンス**
- 大量のデータがある場合はインデックスの追加を検討
- セッションテーブルの定期的なクリーンアップ

## 🔧 **トラブルシューティング**

### **よくある問題**

1. **認証エラー**
   - 環境変数が正しく設定されているか確認
   - Supabaseのプロジェクトが有効か確認

2. **権限エラー**
   - データベーススキーマが正しく実行されているか確認
   - ユーザーのロールが正しく設定されているか確認

3. **接続エラー**
   - SupabaseのプロジェクトURLが正しいか確認
   - ネットワーク接続を確認

## 📞 **サポート**

問題が発生した場合は、以下を確認してください：

1. ブラウザの開発者ツールのコンソールエラー
2. Supabaseダッシュボードのログ
3. Vercelのデプロイログ

---

**データベース設定が完了すれば、完全に動作する権限管理システムが完成します！** 🎉
