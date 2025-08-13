# ホームマート統合システム デプロイ手順書

## 📋 概要

このドキュメントでは、ホームマート統合営業・業務管理システムを本番環境にデプロイする手順を説明します。

## 🎯 デプロイ対象

- **フロントエンド**: Next.js 14 (App Router)
- **バックエンド**: Supabase (Database, Auth, Storage)
- **ホスティング**: Vercel
- **ドメイン**: homemart.co.jp
- **環境**: Production

## 🚀 事前準備

### 1. 必要なツール

```bash
# Node.js (v18以上)
node --version

# npm
npm --version

# Vercel CLI
npm install -g vercel

# Supabase CLI
npm install -g supabase

# Git
git --version
```

### 2. アカウント設定

- [Vercel](https://vercel.com) アカウント
- [Supabase](https://supabase.com) アカウント
- [Mailjet](https://mailjet.com) アカウント
- [LINE Developers](https://developers.line.biz) アカウント

## 🔧 環境設定

### 1. 環境変数ファイルの作成

`.env.production` ファイルを作成し、以下の内容を設定：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# メール送信設定
MAILJET_API_KEY=your_production_mailjet_api_key
MAILJET_API_SECRET=your_production_mailjet_api_secret
MAILJET_FROM_EMAIL=noreply@homemart.co.jp

# 管理者メール
ADMIN_EMAIL=admin@homemart.co.jp

# サイトURL
NEXT_PUBLIC_SITE_URL=https://homemart.co.jp

# 外部API連携
CENTURY21_API_KEY=your_century21_api_key
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret
PLAUD_API_KEY=your_plaud_api_key
OPENAI_API_KEY=your_openai_api_key

# Vercel Cron
CRON_SECRET=your_cron_secret_key
```

### 2. Supabaseプロジェクトの設定

```bash
# Supabase CLIでログイン
supabase login

# プロジェクトリンク
supabase link --project-ref your-project-ref

# 環境変数の確認
supabase status
```

## 🗄️ データベースセットアップ

### 1. データベーススクリプトの実行

```bash
# 本番環境用スクリプトを実行
psql -h your-supabase-host -U postgres -d postgres -f scripts/deploy-production.sql
```

または、Supabase CLIを使用：

```bash
# データベースにプッシュ
supabase db push --project-ref your-project-ref
```

### 2. Storageバケットの作成

```bash
# 必要なバケットを作成
supabase storage create lead-photos --project-ref your-project-ref
supabase storage create checklist-attachments --project-ref your-project-ref
supabase storage create audio-records --project-ref your-project-ref
supabase storage create general-documents --project-ref your-project-ref
```

### 3. RLSポリシーの確認

```bash
# ポリシーの確認
supabase db diff --project-ref your-project-ref
```

## 🌐 Vercelデプロイ

### 1. プロジェクトの初期化

```bash
# Vercelプロジェクトの初期化
vercel

# プロジェクト名: homemart-integration-system
# フレームワーク: Next.js
# ルートディレクトリ: ./
```

### 2. 環境変数の設定

```bash
# 本番環境変数を設定
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add MAILJET_API_KEY production
# ... 他の環境変数も同様に設定
```

### 3. ドメインの設定

```bash
# カスタムドメインを追加
vercel domains add homemart.co.jp

# DNSレコードの確認
vercel domains verify homemart.co.jp
```

### 4. 本番デプロイ

```bash
# 本番環境にデプロイ
vercel --prod --confirm
```

## 🔄 自動デプロイの設定

### 1. GitHub連携

```bash
# GitHubリポジトリと連携
vercel git connect

# 自動デプロイの設定
vercel git connect --repo your-username/homemart-system
```

### 2. 環境別デプロイ

- **mainブランチ**: 本番環境
- **developブランチ**: ステージング環境
- **featureブランチ**: プレビュー環境

## 📱 PWA設定

### 1. Web Manifest

```json
{
  "name": "ホームマート",
  "short_name": "ホームマート",
  "description": "不動産・リフォーム統合営業・業務管理システム",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker

```bash
# Service Workerのビルド
npm run build:sw

# オフライン機能のテスト
npm run test:offline
```

## 🔔 通知システムの設定

### 1. LINE公式アカウント

```bash
# Webhook URLの設定
https://homemart.co.jp/api/integrations/line

# 署名検証の確認
curl -X POST https://homemart.co.jp/api/integrations/line \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

### 2. メール通知

```bash
# Mailjet設定の確認
curl -X POST https://homemart.co.jp/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "subject": "テスト", "content": "テストメール"}'
```

## ⏰ 定期実行タスク

### 1. Vercel Cron設定

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-tasks",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### 2. 定期実行のテスト

```bash
# 手動実行でテスト
curl -X POST https://homemart.co.jp/api/cron/daily-tasks \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json" \
  -d '{"task": "all"}'
```

## 🧪 デプロイ後のテスト

### 1. 基本機能テスト

```bash
# ヘルスチェック
curl https://homemart.co.jp/api/health

# 認証テスト
curl https://homemart.co.jp/api/auth/status

# データベース接続テスト
curl https://homemart.co.jp/api/test/db
```

### 2. PWA機能テスト

- ホーム画面への追加
- オフライン動作
- プッシュ通知
- バックグラウンド同期

### 3. 外部連携テスト

- センチュリー21システム
- LINE公式アカウント
- PLAUD note AI
- メール送信

## 📊 監視・ログ

### 1. Vercel Analytics

```bash
# Analyticsの有効化
vercel analytics enable

# パフォーマンス監視の設定
vercel analytics
```

### 2. エラー監視

```bash
# エラーログの確認
vercel logs --follow

# 特定のエンドポイントのログ
vercel logs /api/leads
```

## 🔒 セキュリティ設定

### 1. 環境変数の暗号化

```bash
# 機密情報の暗号化
vercel env encrypt SUPABASE_SERVICE_ROLE_KEY
vercel env encrypt MAILJET_API_SECRET
```

### 2. アクセス制御

```bash
# IP制限の設定
vercel domains protect homemart.co.jp --allowed-ips 192.168.1.0/24

# 認証の確認
vercel auth verify
```

## 🚨 トラブルシューティング

### 1. よくある問題

**デプロイエラー**
```bash
# ログの確認
vercel logs --follow

# 環境変数の確認
vercel env ls
```

**データベース接続エラー**
```bash
# Supabase接続の確認
supabase status

# 接続文字列の確認
echo $NEXT_PUBLIC_SUPABASE_URL
```

**PWA動作しない**
```bash
# Service Workerの確認
curl https://homemart.co.jp/service-worker.js

# Manifestの確認
curl https://homemart.co.jp/manifest.webmanifest
```

### 2. ロールバック手順

```bash
# 前のバージョンに戻す
vercel rollback

# 特定のバージョンに戻す
vercel rollback --to=deployment-id
```

## 📈 パフォーマンス最適化

### 1. 画像最適化

```bash
# 画像の最適化
npm run optimize:images

# WebP変換
npm run convert:webp
```

### 2. バンドルサイズの最適化

```bash
# バンドル分析
npm run analyze

# 不要な依存関係の削除
npm run clean:deps
```

## 🎉 デプロイ完了

### 1. 最終確認チェックリスト

- [ ] アプリケーションが正常に起動
- [ ] データベース接続が正常
- [ ] 認証システムが動作
- [ ] PWA機能が正常
- [ ] 外部連携が動作
- [ ] 通知システムが動作
- [ ] 定期実行タスクが動作
- [ ] セキュリティ設定が適切

### 2. 運用開始

```bash
# 運用開始通知
curl -X POST https://homemart.co.jp/api/notifications/deploy-complete \
  -H "Content-Type: application/json" \
  -d '{"environment": "production", "version": "1.0.0"}'
```

## 📞 サポート

デプロイに関する問題が発生した場合は、以下までご連絡ください：

- **技術サポート**: tech@homemart.co.jp
- **緊急時**: 080-XXXX-XXXX
- **ドキュメント**: https://docs.homemart.co.jp

---

**最終更新**: $(date)
**バージョン**: 1.0.0
**担当者**: システム開発チーム
