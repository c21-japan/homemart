# Google Workspace API設定手順

## 1. Google Cloud Consoleでの設定

### 1.1 プロジェクトの作成
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択

### 1.2 APIの有効化
以下のAPIを有効化してください：
- Google Drive API
- Gmail API
- Google Calendar API
- Google Sheets API

### 1.3 OAuth 2.0認証情報の作成
1. 「認証情報」→「認証情報を作成」→「OAuth 2.0 クライアントID」
2. アプリケーションの種類：「ウェブアプリケーション」を選択
3. 承認済みのリダイレクトURIに以下を追加：
   - 開発環境: `http://localhost:3000/google-auth/callback`
   - 本番環境: `https://yourdomain.com/google-auth/callback`

### 1.4 認証情報の取得
- クライアントID
- クライアントシークレット

## 2. 環境変数の設定

`.env.local`ファイルに以下を追加してください：

```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/google-auth/callback
```

## 3. スコープの設定

以下のスコープが自動的に設定されます：
- `https://www.googleapis.com/auth/drive.readonly` - Googleドライブ読み取り
- `https://www.googleapis.com/auth/gmail.readonly` - Gmail読み取り
- `https://www.googleapis.com/auth/calendar.readonly` - Googleカレンダー読み取り
- `https://www.googleapis.com/auth/spreadsheets.readonly` - スプレッドシート読み取り

## 4. セキュリティの考慮事項

- クライアントシークレットは絶対に公開しないでください
- 本番環境では適切なセキュリティヘッダーを設定してください
- アクセストークンは適切に管理し、期限切れの場合は自動更新されます

## 5. トラブルシューティング

### よくある問題
1. **CORSエラー**: 承認済みのリダイレクトURIが正しく設定されているか確認
2. **スコープエラー**: 必要なAPIが有効化されているか確認
3. **認証エラー**: クライアントIDとシークレットが正しいか確認

### デバッグ方法
- ブラウザの開発者ツールでコンソールエラーを確認
- ネットワークタブでAPIリクエストの詳細を確認
- Google Cloud Consoleのログでエラーを確認
