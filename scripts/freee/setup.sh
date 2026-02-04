#!/bin/bash
# freee CSV ダウンロードスクリプトのセットアップ

set -e

echo "freee CSV ダウンロードスクリプトのセットアップを開始します..."

# Python3がインストールされているか確認
if ! command -v python3 &> /dev/null; then
    echo "エラー: Python3がインストールされていません"
    echo "Homebrewでインストールするには: brew install python3"
    exit 1
fi

echo "Python3が見つかりました: $(python3 --version)"

# 仮想環境を作成
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VENV_DIR="$SCRIPT_DIR/venv"

if [ -d "$VENV_DIR" ]; then
    echo "既存の仮想環境を削除します..."
    rm -rf "$VENV_DIR"
fi

echo "Python仮想環境を作成中..."
python3 -m venv "$VENV_DIR"

echo "仮想環境を有効化中..."
source "$VENV_DIR/bin/activate"

echo "依存関係をインストール中..."
pip install --upgrade pip
pip install -r "$SCRIPT_DIR/requirements.txt"

echo "Playwrightブラウザをインストール中..."
playwright install chromium

echo ""
echo "✓ セットアップ完了!"
echo ""
echo "次のステップ:"
echo "1. .env.local に以下の環境変数を設定してください:"
echo "   FREEE_EMAIL=your_freee_email@example.com"
echo "   FREEE_PASSWORD=your_freee_password"
echo "   FREEE_COMPANY_ID=12416633"
echo ""
echo "2. スクリプトをテスト実行:"
echo "   cd $SCRIPT_DIR"
echo "   source venv/bin/activate"
echo "   python download_csv.py"
echo ""
