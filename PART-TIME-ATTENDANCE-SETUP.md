# アルバイト勤怠管理システム

## 概要

このシステムは、アルバイトスタッフの勤怠管理をGPS位置情報付きでリアルタイムに行うためのシステムです。

## 主な機能

### 1. GPS位置情報付き勤怠記録
- 出社・退社時にGPSで現在位置を取得
- 正確な時刻（時:分:秒）で記録
- 住所情報も自動取得

### 2. リアルタイム通知
- 管理画面でリアルタイムに勤怠状況を確認
- 5秒ごとに自動更新
- 最新の出社・退社記録を即座に表示

### 3. カレンダー表示
- 月別カレンダーで勤怠状況を一覧表示
- 日付ごとの出社・退社時刻を視覚的に確認
- 曜日と日付が分かりやすく表示

### 4. 管理機能
- 従業員別・月別での勤怠記録検索
- 統計情報の表示（総勤務日数、総勤務時間、平均勤務時間）
- 詳細な勤怠記録テーブル

## セットアップ手順

### 1. データベースの準備

以下のSQLファイルを実行してテーブルを作成してください：

```bash
psql -d your_database -f database-part-time-attendance-realtime.sql
```

### 2. 環境変数の設定

`.env.local`ファイルに以下を追加：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. アプリケーションの起動

```bash
npm run dev
```

## 使用方法

### アルバイトスタッフ向け（勤怠フォーム）

1. `/part-time-attendance` にアクセス
2. 従業員名を選択
3. 出社または退社を選択
4. 「現在地の位置情報を取得」ボタンをクリック
5. 必要に応じて備考を入力
6. 「出社を記録」または「退社を記録」ボタンをクリック

### 管理者向け（管理画面）

1. `/admin/part-time-attendance` にアクセス
2. リアルタイム通知で最新の勤怠状況を確認
3. カレンダー表示で月別の勤怠状況を確認
4. フィルターで従業員・年月を選択
5. 詳細な勤怠記録テーブルで詳細を確認

## ファイル構成

```
app/
├── part-time-attendance/          # アルバイト勤怠フォーム（フロントエンド）
│   └── page.tsx
├── admin/
│   └── part-time-attendance/      # 管理画面
│       ├── page.tsx               # メイン管理画面
│       ├── form/                  # 勤怠フォーム
│       ├── reports/               # レポート
│       └── shift-request/         # シフト申請
└── api/
    └── part-time-attendance/
        └── realtime/
            └── route.ts           # リアルタイム通知API
```

## データベーススキーマ

### part_time_attendance_realtime テーブル

| カラム名 | 型 | 説明 |
|---------|----|------|
| id | UUID | 主キー |
| employee_id | UUID | 従業員ID（外部キー） |
| attendance_type | TEXT | 勤怠タイプ（'clock_in' または 'clock_out'） |
| location_data | JSONB | GPS位置情報と住所 |
| timestamp | TIMESTAMPTZ | 勤怠記録の時刻 |
| created_at | TIMESTAMPTZ | レコード作成時刻 |
| updated_at | TIMESTAMPTZ | レコード更新時刻 |

### part_time_attendance テーブル（既存）

既存のテーブルに以下のカラムが追加されます：

- `clock_in_location`: 出社時の位置情報
- `clock_out_location`: 退社時の位置情報
- `clock_in_address`: 出社時の住所
- `clock_out_address`: 退社時の住所

## 技術仕様

### フロントエンド
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hooks

### バックエンド
- Next.js API Routes
- Supabase (PostgreSQL)
- リアルタイム更新（5秒間隔）

### GPS機能
- HTML5 Geolocation API
- 逆ジオコーディング（OpenStreetMap Nominatim）
- 高精度位置情報取得

## 注意事項

1. **位置情報の許可**: ブラウザで位置情報の使用を許可する必要があります
2. **HTTPS必須**: GPS機能を使用するにはHTTPS環境が必要です
3. **データ保持期間**: リアルタイム通知データは30日間保持されます
4. **更新頻度**: 管理画面は5秒ごとに自動更新されます

## トラブルシューティング

### 位置情報が取得できない場合
- ブラウザの設定で位置情報を許可しているか確認
- HTTPS環境でアクセスしているか確認
- デバイスのGPS機能が有効になっているか確認

### リアルタイム更新が動作しない場合
- ブラウザのコンソールでエラーを確認
- ネットワーク接続を確認
- APIエンドポイントが正しく動作しているか確認

## 今後の拡張予定

- プッシュ通知機能
- 勤怠レポートのエクスポート
- シフト管理機能の強化
- モバイルアプリ対応

## サポート

システムに関する質問や問題がございましたら、開発チームまでお問い合わせください。
