#!/usr/bin/env node

/**
 * ホームマート権限管理システム - Supabase自動設定スクリプト
 * 
 * 使用方法:
 * 1. Supabase CLIをインストール: npm install -g supabase
 * 2. このスクリプトを実行: node scripts/setup-supabase.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ホームマート権限管理システム - Supabase自動設定開始');
console.log('==================================================');

// 設定ファイルの確認
const sqlFile = path.join(__dirname, '../database-permission-system-updated.sql');
if (!fs.existsSync(sqlFile)) {
  console.error('❌ SQLファイルが見つかりません:', sqlFile);
  process.exit(1);
}

console.log('✅ SQLファイル確認完了:', sqlFile);

// Supabase CLIの確認
try {
  execSync('supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI確認完了');
} catch (error) {
  console.error('❌ Supabase CLIがインストールされていません');
  console.log('📦 インストール方法: npm install -g supabase');
  process.exit(1);
}

// 環境変数ファイルの作成
const envContent = `# ホームマート権限管理システム - 環境変数
# このファイルは自動生成されます。必要に応じて編集してください。

# Supabase設定（実際の値に置き換えてください）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT秘密鍵（本番環境では必ず変更してください）
JWT_SECRET=homemart-jwt-secret-key-2024-change-this-in-production

# 環境設定
NODE_ENV=development

# ========================================
# 設定手順
# ========================================
# 1. Supabaseプロジェクトを作成
# 2. プロジェクトURLとanon keyを取得
# 3. 上記の値を実際の値に置き換え
# 4. データベーススキーマを実行
`;

const envFile = path.join(__dirname, '../.env.local');
fs.writeFileSync(envFile, envContent);
console.log('✅ 環境変数ファイル作成完了:', envFile);

// 設定手順の表示
console.log('\n📋 次の手順を実行してください:');
console.log('==================================================');
console.log('1. Supabaseプロジェクトの作成');
console.log('   - https://supabase.com にアクセス');
console.log('   - 新しいプロジェクト「homemart-admin」を作成');
console.log('   - リージョン: Asia Pacific (Tokyo) を推奨');
console.log('');
console.log('2. プロジェクト情報の取得');
console.log('   - プロジェクトURL: https://xxxxx.supabase.co');
console.log('   - anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('');
console.log('3. 環境変数の設定');
console.log('   - .env.local ファイルを編集');
console.log('   - 実際の値を設定');
console.log('');
console.log('4. データベーススキーマの実行');
console.log('   - SupabaseダッシュボードのSQL Editorにアクセス');
console.log('   - database-permission-system-updated.sql を実行');
console.log('');
console.log('5. 動作確認');
console.log('   - アプリケーションを起動');
console.log('   - /admin/login にアクセス');
console.log('   - テストユーザーでログイン');

console.log('\n🎯 設定完了後、以下のユーザーでログインできます:');
console.log('==================================================');
console.log('オーナー: inui@homemart.co.jp / HomeM@rt2024');
console.log('マネージャー: yasuda@homemart.co.jp / HomeM@rt2024');
console.log('スタッフ: toyota@homemart.co.jp / HomeM@rt2024');
console.log('パートタイム: kadotani@homemart.co.jp / HomeM@rt2024');

console.log('\n🚀 設定を開始してください！');
console.log('==================================================');
