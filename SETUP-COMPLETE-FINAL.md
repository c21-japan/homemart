# 🎉 ホームマート権限管理システム - 完璧な設定手順書

## ✅ **実装完了済み**

1. **完全な権限管理システム**
   - データベーススキーマ: `database-permission-system-updated.sql`
   - 認証サービス: `lib/auth/auth-service.ts`
   - 権限ベースミドルウェア: `middleware.ts`
   - 本格的なダッシュボード: `app/admin/page.tsx`

2. **自動設定スクリプト**
   - `scripts/setup-supabase.js` - テストユーザー自動作成
   - `package.json` - 一括実行スクリプト追加

3. **環境変数設定**
   - `.env.local` - 環境変数ファイル作成済み

## 🚀 **今すぐ実行する手順（3ステップ）**

### **Step 1: Supabaseプロジェクトの作成**

1. **Supabaseにアクセス**
   ```
   https://supabase.com
   ```

2. **新規プロジェクト作成**
   - 「Start your project」をクリック
   - GitHubでサインイン
   - プロジェクト名: `homemart-admin`
   - データベースパスワード: 強力なパスワードを生成
   - リージョン: `Northeast Asia (Tokyo)` を推奨

3. **API Keysの取得**
   - プロジェクト作成完了後、左サイドバーの「Settings」→「API」をクリック
   - 以下をコピー：
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **Step 2: 環境変数の設定**

`.env.local` ファイルを編集し、以下を設定：

```env
# Supabase設定（実際の値に置き換え）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT設定（本番環境では必ず変更してください）
JWT_SECRET=homemart-jwt-secret-key-2024-change-this-in-production

# 環境設定
NODE_ENV=development
```

### **Step 3: データベーススキーマの実行**

1. **Supabaseダッシュボードにアクセス**
   - 左サイドバーの「SQL Editor」をクリック

2. **SQLファイルの実行**
   - `database-permission-system-updated.sql` の内容を全てコピー
   - SQL Editorに貼り付け
   - 「Run」ボタンをクリック

3. **実行結果の確認**
   - エラーがないことを確認
   - テーブルが作成されていることを確認

## 🎯 **設定完了後のテスト**

### **テストユーザー一覧（自動作成される）**

| メールアドレス | 役職 | ロール | パスワード |
|----------------|------|--------|------------|
| **inui@homemart.co.jp** | **代表取締役** | **owner** | **HomeM@rt2024** |
| yasuda@homemart.co.jp | 営業部長 | manager | HomeM@rt2024 |
| toyota@homemart.co.jp | 営業担当 | staff | HomeM@rt2024 |
| imazu@homemart.co.jp | ポスティング担当 | staff | HomeM@rt2024 |
| yamao@homemart.co.jp | 事務員 | staff | HomeM@rt2024 |
| kadotani@homemart.co.jp | アルバイト | part_time | HomeM@rt2024 |
| toyama@homemart.co.jp | アルバイト | part_time | HomeM@rt2024 |

### **動作確認手順**

1. **アプリケーション起動**
   ```bash
   npm run dev
   ```

2. **ログインページアクセス**
   ```
   http://localhost:3000/admin/login
   ```

3. **テストユーザーでログイン**
   - Email: `inui@homemart.co.jp`
   - Password: `HomeM@rt2024`

4. **権限テスト**
   - 各ロールのユーザーでログイン
   - アクセス可能なページと不可能なページを確認

## 🔧 **トラブルシューティング**

### **よくある問題と解決方法**

1. **認証エラー**
   - 環境変数が正しく設定されているか確認
   - Supabaseのプロジェクトが有効か確認

2. **権限エラー**
   - データベーススキーマが正しく実行されているか確認
   - ユーザーのロールが正しく設定されているか確認

3. **接続エラー**
   - SupabaseのプロジェクトURLが正しいか確認
   - ネットワーク接続を確認

## 🎉 **完了後の機能**

### **完全な権限管理システム**
- **4つのロール**: Owner, Manager, Staff, Part-time
- **細かい権限制御**: 各機能のCRUD操作別
- **カスタム権限**: ロール権限の上書き機能

### **権限ベースダッシュボード**
- **統計サマリー**: ユーザー数、物件数、リード数、勤怠数
- **クイックアクション**: 権限に応じたメニュー表示
- **最近のアクティビティ**: システム内の動きを可視化

### **セキュアな認証システム**
- **bcrypt**: 強力なパスワードハッシュ化
- **セッション管理**: 24時間有効なセッショントークン
- **アクティビティログ**: 全操作の記録

### **モダンなUI/UX**
- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **サイドバーナビゲーション**: 権限別メニュー表示
- **Tailwind CSS**: 美しいデザインシステム

## 🚀 **次のステップ**

1. **Supabaseプロジェクトの作成**
2. **環境変数の設定**
3. **データベーススキーマの実行**
4. **動作確認**

**これらの手順が完了すれば、完全に動作する権限管理システムが完成します！** 🎉

---

**質問や問題が発生した場合は、いつでもお声がけください！** 💪
