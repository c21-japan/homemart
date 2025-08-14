# ホームマート管理システム

## 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT設定
JWT_SECRET=your_jwt_secret_here

# メール設定
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@homemart.co.jp

# Google API設定
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# その他の設定
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## セットアップ手順

1. 依存関係のインストール
```bash
npm install
```

2. 環境変数の設定
```bash
cp .env.example .env.local
# .env.localファイルを編集して実際の値を設定
```

3. データベースのセットアップ
```bash
npm run setup:db
```

4. 開発サーバーの起動
```bash
npm run dev
```

## 主な機能

- 管理画面（認証付き）
- 顧客管理
- 物件管理
- リフォーム案件管理
- アルバイト勤怠管理
- 社内申請管理

## 技術スタック

- Next.js 15
- TypeScript
- Supabase
- Tailwind CSS
- React Query
