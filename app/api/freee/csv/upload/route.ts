import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/session'
import { getUserPermissions } from '@/lib/auth/permissions-server'
import { hasPermission } from '@/lib/auth/permissions'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await verifySession()
  if (!session) {
    return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
  }

  // OWNER、ADMIN、またはREPORTS権限を持つユーザーのみアップロード可能
  if (session.role !== 'OWNER' && session.role !== 'ADMIN') {
    const permissions = getUserPermissions(session.userId)
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

    // ディレクトリを作成
    const csvDir = path.join(process.cwd(), 'tmp', 'freee_csv')
    const dataDir = path.join(process.cwd(), 'tmp', 'freee_data')
    await mkdir(csvDir, { recursive: true })
    await mkdir(dataDir, { recursive: true })

    const uploadedFiles: Record<string, string> = {}

    // CSVファイルを保存
    if (trialBalanceFile) {
      const buffer = Buffer.from(await trialBalanceFile.arrayBuffer())
      const filePath = path.join(csvDir, 'trial_balance.csv')
      await writeFile(filePath, buffer)
      uploadedFiles.trial_balance = filePath
    }

    if (journalFile) {
      const buffer = Buffer.from(await journalFile.arrayBuffer())
      const filePath = path.join(csvDir, 'journal.csv')
      await writeFile(filePath, buffer)
      uploadedFiles.journal = filePath
    }

    if (generalLedgerFile) {
      const buffer = Buffer.from(await generalLedgerFile.arrayBuffer())
      const filePath = path.join(csvDir, 'general_ledger.csv')
      await writeFile(filePath, buffer)
      uploadedFiles.general_ledger = filePath
    }

    // CSVをJSONに変換（パース処理）
    const parsedData = await parseCSVFiles(uploadedFiles)

    // JSONファイルとして保存
    const outputPath = path.join(dataDir, 'freee_data.json')
    await writeFile(outputPath, JSON.stringify(parsedData, null, 2))

    return NextResponse.json({
      success: true,
      message: 'CSVファイルをアップロードしました',
      uploaded_files: Object.keys(uploadedFiles),
      updated_at: parsedData.updated_at
    })
  } catch (error) {
    console.error('CSV upload failed:', error)
    const detail =
      error instanceof Error ? error.message : 'CSVアップロードに失敗しました'
    return NextResponse.json({ message: detail }, { status: 500 })
  }
}

async function parseCSVFiles(files: Record<string, string>) {
  // 動的にcsvパーサーをインポート
  const csvParser = await import('csv-parse/sync')
  const { readFile } = await import('fs/promises')

  const data: Record<string, any[]> = {}
  const now = new Date()

  for (const [type, filePath] of Object.entries(files)) {
    try {
      const fileContent = await readFile(filePath, 'utf-8')
      // Shift-JISまたはUTF-8で読み込み
      const records = csvParser.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        encoding: 'utf-8'
      })
      data[type] = records
    } catch (err) {
      console.error(`Failed to parse ${type}:`, err)
      data[type] = []
    }
  }

  // 決算期の期間を計算（5月1日〜4月30日）
  const currentYear = now.getFullYear()
  const startDate =
    now.getMonth() >= 4
      ? `${currentYear}-05-01`
      : `${currentYear - 1}-05-01`
  const endDate = now.toISOString().split('T')[0]

  return {
    updated_at: now.toISOString(),
    period: { start_date: startDate, end_date: endDate },
    data
  }
}
