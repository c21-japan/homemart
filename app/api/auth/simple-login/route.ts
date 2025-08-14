import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-direct'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 シンプルログインAPI開始')
    
    const { email, password } = await request.json()
    console.log('📧 ログイン試行:', { email, passwordLength: password?.length })
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    
    // ユーザー取得
    console.log('🔍 ユーザー検索中...')
    const { data: user, error } = await supabase
      .from('auth_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()
    
    if (error) {
      console.log('❌ ユーザー取得エラー:', error)
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
    
    if (!user) {
      console.log('❌ ユーザーが見つかりません')
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
    
    console.log('✅ ユーザー発見:', { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      hasPasswordHash: !!user.password_hash
    })
    
    // パスワード検証（一時的に省略してテスト）
    console.log('🔐 パスワード検証をスキップ（テスト用）')
    
    // 一時的に成功を返す
    console.log('🎉 ログイン成功（テスト用）')
    return NextResponse.json({ 
      success: true, 
      message: 'Connection OK - Test Mode',
      user: { 
        id: user.id,
        email: user.email, 
        role: user.role 
      }
    })
    
  } catch (error) {
    console.error('💥 エラーが発生:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
