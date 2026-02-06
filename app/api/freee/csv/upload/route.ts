import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/session'
import { getUserPermissions } from '@/lib/auth/permissions-server'
import { hasPermission } from '@/lib/auth/permissions'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await verifySession()
  if (!session) {
    return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
  }

  // OWNER、ADMIN、またはREPORTS権限を持つユーザーのみアップロード可能
  if (session.role !== 'OWNER' && session.role !== 'ADMIN') {
    const permissions = await getUserPermissions(session.userId)
    if (!permissions || !hasPermission(permissions, 'REPORTS', 'EXPORT')) {
      return NextResponse.json({ message: '権限がありません' }, { status: 403 })
    }
  }

  try {
    const formData = await request.formData()
    const trialBalanceFile = formData.get('trial_balance') as File | null
    const journalFile = formData.get('journal') as File | null
    const generalLedgerFile = formData.get('general_ledger') as File | null

    if (!trialBalanceFile && !journalFile && !generalLedgerFile) {
      return NextResponse.json(
        { message: '少なくとも1つのCSVファイルをアップロードしてください' },
        { status: 400 }
      )
    }

    // CSVファイルをパース（メモリ上で処理）
    const parsedData: Record<string, any[]> = {}

    if (trialBalanceFile) {
      parsedData.trial_balance = await parseCSVFile(trialBalanceFile)
    }

    if (journalFile) {
      parsedData.journal = await parseCSVFile(journalFile)
    }

    if (generalLedgerFile) {
      parsedData.general_ledger = await parseCSVFile(generalLedgerFile)
    }

    // 決算期の期間を計算（5月1日〜4月30日）
    const now = new Date()
    const currentYear = now.getFullYear()
    const periodStart =
      now.getMonth() >= 4
        ? `${currentYear}-05-01`
        : `${currentYear - 1}-05-01`
    const periodEnd = now.toISOString().split('T')[0]

    // Supabaseに保存（管理用クライアントを使用してRLSをバイパス）
    const supabase = createAdminClient()
    const { data: insertedData, error } = await supabase
      .from('freee_reports')
      .insert({
        uploaded_by: session.userId,
        trial_balance: parsedData.trial_balance || null,
        journal: parsedData.journal || null,
        general_ledger: parsedData.general_ledger || null,
        period_start: periodStart,
        period_end: periodEnd
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { message: 'データの保存に失敗しました: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'CSVファイルをアップロードしました',
      uploaded_files: Object.keys(parsedData),
      updated_at: now.toISOString(),
      id: insertedData.id
    })
  } catch (error) {
    console.error('CSV upload failed:', error)
    const detail =
      error instanceof Error ? error.message : 'CSVアップロードに失敗しました'
    return NextResponse.json({ message: detail }, { status: 500 })
  }
}

async function parseCSVFile(file: File): Promise<any[]> {
  try {
    const csvParser = await import('csv-parse/sync')
    const text = await file.text()

    const records = csvParser.parse(text, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true
    })

    return records
  } catch (err) {
    console.error(`Failed to parse CSV file ${file.name}:`, err)
    return []
  }
}
