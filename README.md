# ホームマート PWA

奈良県北葛城郡の不動産会社ホームマートのPWA（Progressive Web App）システムです。

## 🚀 主な機能

### 顧客向け機能
- **物件検索・閲覧**: エリア別、路線・駅別の物件検索
- **お気に入り物件**: 気に入った物件をお気に入りに登録
- **検索履歴**: 検索条件の履歴保存
- **お問い合わせ履歴**: 物件に関するお問い合わせの履歴
- **会員機能**: ログイン・アカウント管理

### 社員向け管理機能
- **権限ベースアクセス制御**: 役職に応じた機能制限
- **物件管理**: 物件の登録・編集・削除
- **リード管理**: 顧客からの問い合わせ管理
- **勤怠管理**: パートタイム社員の勤怠入力・管理
- **経費管理**: 経費申請・承認システム
- **リフォーム管理**: 施工実績の管理
- **メディア管理**: 画像・ファイルの管理

## 🏗️ 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイリング**: Tailwind CSS
- **バックエンド**: Supabase (PostgreSQL, Auth, Storage)
- **PWA**: Service Worker, Web App Manifest
- **認証**: Supabase Auth
- **データベース**: PostgreSQL with RLS

## 📱 PWA機能

### インストール
- ホーム画面への追加
- スタンドアロンモードでの動作
- オフライン対応

### オフライン機能
- 静的アセットのキャッシュ
- 検索履歴のローカル保存
- オフライン時の基本表示

### プッシュ通知
- iOS 16.4+ 対応
- 新着物件・お問い合わせの通知

## 🔐 権限システム

### 役職別権限
- **管理者 (admin)**: 全機能へのアクセス
- **管理職 (manager)**: 管理・承認機能
- **一般社員 (staff)**: 基本業務機能
- **パートタイム (part_time)**: 限定機能

### 権限カテゴリー
- 物件管理
- リード管理
- お問い合わせ管理
- 社員管理
- 勤怠管理
- 経費管理
- リフォーム管理
- メディア管理
- レポート・分析
- システム設定

## 🗄️ データベース構造

### 主要テーブル
- `properties`: 物件情報
- `favorite_properties`: お気に入り物件
- `search_history`: 検索履歴
- `staff_members`: 社員情報・権限
- `permissions`: 権限定義
- `leads`: リード情報
- `inquiries`: お問い合わせ
- `attendance`: 勤怠情報
- `expenses`: 経費申請
- `reform_projects`: リフォーム施工実績

### セキュリティ
- Row Level Security (RLS) によるデータアクセス制御
- ユーザー認証による権限チェック
- 役職ベースの機能制限

## 🚀 セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. データベースのセットアップ
```bash
# Supabaseでデータベーススキーマを実行
psql -h your_host -U your_user -d your_db -f database-pwa-setup.sql
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

## 📁 ディレクトリ構造

```
homemart/
├── app/                          # Next.js App Router
│   ├── admin/                   # 社員向け管理画面
│   ├── member/                  # 顧客向け会員ページ
│   ├── api/                     # API エンドポイント
│   └── ...
├── components/                   # React コンポーネント
│   ├── AdminNavigation.tsx      # 管理画面ナビゲーション
│   ├── PWAInstallPrompt.tsx     # PWAインストール促進
│   └── ...
├── lib/                         # ユーティリティ・ライブラリ
│   ├── supabase/                # Supabase 関連
│   └── ...
├── public/                      # 静的ファイル
│   ├── manifest.webmanifest     # PWA マニフェスト
│   ├── service-worker.js        # Service Worker
│   └── icons/                   # PWA アイコン
└── ...
```

## 🔧 カスタマイズ

### PWA設定の変更
- `public/manifest.webmanifest`: アプリ名、アイコン、テーマカラー
- `public/service-worker.js`: キャッシュ戦略、オフライン対応

### 権限の追加
- `lib/supabase/staff-permissions.ts`: 新しい権限の定義
- `database-pwa-setup.sql`: データベーススキーマの更新

### デザインの変更
- `tailwind.config.js`: Tailwind CSS の設定
- `app/globals.css`: グローバルスタイル

## 📱 PWA対応ブラウザ

- Chrome (Android)
- Safari (iOS 16.4+)
- Edge
- Firefox

## 🚀 デプロイ

### Vercel
```bash
npm run build
vercel --prod
```

### その他のプラットフォーム
- Netlify
- AWS Amplify
- 自前のサーバー

## 📄 ライセンス

このプロジェクトは非公開の商用システムです。

## 🤝 サポート

技術的な質問や問題がある場合は、開発チームまでお問い合わせください。

---

**ホームマート** - センチュリー21加盟店 | 奈良県北葛城郡
