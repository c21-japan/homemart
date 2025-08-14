import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-direct'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 デバッグエンドポイント開始')
    
    // 設定情報の確認
    const configInfo = {
      hasSupabaseUrl: true,
      hasAnonKey: true,
      nodeEnv: 'development',
      hasJwtSecret: true
    }
    
    console.log('📋 設定情報:', configInfo)

    // データベース接続テスト
    console.log('🔌 データベース接続テスト中...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('auth_users')
      .select('count')
      .limit(1)

    if (connectionError) {
      console.log('❌ データベース接続エラー:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'データベース接続エラー',
        details: connectionError,
        configInfo
      }, { status: 500 })
    }

    console.log('✅ データベース接続成功')

    // ユーザー一覧取得
    console.log('👥 ユーザー一覧取得中...')
    const { data: users, error: usersError } = await supabase
      .from('auth_users')
      .select(`
        id,
        email,
        role,
        is_active,
        last_login,
        created_at,
        user_profiles (
          first_name,
          last_name,
          employee_code
        )
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      console.log('❌ ユーザー取得エラー:', usersError)
      return NextResponse.json({
        success: false,
        error: 'ユーザー取得エラー',
        details: usersError,
        configInfo,
        connectionTest: '成功'
      }, { status: 500 })
    }

    console.log('✅ ユーザー取得成功')

    // 権限情報取得
    console.log('🔐 権限情報取得中...')
    const { data: permissions, error: permissionsError } = await supabase
      .from('permissions')
      .select('*')
      .limit(10)

    if (permissionsError) {
      console.log('⚠️ 権限取得エラー:', permissionsError)
    }

    // 統計情報
    const stats = {
      totalUsers: users?.length || 0,
      activeUsers: users?.filter(u => u.is_active).length || 0,
      totalPermissions: permissions?.length || 0,
      roles: [...new Set(users?.map(u => u.role) || [])]
    }

    console.log('📊 統計情報:', stats)
    console.log('🎉 デバッグエンドポイント完了')

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      configInfo,
      connectionTest: '成功',
      stats,
      users: users?.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        profile: user.user_profiles
      })),
      permissions: permissions || []
    })

  } catch (error) {
    console.error('💥 デバッグエンドポイントでエラーが発生:', error)
    return NextResponse.json({
      success: false,
      error: 'デバッグ処理中にエラーが発生しました',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
