#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

case "$1" in
  "d"|"deploy")
    echo -e "${GREEN}🚀 ホームマート デプロイ開始${NC}"
    git add .
    git commit -m "${2:-自動更新 $(date '+%Y-%m-%d %H:%M')}"
    git push
    echo -e "${GREEN}✅ 完了！${NC}"
    echo -e "${YELLOW}🌐 https://homemart.vercel.app${NC}"
    ;;
    
  "s"|"save")
    echo -e "${YELLOW}💾 変更を保存中...${NC}"
    git add .
    git commit -m "${2:-作業内容を保存}"
    echo -e "${GREEN}✅ ローカル保存完了！${NC}"
    ;;
    
  "c"|"check")
    echo -e "${YELLOW}📋 変更状況：${NC}"
    git status -s
    ;;
    
  "dev")
    echo -e "${GREEN}🔧 開発サーバー起動${NC}"
    echo -e "${YELLOW}http://localhost:3000 で確認できます${NC}"
    npm run dev
    ;;
    
  "build")
    echo -e "${YELLOW}🔨 ビルド中...${NC}"
    npm run build
    ;;
    
  *)
    echo -e "${GREEN}🏠 ホームマート 簡単コマンド${NC}"
    echo "================================"
    echo -e "${YELLOW}使い方:${NC} ./h [コマンド] [メッセージ]"
    echo ""
    echo "  d, deploy  - アップロード＆公開"
    echo "  s, save    - 保存のみ"
    echo "  c, check   - 状態確認"
    echo "  dev        - 開発サーバー"
    echo "  build      - ビルド"
    echo ""
    echo -e "${GREEN}例：${NC}"
    echo "  ./h d 'LINE機能追加'"
    echo "  ./h dev"
    ;;
esac
