import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/session'
import { getUserPermissions } from '@/lib/auth/permissions-server'
import { hasPermission } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await verifySession()
  if (!session) {
    return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
  }

  const permissions = getUserPermissions(session.userId)
  if (!permissions || !hasPermission(permissions, 'REPORTS', 'VIEW')) {
    return NextResponse.json({ message: '権限がありません' }, { status: 403 })
  }

  try {
    // Supabaseから最新のfreeeレポートを取得
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('freee_reports')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // データが見つからない
        return NextResponse.json(
          { message: 'CSVデータがまだアップロードされていません。' },
          { status: 404 }
        )
      }
      console.error('Supabase select error:', error)
      return NextResponse.json(
        { message: 'データの取得に失敗しました: ' + error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { message: 'CSVデータがまだアップロードされていません。' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      updated_at: data.uploaded_at,
      period: {
        start_date: data.period_start,
        end_date: data.period_end
      },
      data: {
        trial_balance: data.trial_balance,
        journal: data.journal,
        general_ledger: data.general_ledger
      }
    })
  } catch (error) {
    console.error('freee CSVデータ読み込み失敗:', error)
    const detail =
      error instanceof Error ? error.message : 'CSVデータの読み込みに失敗しました'
    return NextResponse.json({ message: detail }, { status: 500 })
  }
}
