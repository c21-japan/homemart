# ホームマート顧客管理システム

## 🚀 **セットアップ手順**

### **1. データベーステーブルの作成**

Supabaseダッシュボードで以下のSQLを実行してください：

```sql
-- チェックリストテンプレートと関連テーブルの作成
-- scripts/create-checklist-templates.sql の内容をコピーして実行
```

### **2. 環境変数の設定**

`.env.local` ファイルに以下を設定：

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Mailjet (オプション)
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_API_SECRET=your_mailjet_api_secret
MAILJET_FROM_EMAIL=noreply@yourdomain.com
```

### **3. アプリケーションの起動**

```bash
npm install
npm run dev
```

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
