#!/usr/bin/env node

/**
 * ホームマート権限管理システム - Cursor AI用自動設定スクリプト
 * 
 * 使用方法:
 * 1. Supabaseプロジェクトを作成
 * 2. 環境変数を設定
 * 3. このスクリプトを実行: node scripts/setup-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabaseの設定情報
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY';

async function setupDatabase() {
  console.log('🚀 ホームマート権限管理システム - Supabaseデータベースのセットアップを開始します...');
  console.log('==================================================');
  
  // 環境変数の確認
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_ANON_KEY') {
    console.error('❌ 環境変数が設定されていません！');
    console.log('📋 以下の手順で環境変数を設定してください：');
    console.log('1. .env.local ファイルを編集');
    console.log('2. Supabaseのプロジェクト情報を設定');
    console.log('3. 再度このスクリプトを実行');
    return;
  }
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    console.log('✅ Supabaseクライアントの作成が完了しました');
    
    // SQLファイルを読み込む
    const sqlPath = path.join(__dirname, '..', 'database-permission-system-updated.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ SQLファイルが見つかりません:', sqlPath);
      return;
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ SQLファイルの読み込みが完了しました');
    
    // SQLを実行（SupabaseのSQL Editorで実行する必要があります）
    console.log('📋 以下の手順でデータベーススキーマを実行してください：');
    console.log('1. Supabaseダッシュボードにアクセス');
    console.log('2. 左サイドバーの「SQL Editor」をクリック');
    console.log('3. 以下のSQLをコピーして貼り付け');
    console.log('4. 「Run」ボタンをクリック');
    console.log('');
    console.log('--- SQL内容（ここからコピー） ---');
    console.log(sqlContent);
    console.log('--- SQL内容（ここまでコピー） ---');
    
    // テストユーザーの作成
    console.log('');
    console.log('👥 テストユーザーの作成を開始します...');
    
    const testUsers = [
      { email: 'inui@homemart.co.jp', password: 'HomeM@rt2024', name: '乾 佑企', role: 'owner' },
      { email: 'yasuda@homemart.co.jp', password: 'HomeM@rt2024', name: '安田 実加', role: 'manager' },
      { email: 'toyota@homemart.co.jp', password: 'HomeM@rt2024', name: '豊田 拓真', role: 'staff' },
      { email: 'imazu@homemart.co.jp', password: 'HomeM@rt2024', name: '今津 元幸', role: 'staff' },
      { email: 'yamao@homemart.co.jp', password: 'HomeM@rt2024', name: '山尾 美咲', role: 'staff' },
      { email: 'kadotani@homemart.co.jp', password: 'HomeM@rt2024', name: 'かどたに 翔太', role: 'part_time' },
      { email: 'toyama@homemart.co.jp', password: 'HomeM@rt2024', name: 'とやま 花子', role: 'part_time' }
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
          console.log(`✅ ${user.email} (${user.name}) を作成しました - ロール: ${user.role}`);
        }
      } catch (error) {
        console.error(`❌ ${user.email}の作成中にエラー:`, error.message);
      }
    }
    
    console.log('');
    console.log('🎉 セットアップが完了しました！');
    console.log('==================================================');
    console.log('📋 次の手順で動作確認を行ってください：');
    console.log('');
    console.log('1. アプリケーションを起動: npm run dev');
    console.log('2. ログインページにアクセス: http://localhost:3000/admin/login');
    console.log('3. テストユーザーでログイン:');
    console.log('   - Email: inui@homemart.co.jp');
    console.log('   - Password: HomeM@rt2024');
    console.log('');
    console.log('4. 権限に応じたメニューが表示されることを確認');
    console.log('');
    console.log('🚀 ホームマート権限管理システムの準備が完了しました！');
    
  } catch (error) {
    console.error('❌ セットアップ中にエラーが発生しました:', error.message);
    console.log('');
    console.log('🔧 トラブルシューティング:');
    console.log('1. 環境変数が正しく設定されているか確認');
    console.log('2. Supabaseプロジェクトが有効か確認');
    console.log('3. ネットワーク接続を確認');
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
