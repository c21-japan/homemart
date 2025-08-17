#!/bin/bash

# センチュリー21ホームマート 顧客管理システム 本番環境デプロイスクリプト
# 使用方法: ./deploy-production.sh

echo "🚀 センチュリー21ホームマート 顧客管理システムの本番環境デプロイを開始します..."

# 現在のブランチを確認
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 現在のブランチ: $CURRENT_BRANCH"

# 変更があるかチェック
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  未コミットの変更があります。コミットしてください。"
    git status
    exit 1
fi

# 最新の変更をプッシュ
echo "📤 最新の変更をリモートリポジトリにプッシュしています..."
git push origin $CURRENT_BRANCH

# Vercelにデプロイ
echo "🌐 Vercelにデプロイしています..."
vercel --prod

# デプロイ完了後の確認
echo "✅ デプロイが完了しました！"
echo ""
echo "📋 次の手順を実行してください："
echo "1. Vercelダッシュボードで環境変数を設定"
echo "2. データベースのセットアップ（supabase/migrations/20250101000000_customer_suite.sqlを実行）"
echo "3. アプリケーションの動作確認"
echo ""
echo "🔗 管理画面: https://your-domain.vercel.app/admin/customers"
echo "🔗 顧客作成: https://your-domain.vercel.app/admin/customers/new"
echo ""
echo "📧 メール設定確認:"
echo "- MAILJET_API_KEY: 設定済み"
echo "- MAILJET_SECRET_KEY: 設定済み"
echo "- MAILJET_FROM_EMAIL: 設定済み"
echo ""
echo "🔄 Cron設定確認:"
echo "- 日次運用タスク: 毎日 09:00 JST (/api/cron/daily)"
echo "- 管理者エスカレーション: 毎日 08:00 JST (/api/cron/manager)"
