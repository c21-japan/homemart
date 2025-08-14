#!/bin/bash

# ホームマート統合システム デプロイスクリプト
# 使用方法: ./scripts/deploy.sh [environment]
# environment: production, staging (デフォルト: production)

set -e

# 色付きログ関数
log_info() {
    echo -e "\033[32m[INFO]\033[0m $1"
}

log_warn() {
    echo -e "\033[33m[WARN]\033[0m $1"
}

log_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

log_success() {
    echo -e "\033[32m[SUCCESS]\033[0m $1"
}

# 環境設定
ENVIRONMENT=${1:-production}

if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "staging" ]]; then
    log_error "無効な環境です。'production' または 'staging' を指定してください。"
    exit 1
fi

log_info "デプロイ環境: $ENVIRONMENT"

# 現在のディレクトリを確認
if [[ ! -f "package.json" ]]; then
    log_error "package.jsonが見つかりません。プロジェクトルートで実行してください。"
    exit 1
fi

# 依存関係のインストール
log_info "依存関係をインストール中..."
npm install

# ビルド
log_info "プロジェクトをビルド中..."
npm run build

if [[ $? -eq 0 ]]; then
    log_success "ビルドが完了しました"
else
    log_error "ビルドに失敗しました"
    exit 1
fi

# 環境変数の確認
log_info "環境変数を確認中..."
if [[ -f ".env.$ENVIRONMENT" ]]; then
    log_info ".env.$ENVIRONMENT ファイルが見つかりました"
else
    log_warn ".env.$ENVIRONMENT ファイルが見つかりません"
fi

# Vercelデプロイ
log_info "Vercelにデプロイ中..."

if [[ "$ENVIRONMENT" == "production" ]]; then
    log_info "本番環境にデプロイ中..."
    vercel --prod --confirm
else
    log_info "ステージング環境にデプロイ中..."
    vercel --confirm
fi

if [[ $? -eq 0 ]]; then
    log_success "デプロイが完了しました"
else
    log_error "デプロイに失敗しました"
    exit 1
fi

# デプロイ後の確認
log_info "デプロイ後の確認中..."

# 最新のデプロイメント情報を取得
DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "取得できませんでした")

if [[ "$DEPLOYMENT_URL" != "取得できませんでした" ]]; then
    log_info "デプロイメントURL: $DEPLOYMENT_URL"
    
    # ヘルスチェック
    log_info "ヘルスチェックを実行中..."
    if curl -s -f "$DEPLOYMENT_URL" > /dev/null; then
        log_success "アプリケーションが正常に応答しています"
    else
        log_warn "アプリケーションの応答を確認できませんでした"
    fi
else
    log_warn "デプロイメントURLを取得できませんでした"
fi

# 環境別の設定
if [[ "$ENVIRONMENT" == "production" ]]; then
    URL="https://your-domain.com"
    log_info "本番環境の設定が完了しました"
elif [[ "$ENVIRONMENT" == "staging" ]]; then
    URL="https://staging.your-domain.com"
    log_info "ステージング環境の設定が完了しました"
fi

# 完了メッセージ
log_success "デプロイが完了しました！"
log_info "環境: $ENVIRONMENT"
log_info "URL: $URL"

if [[ "$ENVIRONMENT" == "production" ]]; then
    log_info "管理画面: $URL/admin"
    log_info "API エンドポイント: $URL/api"
fi

# 次のステップ
log_info "次のステップ:"
log_info "1. アプリケーションの動作確認"
log_info "2. 外部連携のテスト"
log_info "3. 監視設定の確認"
log_info "4. ユーザーへの通知"

log_success "デプロイスクリプトが完了しました！"
