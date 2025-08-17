# Google Maps API セットアップガイド

## 概要

Google Maps APIを使用することで、最高精度の住所情報を取得できます。このAPIは有料ですが、非常に高精度で信頼性が高いです。

## セットアップ手順

### 1. Google Cloud Console にアクセス

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. Googleアカウントでログイン
3. プロジェクトを作成または選択

### 2. Geocoding API を有効化

1. 左側のメニューから「APIとサービス」→「ライブラリ」を選択
2. 検索バーで「Geocoding API」を検索
3. 「Geocoding API」をクリック
4. 「有効にする」ボタンをクリック

### 3. API キーを作成

1. 左側のメニューから「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「APIキー」をクリック
3. 作成されたAPIキーをコピー

### 4. API キーの制限を設定（推奨）

1. 作成されたAPIキーをクリック
2. 「アプリケーションの制限」で「HTTPリファラー」を選択
3. 許可するドメインを追加：
   - `localhost:3000` (開発環境)
   - `localhost:3001` (開発環境)
   - `homemart.century21.group` (本番環境)
   - `*.vercel.app` (Vercel環境)

### 5. 環境変数の設定

#### ローカル開発環境 (.env.local)
```bash
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

#### Vercel本番環境
1. Vercelダッシュボードにアクセス
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」を選択
4. 以下の環境変数を追加：
   - `GOOGLE_MAPS_API_KEY`: 作成したAPIキー

## 料金体系

### 無料枠
- 月間 200,000 リクエストまで無料

### 有料枠
- 200,000 リクエストを超える場合：
  - $5 USD per 1,000 additional requests

### 料金計算例
- 月間 250,000 リクエストの場合：
  - 無料枠: 200,000 リクエスト
  - 有料分: 50,000 リクエスト
  - 料金: $5 × (50,000 ÷ 1,000) = $250 USD

## セキュリティのベストプラクティス

1. **APIキーの制限**
   - HTTPリファラー制限を設定
   - 必要最小限のAPIのみ有効化

2. **環境変数の管理**
   - APIキーをソースコードに直接記述しない
   - 環境変数として管理

3. **使用量の監視**
   - Google Cloud Consoleで使用量を定期的に確認
   - 予期しない使用量の増加がないか監視

## トラブルシューティング

### よくある問題

1. **APIキーが無効**
   - 環境変数が正しく設定されているか確認
   - APIキーが正しくコピーされているか確認

2. **使用量制限に達した**
   - Google Cloud Consoleで使用量を確認
   - 必要に応じて課金を有効化

3. **ドメイン制限エラー**
   - HTTPリファラー制限の設定を確認
   - 使用するドメインが許可リストに含まれているか確認

## フォールバック機能

Google Maps APIが利用できない場合、以下のAPIが順次試行されます：

1. **Google Maps API** (最高精度、有料)
2. **Nominatim API** (OpenStreetMap、無料)
3. **国土地理院 API** (基本情報、無料)

これにより、Google Maps APIが設定されていない環境でも、無料のAPIで住所情報を取得できます。

## サポート

問題が発生した場合は、以下を確認してください：

1. Google Cloud Consoleのエラーログ
2. アプリケーションのコンソールログ
3. 環境変数の設定状況
4. APIキーの制限設定
