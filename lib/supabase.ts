import { createClient } from '@supabase/supabase-js'
import { supabaseConfig, validateSupabaseConfig } from './supabase-config'

// 環境変数を検証
const config = validateSupabaseConfig()

// Supabaseクライアントを作成
export const supabase = createClient(config.url, config.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
})

// 接続テスト用の関数
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase接続エラー:', error)
      return false
    }
    
    console.log('Supabase接続成功')
    return true
  } catch (err) {
    console.error('Supabase接続テスト中にエラーが発生:', err)
    return false
  }
}
