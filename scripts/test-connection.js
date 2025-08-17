const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.localファイルを直接読み込み
function loadEnvFile() {
  const envPath = path.join(__dirname, '../.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=');
      }
    }
  });
  
  return envVars;
}

async function testConnection() {
  console.log('🔍 環境変数とSupabase接続のテスト開始...');
  
  // 環境変数を直接読み込み
  const envVars = loadEnvFile();
  
  console.log('\n📋 読み込まれた環境変数:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', envVars.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 50) + '...' : '未設定');
  console.log('SUPABASE_SERVICE_KEY:', envVars.SUPABASE_SERVICE_KEY ? envVars.SUPABASE_SERVICE_KEY.substring(0, 50) + '...' : '未設定');
  
  if (!envVars.NEXT_PUBLIC_SUPABASE_URL || !envVars.SUPABASE_SERVICE_KEY) {
    console.error('❌ 必要な環境変数が設定されていません');
    return;
  }
  
  // Supabaseクライアント作成
  const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_KEY);
  
  try {
    console.log('\n🔌 Supabase接続テスト...');
    
    // 既存のテーブル一覧を取得
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(10);
    
    if (error) {
      console.log('❌ テーブル一覧取得エラー:', error.message);
      
      // 別の方法でテスト
      console.log('\n🔄 別の方法で接続テスト...');
      
      // 簡単なクエリでテスト
      const { data, error: simpleError } = await supabase
        .from('customers')
        .select('count')
        .limit(1);
      
      if (simpleError) {
        console.log('❌ 簡単なクエリも失敗:', simpleError.message);
      } else {
        console.log('✅ 基本的な接続は成功');
      }
    } else {
      console.log('✅ 接続成功！');
      console.log('📊 既存テーブル:', tables.map(t => t.table_name).join(', '));
    }
    
  } catch (error) {
    console.error('❌ 接続テストでエラーが発生:', error.message);
  }
}

// スクリプト実行
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };
