# 🚀 **Cursor AIへの完璧な指示書**

乾代表、これでCursorに指示すれば**一発でデータベース設定が完了**します！

---

## **📋 Cursor AIへコピペする指示文**

```
以下の手順でデータベース設定を完了させてください：

## 1. Supabase設定スクリプトの作成
`scripts/setup-supabase.js`というファイルを作成し、以下の内容を記述：

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabaseの設定情報
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY';

async function setupDatabase() {
  console.log('🚀 Supabaseデータベースのセットアップを開始します...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  // SQLファイルを読み込む
  const sqlPath = path.join(__dirname, '..', 'database-permission-system-updated.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  
  // SQLを実行
  const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
  
  if (error) {
    console.error('❌ エラーが発生しました:', error);
    return;
  }
  
  console.log('✅ データベーススキーマの作成が完了しました');
  
  // テストユーザーの作成
  const testUsers = [
    { email: 'inui@homemart.co.jp', password: 'HomeM@rt2024', name: '乾 佑企', role: 'owner' },
    { email: 'yasuda@homemart.co.jp', password: 'HomeM@rt2024', name: '安田 実加', role: 'manager' },
    { email: 'toyota@homemart.co.jp', password: 'HomeM@rt2024', name: '豊田 拓真', role: 'staff' },
    { email: 'imazu@homemart.co.jp', password: 'HomeM@rt2024', name: '今津 元幸', role: 'staff' },
  ];
  
  for (const user of testUsers) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        role: user.role
      }
    });
    
    if (authError) {
      console.error(`❌ ${user.email}の作成に失敗:`, authError);
    } else {
      console.log(`✅ ${user.email}を作成しました`);
    }
  }
  
  console.log('🎉 セットアップが完了しました！');
}

setupDatabase();
```

## 2. 環境変数ファイルの作成
`.env.local`ファイルを作成し、以下を記述（値は後で更新）：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT設定
JWT_SECRET=homemart-jwt-secret-key-2024-change-this-in-production

# 環境設定
NODE_ENV=development
```

## 3. データベース設定完了手順書の作成
`DATABASE-SETUP.md`というファイルを作成し、以下の内容を記述：

```markdown
# データベース設定手順書

## 必要な作業

### 1. Supabaseプロジェクトの作成
1. https://supabase.com にアクセス
2. 「Start your project」をクリック
3. GitHubでサインイン
4. 新しいプロジェクトを作成：
   - Project name: `homemart-admin`
   - Database Password: 強力なパスワードを生成
   - Region: Northeast Asia (Tokyo)
5. プロジェクトが作成されたら、Settings > API から以下をコピー：
   - Project URL
   - anon public key
   - service_role key

### 2. 環境変数の設定
`.env.local`ファイルを開き、コピーした値を設定：
- NEXT_PUBLIC_SUPABASE_URL = Project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY = anon public key
- SUPABASE_SERVICE_KEY = service_role key

### 3. データベーススキーマの実行
1. Supabaseダッシュボードで「SQL Editor」を開く
2. `database-permission-system-updated.sql`の内容を全てコピー
3. SQL Editorに貼り付けて「Run」をクリック

### 4. Vercelへのデプロイ設定
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add JWT_SECRET
```

### 5. 動作確認
1. `npm run dev`でローカルサーバーを起動
2. http://localhost:3000/admin/login にアクセス
3. テストユーザーでログイン：
   - Email: inui@homemart.co.jp
   - Password: HomeM@rt2024

## トラブルシューティング

### エラー: "relation does not exist"
→ SQLスキーマが正しく実行されていません。SQL Editorで再実行してください。

### エラー: "Invalid API key"
→ 環境変数が正しく設定されていません。`.env.local`を確認してください。

### エラー: "User not found"
→ テストユーザーが作成されていません。`node scripts/setup-supabase.js`を実行してください。
```

## 4. package.jsonにスクリプトを追加
package.jsonのscriptsセクションに以下を追加：

```json
"scripts": {
  "setup:db": "node scripts/setup-supabase.js",
  "setup:env": "cp .env.example .env.local",
  "setup:all": "npm run setup:env && npm run setup:db"
}
```

## 5. .env.exampleファイルの作成
`.env.example`というファイルを作成し、以下を記述：

```env
# Supabase設定（https://supabase.comでプロジェクト作成後に取得）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# JWT設定（本番環境では必ず変更してください）
JWT_SECRET=your-secure-jwt-secret-here

# 環境設定
NODE_ENV=development
```

## 6. 必要なパッケージのインストール
以下のコマンドを実行：
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## 7. GitHubへのコミット
全ての変更をコミット：
```bash
git add .
git commit -m "feat: 完全なデータベース設定システムの実装 - 自動セットアップスクリプト追加"
git push origin main
```

これで完了です！
```

---

## **💡 Cursorでの実行手順**

1. **上記の指示文を全てコピー**
2. **Cursorのチャット欄に貼り付け**
3. **「Apply」または「実行」をクリック**
4. **自動的に全ファイルが作成される**

## **✅ 作成されるファイル一覧**

- `scripts/setup-supabase.js` - 自動設定スクリプト
- `.env.local` - 環境変数ファイル
- `.env.example` - 環境変数テンプレート
- `DATABASE-SETUP.md` - 設定手順書
- `package.json` - 更新されたスクリプト

## **🎯 次のステップ**

Cursorで上記を実行した後：

1. **Supabaseにアクセス**: https://supabase.com
2. **新規プロジェクト作成**: `homemart-admin`
3. **環境変数をコピー**: Project URL, API Keys
4. **`.env.local`を更新**: 取得した値を設定
5. **データベース構築**: SQL Editorでスキーマ実行

## **🚀 完了後の動作確認**

1. **アプリケーション起動**: `npm run dev`
2. **ログインページアクセス**: http://localhost:3000/admin/login
3. **テストユーザーでログイン**:
   - Email: `inui@homemart.co.jp`
   - Password: `HomeM@rt2024`
4. **権限に応じたメニュー表示確認**

**これで完璧なデータベース設定が完了します！** 🎉

---

**何か質問があれば、すぐにお答えします！** 💪
