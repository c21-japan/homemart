# ホームマート

センチュリー21 ホームマートの不動産・リフォーム総合サービスサイト

## 環境変数セットアップ

### 必須環境変数

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Clerk認証（本番/プレビュー必須）
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Sentry監視（本番運用推奨）
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_DSN=your_sentry_dsn_here
```

### Vercel環境変数設定

1. **Production環境**
   - Vercelダッシュボード → プロジェクト → Settings → Environment Variables
   - 上記の必須環境変数を全て設定

2. **Preview環境**
   - 同じ環境変数をPreview環境にも設定
   - 特にClerkキーは本番と異なる値を使用

3. **ローカル開発**
   - `.env.local`ファイルを作成
   - `env-example.txt`を参考に設定

### Clerk認証の有効化

```bash
# Clerkを有効にする場合
DISABLE_CLERK=0

# Clerkを無効にする場合（モック運用）
DISABLE_CLERK=1
```

## 開発・ビルド

```bash
# 依存関係チェック
npm run check-deps

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# CI用ビルド（依存関係チェック付き）
npm run build:ci
```

## デプロイ

### Vercel自動デプロイ

- `main`ブランチへのプッシュで自動デプロイ
- 環境変数が正しく設定されていることを確認

### 手動デプロイ

```bash
# Vercel CLIを使用
vercel --prod
```

## トラブルシューティング

### ビルド失敗時の確認事項

1. **環境変数の設定確認**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

2. **依存関係の確認**
   ```bash
   npm run check-deps
   ```

3. **ローカルビルドテスト**
   ```bash
   npm run build:ci
   ```

### よくある問題

- **Clerk認証エラー**: 環境変数の設定漏れ
- **ビルド時のフック評価エラー**: `dynamic = 'force-dynamic'`の設定確認
- **Edge Runtimeエラー**: `runtime = 'nodejs'`の設定確認

## 📋 **実装済み機能**

### **✅ 新規顧客登録フォーム**
- カテゴリ別の動的フィールド（売却/購入/リフォーム）
- 物件種別の詳細情報（マンション/土地/戸建）
- 打ち合わせ記録（タイトル、日時、内容、写真30枚まで）
- 完全なバリデーション

### **✅ 顧客一覧ページ**
- KPIカード（総顧客数、報告待ち、期限超過、リフォーム粗利、成約率）
- 期日バッジ・色分け（報告期限超過、報告期限間近）
- 検索・フィルター機能
- ステータス表示

### **✅ 顧客詳細ページ**
- 顧客基本情報の表示・編集
- カテゴリ別詳細情報の表示
- 打ち合わせ記録の表示
- チェックリストの表示
- 統計情報の表示

### **✅ 自動チェックリスト・リマインド生成**
- 売却チェックリスト（90日後期限）
- 購入チェックリスト（120日後期限）
- リフォームチェックリスト（60日後期限）
- 媒介リマインド（開始日、1週間後、1ヶ月後）
- 現地調査リマインド（前日、当日）

## 🔧 **技術スタック**

- **フロントエンド**: Next.js 15.4.6, React, TypeScript
- **認証**: Clerk
- **データベース**: Supabase (PostgreSQL)
- **スタイリング**: Tailwind CSS
- **日付処理**: date-fns
- **メール送信**: Mailjet

## 📁 **ファイル構成**

```
app/
├── admin/
│   ├── customers/
│   │   ├── page.tsx          # 顧客一覧
│   │   ├── new/
│   │   │   └── page.tsx      # 新規顧客登録
│   │   └── [id]/
│   │       └── page.tsx      # 顧客詳細
│   └── attendance/
│       └── page.tsx          # 勤怠管理
├── api/
│   └── cron/                 # 定期実行タスク
├── components/
│   └── customers/
│       └── MeetingRecord.tsx # 打ち合わせ記録コンポーネント
├── lib/
│   ├── supabase-direct.ts    # Supabaseクライアント
│   └── supabase-server.ts    # サーバーサイドSupabase
├── server/
│   └── actions/
│       └── customers.ts      # 顧客関連サーバーアクション
└── scripts/
    └── create-checklist-templates.sql # データベースセットアップSQL
```

## 🚀 **次のステップ**

1. **データベーステーブルの作成** - SupabaseダッシュボードでSQL実行
2. **環境変数の設定** - `.env.local` ファイルの作成
3. **アプリケーションの起動** - `npm run dev`
4. **機能テスト** - 新規顧客登録、一覧表示、詳細表示

## 📞 **サポート**

問題が発生した場合は、以下を確認してください：

1. 環境変数が正しく設定されているか
2. データベーステーブルが作成されているか
3. Supabaseプロジェクトの設定が正しいか
4. Clerk認証の設定が正しいか
