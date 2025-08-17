const { createClient } = require('@supabase/supabase-js')

// 環境変数から設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://avydevqmfgbdpbexcxec.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2eWRldnFtZmdiZHBiZXhjeGVjIiwic3JvbGUiOiJhbm9uIiwiaWF0IjoxNzU0ODM3MDgzLCJleHAiOjIwNzA0MTMwODN9.XlNY0lMEL-9YepN2WZnkRRuwQ8KBpV7aTaOF_eXVYhQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTablesDirect() {
  try {
    console.log('Supabaseテーブル状況を直接確認中...')
    
    const requiredTables = [
      'customer_leads',
      'listing_agreements', 
      'customer_checklists'
    ]
    
    console.log('\n=== テーブルの存在確認 ===')
    
    for (const tableName of requiredTables) {
      try {
        // 各テーブルに1件だけアクセスしてみる
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error) {
          if (error.message.includes('Could not find the table')) {
            console.log(`${tableName}: ❌ テーブルが存在しません`)
          } else {
            console.log(`${tableName}: ⚠️  テーブルは存在するがエラー: ${error.message}`)
          }
        } else {
          console.log(`${tableName}: ✅ テーブルが存在します (データ件数: ${data?.length || 0})`)
        }
      } catch (err) {
        console.log(`${tableName}: ❌ エラー: ${err.message}`)
      }
    }
    
    console.log('\n=== 推奨アクション ===')
    console.log('1. SupabaseダッシュボードでSQLエディタを開く')
    console.log('2. database-leads.sql の内容を実行')
    console.log('3. または、以下のコマンドでローカルから実行:')
    console.log('   psql "postgresql://[接続文字列]" -f database-leads.sql')
    
  } catch (error) {
    console.error('エラーが発生しました:', error)
  }
}

checkTablesDirect()
