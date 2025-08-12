# ホームマート - 不動産・リフォームサービス

センチュリー21加盟店の不動産会社ホームマートの公式ウェブサイトです。物件検索、売却査定、リフォームサービスを提供しています。

## 機能

### 物件管理
- 物件の登録・編集・削除
- 物件検索・一覧表示
- おすすめ物件の設定

### リフォームサービス
- リフォームサービスの紹介
- 施工実績の表示
- 各種リフォーム工事の説明

### 施工実績管理
- リフォーム施工実績の登録・編集・削除
- 写真とタイトル、説明文の管理
- 管理画面からの一括管理

### お問い合わせ管理
- お客様からのお問い合わせの管理
- ステータス管理

### 社内申請管理
- 従業員からの各種申請の管理
- 有給申請、病気休暇、残業申請、経費申請など
- 申請の承認・却下処理
- スプレッドシート形式での申請一覧表示

## 技術スタック

- **フロントエンド**: Next.js 14, React, TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **画像管理**: Supabase Storage
- **デプロイ**: Vercel

## セットアップ

### 必要な環境変数

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**重要**: 画像アップロード機能を使用するには、`SUPABASE_SERVICE_ROLE_KEY`の設定が必須です。

#### 環境変数の取得方法

1. [Supabase](https://supabase.com) にログイン
2. プロジェクトを選択
3. 設定 → API から以下を取得：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role secret → `SUPABASE_SERVICE_ROLE_KEY`

#### 画像アップロード機能の設定

1. Supabase Storageで`images`バケットを作成
2. `supabase-storage-policies.sql`の内容をSQLエディタで実行
3. バケットの公開設定を有効化

### データベースのセットアップ

1. Supabaseプロジェクトを作成
2. 以下のSQLファイルをSupabaseのSQLエディタで実行：
   - `database-setup.sql` - 基本的なテーブル構造
   - `database-update-reform-projects.sql` - リフォーム施工実績テーブル
   - `database-internal-applications.sql` - 社内申請管理テーブル
   - `supabase-storage-policies.sql` - 画像アップロード用のストレージポリシー
3. 認証設定を有効化
4. Storageで`images`バケットを作成し、公開設定を有効化

### 開発サーバーの起動

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションを確認できます。

## 管理画面

管理画面は `/admin` からアクセスできます。

### 主な機能
- ダッシュボード（統計情報の表示）
- 物件管理
- 施工実績管理
- お問い合わせ管理
- 画像管理
- 社内申請管理

## リフォーム機能

### リフォームページ
- `/reform` でリフォームサービスの紹介
- 各種リフォーム工事の説明
- 施工実績の表示

### 施工実績管理
- 管理画面から施工実績の追加・編集・削除
- 写真、タイトル、説明文の管理
- 登録日時の自動記録

## 社内申請機能

### 申請フォーム
- `/admin/internal-applications/forms/*` で各種申請フォーム
- 有給申請、病気休暇、残業申請、経費申請、その他申請
- 各フォームに適した入力項目とバリデーション

### 申請管理
- `/admin/internal-applications` で申請一覧の管理
- スプレッドシート形式での申請一覧表示
- 申請の承認・却下処理
- フィルタリング機能（種別、ステータス）
- 申請詳細の表示と編集

## デプロイ

Vercelを使用したデプロイが推奨されます：

1. GitHubリポジトリとVercelを連携
2. 環境変数を設定
3. 自動デプロイが有効化

## ライセンス

© 2024 CENTURY 21 HomeMart. All Rights Reserved.
