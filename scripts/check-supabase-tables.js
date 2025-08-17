const { createClient } = require('@supabase/supabase-js')

// 環境変数から設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://avydevqmfgbdpbexcxec.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2eWRldnFtZmdiZHBiZXhjeGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzcwODMsImV4cCI6MjA3MDQxMzA4M30.XlNY0lMEL-9YepN2WZnkRRuwQ8KBpV7aTaOF_eXVYhQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  try {
    console.log('Supabaseテーブル状況を確認中...')
    
    // 全テーブル一覧を取得
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.error('テーブル一覧取得エラー:', tablesError)
      return
    }
    
    console.log('\n=== 現在のテーブル一覧 ===')
    tables.forEach(table => {
      console.log(`- ${table.table_name}`)
    })
    
    // 必要なテーブルの存在確認
    const requiredTables = [
      'customer_leads',
      'listing_agreements', 
      'customer_checklists'
    ]
    
    console.log('\n=== 必要なテーブルの状況 ===')
    requiredTables.forEach(tableName => {
      const exists = tables.some(t => t.table_name === tableName)
      console.log(`${tableName}: ${exists ? '✅ 存在' : '❌ 不存在'}`)
    })
    
    // 存在しないテーブルがあれば作成
    const missingTables = requiredTables.filter(tableName => 
      !tables.some(t => t.table_name === tableName)
    )
    
    if (missingTables.length > 0) {
      console.log(`\n❌ 以下のテーブルが不足しています: ${missingTables.join(', ')}`)
      console.log('database-leads.sql を実行してテーブルを作成してください')
    } else {
      console.log('\n✅ 必要なテーブルは全て存在しています')
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error)
  }
}

checkTables()
