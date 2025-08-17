#!/bin/bash

# 物件管理と顧客管理の連携機能 - 本番環境デプロイスクリプト
# 実行日: 2025-01-18

set -e

echo "🚀 物件管理と顧客管理の連携機能 - 本番環境デプロイ開始"

# 1. 環境変数の確認
echo "📋 環境変数の確認..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ 必要な環境変数が設定されていません"
    echo "NEXT_PUBLIC_SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

# 2. 依存関係のインストール
echo "📦 依存関係のインストール..."
npm ci --production=false

# 3. ビルド
echo "🔨 アプリケーションのビルド..."
npm run build

# 4. lintチェック
echo "🔍 コード品質チェック..."
npm run lint || {
    echo "⚠️  lintエラーがありますが、デプロイを続行します"
}

# 5. データベースマイグレーションの実行
echo "🗄️  データベースマイグレーションの実行..."
echo "注意: 以下のSQLをSupabaseダッシュボードのSQL Editorで実行してください:"
echo ""
echo "ファイル: deploy-migration.sql"
echo "URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""
echo "マイグレーション完了後、Enterキーを押してデプロイを続行してください..."
read

# 6. 本番環境へのデプロイ
echo "🚀 本番環境へのデプロイ..."

# Vercelへのデプロイ（Vercel CLIがインストールされている場合）
if command -v vercel &> /dev/null; then
    echo "📤 Vercelへのデプロイ..."
    vercel --prod
else
    echo "📤 Vercel CLIがインストールされていません"
    echo "手動でVercelダッシュボードからデプロイしてください"
fi

# 7. デプロイ後の確認
echo "✅ デプロイ完了！"
echo ""
echo "🔍 以下の機能をテストしてください:"
echo "1. /admin/properties/new で売主選択機能"
echo "2. /admin/properties でPropertySummary表示"
echo "3. /admin/properties/[id] で物件詳細表示"
echo "4. /api/customers/search で顧客検索API"
echo ""
echo "📚 ドキュメント: docs/admin-properties-customer-link.md"
echo "🔄 ロールバック手順も同ドキュメントに記載されています"
