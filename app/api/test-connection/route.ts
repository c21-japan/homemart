import { NextResponse } from 'next/server'
import { testSupabaseConnection } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('接続テスト開始...')
    
    const isConnected = await testSupabaseConnection()
    
    if (isConnected) {
      return NextResponse.json({ 
        success: true, 
        message: 'Supabase接続成功',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Supabase接続失敗',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
  } catch (error) {
    console.error('接続テスト中にエラーが発生:', error)
    return NextResponse.json({ 
      success: false, 
      message: '接続テスト中にエラーが発生しました',
      error: error instanceof Error ? error.message : '不明なエラー',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
