# freee CSV ダウンロードスクリプト

freeeから試算表、仕訳帳、総勘定元帳のCSVファイルを自動でダウンロードするPythonスクリプトです。

## 前提条件

- Python 3.8以上
- freeeアカウントとログイン情報
- 書面でクローリングの承諾を得ていること

## セットアップ

### 1. 依存関係のインストール

```bash
cd scripts/freee
./setup.sh
```

または手動で：

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

### 2. 環境変数の設定

プロジェクトルートの `.env.local` に以下を追加：

```env
# freee CSV クローリング用
FREEE_EMAIL=your_freee_email@example.com
FREEE_PASSWORD=your_freee_password
FREEE_COMPANY_ID=12416633
PYTHON_PATH=python3
```

## 使い方

### コマンドラインから直接実行

```bash
cd scripts/freee
source venv/bin/activate
python download_csv.py
```

### Web UIから実行

1. https://homemart-one.vercel.app/admin/accounting にアクセス
2. 「CSV取得」ボタンをクリック
3. ダウンロードしたCSVデータが自動的に解析されます

## ダウンロードされるデータ

- **試算表（Trial Balance）**: 貸借対照表・損益計算書
- **仕訳帳（Journal）**: 全取引の詳細記録
- **総勘定元帳（General Ledger）**: 勘定科目ごとの取引履歴

## 出力先

- **CSV**: `tmp/freee_csv/`
- **JSON**: `tmp/freee_data/freee_data.json`

## トラブルシューティング

### Playwrightのインストールエラー

```bash
playwright install-deps
playwright install chromium
```

### タイムアウトエラー

スクリプト内の `timeout` 値を増やしてください（デフォルト: 30秒）

### ログインエラー

1. FREEE_EMAIL と FREEE_PASSWORD が正しいか確認
2. freeeのログイン画面に2段階認証が設定されていないか確認
3. 事業所IDが正しいか確認

## API エンドポイント

### POST /api/freee/csv/refresh

CSVダウンロードスクリプトを実行し、最新のデータを取得します。

**権限**: OWNER + REPORTS:EXPORT

**レスポンス**:
```json
{
  "success": true,
  "message": "CSVデータを取得しました",
  "updated_at": "2026-02-04T12:00:00Z",
  "period": {
    "start_date": "2025-05-01",
    "end_date": "2026-02-04"
  },
  "data": {
    "trial_balance": [...],
    "journal": [...],
    "general_ledger": [...]
  }
}
```

## 注意事項

- このスクリプトはfreeeの利用規約に従って使用してください
- 書面での承諾を得た範囲内でのみ使用してください
- 頻繁な実行はサーバーに負荷をかける可能性があります
- 本番環境では適切なレート制限を設定してください

## ライセンス

このスクリプトは株式会社ホームマートの内部利用のために作成されました。
