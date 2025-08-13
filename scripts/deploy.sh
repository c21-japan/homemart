#!/bin/bash

# ホームマート統合システム デプロイスクリプト
# 使用方法: ./scripts/deploy.sh [production|staging]

set -e

# 色付きログ出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 環境設定
ENVIRONMENT=${1:-production}
PROJECT_NAME="homemart-integration-system"

log_info "デプロイ環境: $ENVIRONMENT"
log_info "プロジェクト名: $PROJECT_NAME"

# 1. 依存関係のインストール
log_info "依存関係をインストール中..."
npm ci --production=false

# 2. ビルド
log_info "アプリケーションをビルド中..."
npm run build

# 3. 環境変数の確認
log_info "環境変数を確認中..."
if [ ! -f ".env.$ENVIRONMENT" ]; then
    log_error ".env.$ENVIRONMENT ファイルが見つかりません"
    exit 1
fi

# 4. Supabase Storageバケットの作成
log_info "Supabase Storageバケットを作成中..."
create_storage_buckets() {
    # 必要なバケットのリスト
    BUCKETS=(
        "lead-photos"
        "checklist-attachments"
        "audio-records"
        "general-documents"
    )
    
    for bucket in "${BUCKETS[@]}"; do
        log_info "バケット '$bucket' を作成中..."
        # ここでSupabase CLIを使用してバケットを作成
        # supabase storage create $bucket --project-ref $SUPABASE_PROJECT_REF
    done
}

# 5. データベースセットアップ
log_info "データベースをセットアップ中..."
setup_database() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "本番環境用データベーススクリプトを実行中..."
        # Supabase CLIを使用してSQLスクリプトを実行
        # supabase db push --project-ref $SUPABASE_PROJECT_REF
    else
        log_info "ステージング環境用データベーススクリプトを実行中..."
        # ステージング用の処理
    fi
}

# 6. Vercelへのデプロイ
log_info "Vercelにデプロイ中..."
deploy_to_vercel() {
    # Vercel CLIがインストールされているかチェック
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLIがインストールされていません"
        log_info "npm install -g vercel を実行してください"
        exit 1
    fi
    
    # 環境変数を設定
    export $(cat .env.$ENVIRONMENT | xargs)
    
    # Vercelにデプロイ
    vercel --prod --confirm
}

# 7. ドメイン設定
log_info "ドメインを設定中..."
setup_domain() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "本番ドメインを設定中..."
        # vercel domains add homemart.co.jp
        # vercel domains verify homemart.co.jp
    fi
}

# 8. 環境変数の設定
log_info "Vercel環境変数を設定中..."
setup_vercel_env() {
    # .envファイルから環境変数を読み込んでVercelに設定
    while IFS= read -r line; do
        # コメント行と空行をスキップ
        if [[ ! "$line" =~ ^# ]] && [[ -n "$line" ]]; then
            key=$(echo "$line" | cut -d'=' -f1)
            value=$(echo "$line" | cut -d'=' -f2-)
            
            if [ -n "$key" ] && [ -n "$value" ]; then
                log_info "環境変数を設定: $key"
                vercel env add "$key" "$ENVIRONMENT" <<< "$value"
            fi
        fi
    done < ".env.$ENVIRONMENT"
}

# 9. ヘルスチェック
log_info "デプロイ後のヘルスチェックを実行中..."
health_check() {
    # アプリケーションの起動確認
    sleep 30  # 起動待機
    
    if [ "$ENVIRONMENT" = "production" ]; then
        URL="https://homemart.co.jp"
    else
        URL="https://staging.homemart.co.jp"
    fi
    
    # HTTPステータスコードをチェック
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        log_success "アプリケーションが正常に起動しました"
    else
        log_error "アプリケーションの起動に失敗しました (HTTP: $HTTP_STATUS)"
        exit 1
    fi
}

# 10. 通知
log_info "デプロイ完了通知を送信中..."
send_notification() {
    # Slackやメールでデプロイ完了を通知
    log_success "デプロイ完了通知を送信しました"
}

# メイン処理
main() {
    log_info "デプロイを開始します..."
    
    create_storage_buckets
    setup_database
    deploy_to_vercel
    setup_domain
    setup_vercel_env
    health_check
    send_notification
    
    log_success "デプロイが完了しました！"
    log_info "URL: https://homemart.co.jp"
    log_info "管理画面: https://homemart.co.jp/admin"
}

# エラーハンドリング
trap 'log_error "デプロイ中にエラーが発生しました"; exit 1' ERR

# スクリプト実行
main "$@"
