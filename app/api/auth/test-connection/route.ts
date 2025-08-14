import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 接続テスト開始')
    
    // 直接APIキーを使用してテスト
    const supabaseUrl = 'https://gxzekttfrwpfmnigmyqb.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4emVrdHRmcndwZm1uaWdteXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDk3NzksImV4cCI6MjA3MDcyNTc3OX0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4emVrdHRmcndwZm1uaWdteXFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0OTc3OSwiZXhwIjoyMDcwNzI1Nzc5fQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4emVrdHRmcndwZm1uaWdteXFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0OTc3OSwiZXhwIjoyMDcwNzI1Nzc5fQ'
    
    console.log('🔗 Supabase接続テスト中...')
    console.log('URL:', supabaseUrl)
    console.log('Anon Key length:', supabaseAnonKey.length)
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // 接続テスト
    const { data, error } = await supabase
      .from('auth_users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ 接続エラー:', error)
      return NextResponse.json({
        success: false,
        error: '接続エラー',
        details: error,
        url: supabaseUrl,
        keyLength: supabaseAnonKey.length
      }, { status: 500 })
    }
    
    console.log('✅ 接続成功:', data)
    return NextResponse.json({
      success: true,
      message: '接続成功',
      data: data
    })
    
  } catch (error) {
    console.error('💥 エラーが発生:', error)
    return NextResponse.json({
      success: false,
      error: 'エラーが発生しました',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
