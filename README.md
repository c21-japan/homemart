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
   - `database-part-time-attendance.sql` - アルバイト勤怠管理テーブル
   - `database-shift-requests.sql` - シフト申請・給与計算テーブル
   - `database-leads.sql` - リード（顧客情報）管理テーブル
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
- リード（顧客情報）管理
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

## アルバイト勤怠管理機能

#### 管理画面
- `/admin/part-time-attendance` でアルバイトの勤怠記録を管理
- カドタニとトヤマの出社・退社時間を同じ行に表示
- 名前や年月でフィルタリング可能
- 統計情報（総勤務日数、総勤務時間、平均勤務時間）の表示

#### 勤怠フォーム
- `/admin/part-time-attendance/form` で管理画面用の勤怠フォーム
- `/part-time-attendance` でアルバイト専用の勤怠フォーム
- 従業員名をプルダウンで選択
- 出社・退社を選択して記録
- GPS位置情報の自動取得と住所表示
- 申請フォームを送信した時間で勤怠記録
- 同じ日に複数回の記録がある場合は自動更新

#### シフト申請・管理
- `/admin/part-time-attendance/shift-request` でシフト申請フォーム
- カレンダーから複数日を一括選択
- シフト申請、勤務可能日、休暇申請の3種類
- 複数日一括申請で効率的なシフト管理

#### 勤怠レポート・給与計算
- `/admin/part-time-attendance/reports` で月次・年次レポート
- 従業員別統計情報の表示
- 給与計算の自動生成（通常勤務・残業・祝日）
- CSVエクスポート機能

#### 個人ページ
- `/part-time-attendance/profile/[id]` でアルバイト個人の勤怠状況
- 月別勤怠記録の確認
- シフト申請状況の確認
- 給与計算結果の表示
- モバイル対応の美しいUI

## デプロイ

Vercelを使用したデプロイが推奨されます：

1. GitHubリポジトリとVercelを連携
2. 環境変数を設定
3. 自動デプロイが有効化

## ライセンス

© 2024 CENTURY 21 HomeMart. All Rights Reserved.
