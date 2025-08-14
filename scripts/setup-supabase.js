#!/usr/bin/env node

/**
 * ホームマート権限管理システム - Cursor AI用自動設定スクリプト
 * 
 * 使用方法:
 * 1. Supabaseプロジェクトを作成
 * 2. 環境変数を設定
 * 3. このスクリプトを実行: node scripts/setup-supabase.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabaseの設定情報
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY';

async function setupDatabase() {
  console.log('🚀 ホームマート権限管理システム - Supabaseデータベースのセットアップを開始します...');
  
  // 環境変数のチェック
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_ANON_KEY') {
    console.error('❌ 環境変数が設定されていません！');
    console.log('📋 以下の手順で環境変数を設定してください：');
    console.log('1. .env.local ファイルを編集');
    console.log('2. SupabaseプロジェクトのURLとAPI Keysを設定');
    console.log('3. 再度このスクリプトを実行');
    return;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // SQLファイルを読み込む
    const sqlPath = path.join(__dirname, '..', 'database-permission-system.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 以下の手順でデータベーススキーマを実行してください：');
    console.log('--- SQL内容（ここからコピー） ---');
    console.log(sqlContent);
    console.log('--- SQL内容（ここまでコピー） ---');
    console.log('');
    console.log('🔧 実行手順：');
    console.log('1. Supabaseダッシュボードにアクセス');
    console.log('2. 左サイドバーの「SQL Editor」をクリック');
    console.log('3. 「New query」をクリック');
    console.log('4. 上記のSQL内容をコピー&ペースト');
    console.log('5. 「Run」をクリック');
    console.log('');
    
    // テストユーザーの作成
    console.log('👥 テストユーザーの作成を試行します...');
    
    try {
      const testUsers = [
        { email: 'inui@homemart.co.jp', password: 'HomeM@rt2024', name: '乾 佑企', role: 'owner' },
        { email: 'yasuda@homemart.co.jp', password: 'HomeM@rt2024', name: '安田 実加', role: 'manager' },
        { email: 'toyota@homemart.co.jp', password: 'HomeM@rt2024', name: '豊田 拓真', role: 'staff' },
        { email: 'imazu@homemart.co.jp', password: 'HomeM@rt2024', name: '今津 元幸', role: 'staff' },
      ];
      
      for (const user of testUsers) {
        try {
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
            console.error(`❌ ${user.email}の作成に失敗:`, authError.message);
          } else {
            console.log(`✅ ${user.email}を作成しました`);
          }
        } catch (error) {
          console.error(`❌ ${user.email}の作成中にエラー:`, error.message);
        }
      }
    } catch (error) {
      console.log('⚠️ テストユーザーの作成は手動で行ってください');
      console.log('📋 ユーザー作成手順：');
      console.log('1. Supabaseダッシュボードの「Authentication」→「Users」');
      console.log('2. 「Add user」をクリック');
      console.log('3. 各ユーザーの情報を入力');
    }
    
    console.log('');
    console.log('🎉 セットアップが完了しました！');
    console.log('📋 次のステップ：');
    console.log('1. データベーススキーマの実行確認');
    console.log('2. テストユーザーでのログイン確認');
    console.log('3. 管理画面の動作確認');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    console.log('📋 トラブルシューティング：');
    console.log('1. 環境変数の設定を確認');
    console.log('2. Supabaseプロジェクトの状態を確認');
    console.log('3. ネットワーク接続を確認');
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
