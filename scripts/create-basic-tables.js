const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createBasicTables() {
  console.log('🚀 顧客管理システム v2.0 基本テーブル作成開始...');
  
  // 環境変数の確認
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 環境変数が設定されていません');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
    console.error('SUPABASE_SERVICE_KEY:', supabaseKey ? '設定済み' : '未設定');
    process.exit(1);
  }
  
  console.log('✅ 環境変数確認完了');
  console.log('URL:', supabaseUrl);
  console.log('Service Key:', supabaseKey.substring(0, 20) + '...');
  
  // Supabaseクライアント作成
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 1. 基本的なENUM型の作成
    console.log('\n📊 ENUM型の作成...');
    
    // customer_category ENUM
    try {
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: "CREATE TYPE IF NOT EXISTS customer_category AS ENUM ('seller', 'buyer', 'reform');" 
      });
      if (error) console.log('⚠️  customer_category ENUM作成スキップ');
      else console.log('✅ customer_category ENUM作成完了');
    } catch (e) {
      console.log('⚠️  customer_category ENUM作成スキップ');
    }
    
    // property_type ENUM
    try {
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: "CREATE TYPE IF NOT EXISTS property_type AS ENUM ('mansion', 'land', 'house');" 
      });
      if (error) console.log('⚠️  property_type ENUM作成スキップ');
      else console.log('✅ property_type ENUM作成完了');
    } catch (e) {
      console.log('⚠️  property_type ENUM作成スキップ');
    }
    
    // source_type ENUM
    try {
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: "CREATE TYPE IF NOT EXISTS source_type AS ENUM ('flyer', 'lp', 'suumo', 'homes', 'referral', 'walk_in', 'repeat', 'other');" 
      });
      if (error) console.log('⚠️  source_type ENUM作成スキップ');
      else console.log('✅ source_type ENUM作成完了');
    } catch (e) {
      console.log('⚠️  source_type ENUM作成スキップ');
    }
    
    // 2. 基本的なテーブルの作成
    console.log('\n📋 基本テーブルの作成...');
    
    // customers テーブル
    const createCustomersTable = `
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category customer_category NOT NULL,
        name TEXT NOT NULL,
        name_kana TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        source source_type DEFAULT 'other',
        assignee_user_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: createCustomersTable });
      if (error) {
        console.log('⚠️  customersテーブル作成スキップ（既存の可能性）');
      } else {
        console.log('✅ customersテーブル作成完了');
      }
    } catch (e) {
      console.log('⚠️  customersテーブル作成スキップ');
    }
    
    // properties テーブル
    const createPropertiesTable = `
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        property_type property_type NOT NULL,
        address TEXT NOT NULL,
        mansion_name TEXT,
        room_number TEXT,
        land_number TEXT,
        building_area DECIMAL(10,2),
        floor_plan TEXT,
        built_year INTEGER,
        area DECIMAL(10,2),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: createPropertiesTable });
      if (error) {
        console.log('⚠️  propertiesテーブル作成スキップ（既存の可能性）');
      } else {
        console.log('✅ propertiesテーブル作成完了');
      }
    } catch (e) {
      console.log('⚠️  propertiesテーブル作成スキップ');
    }
    
    // 3. インデックスの作成
    console.log('\n🔍 インデックスの作成...');
    
    const createIndexes = [
      "CREATE INDEX IF NOT EXISTS idx_customers_category ON customers(category);",
      "CREATE INDEX IF NOT EXISTS idx_customers_assignee ON customers(assignee_user_id);",
      "CREATE INDEX IF NOT EXISTS idx_properties_customer ON properties(customer_id);"
    ];
    
    for (const indexSql of createIndexes) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: indexSql });
        if (error) console.log('⚠️  インデックス作成スキップ');
        else console.log('✅ インデックス作成完了');
      } catch (e) {
        console.log('⚠️  インデックス作成スキップ');
      }
    }
    
    // 4. テストデータの挿入
    console.log('\n🧪 テストデータの挿入...');
    
    // 既存の顧客データを確認
    const { data: existingCustomers, error: selectError } = await supabase
      .from('customers')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('⚠️  既存データ確認エラー:', selectError.message);
    } else if (existingCustomers && existingCustomers.length > 0) {
      console.log('✅ 既存の顧客データが確認されました');
    } else {
      console.log('📝 テストデータを挿入します...');
      
      // テスト顧客データ
      const testCustomers = [
        {
          category: 'seller',
          name: '田中太郎',
          name_kana: 'タナカタロウ',
          phone: '090-1234-5678',
          email: 'tanaka@example.com',
          source: 'flyer'
        },
        {
          category: 'buyer',
          name: '佐藤花子',
          name_kana: 'サトウハナコ',
          phone: '080-8765-4321',
          email: 'sato@example.com',
          source: 'suumo'
        },
        {
          category: 'reform',
          name: '鈴木一郎',
          name_kana: 'スズキイチロウ',
          phone: '070-5555-6666',
          email: 'suzuki@example.com',
          source: 'referral'
        }
      ];
      
      for (const customer of testCustomers) {
        try {
          const { data, error } = await supabase
            .from('customers')
            .insert(customer)
            .select();
          
          if (error) {
            console.log(`⚠️  ${customer.name}の挿入エラー:`, error.message);
          } else {
            console.log(`✅ ${customer.name}の挿入完了`);
          }
        } catch (e) {
          console.log(`⚠️  ${customer.name}の挿入スキップ`);
        }
      }
    }
    
    console.log('\n🎉 基本テーブル作成完了！');
    console.log('次のステップ: 詳細テーブルの作成');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:');
    console.error(error);
  }
}

// スクリプト実行
if (require.main === module) {
  createBasicTables();
}

module.exports = { createBasicTables };
