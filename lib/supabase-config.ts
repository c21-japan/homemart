export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://avydevqmfgbdpbexcxec.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2eWRldnFtZmdiZHBiZXhjeGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzcwODMsImV4cCI6MjA3MDQxMzA4M30.XlNY0lMEL-9YepN2WZnkRRuwQ8KBpV7aTaOF_eXVYhQ'
}

// 環境変数の検証
export const validateSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.warn('Supabase環境変数が設定されていません。デフォルト値を使用します。')
    console.warn('NEXT_PUBLIC_SUPABASE_URL:', url ? '設定済み' : '未設定')
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY:', anonKey ? '設定済み' : '未設定')
  }
  
  return {
    url: url || supabaseConfig.url,
    anonKey: anonKey || supabaseConfig.anonKey
  }
}

export const jwtSecret = process.env.JWT_SECRET || 'homemart-jwt-secret-key-2024-change-this-in-production'
