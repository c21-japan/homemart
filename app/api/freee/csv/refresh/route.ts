import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/session'
import { getUserPermissions } from '@/lib/auth/permissions-server'
import { hasPermission } from '@/lib/auth/permissions'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile } from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5分のタイムアウト

export async function POST() {
  const session = await verifySession()
  if (!session) {
    return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
  }

  if (session.role !== 'OWNER') {
    return NextResponse.json(
      { message: '更新はオーナーのみ可能です' },
      { status: 403 }
    )
  }

  const permissions = await getUserPermissions(session.userId)
  if (!permissions || !hasPermission(permissions, 'REPORTS', 'EXPORT')) {
    return NextResponse.json({ message: '権限がありません' }, { status: 403 })
  }

  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'freee', 'download_csv.py')
    const pythonPath = process.env.PYTHON_PATH || 'python3'

    console.log('Pythonスクリプトを実行中...')

    // Pythonスクリプトを実行
    const { stdout, stderr } = await execAsync(
      `${pythonPath} "${scriptPath}"`,
      {
        cwd: process.cwd(),
        timeout: 300000, // 5分
        maxBuffer: 10 * 1024 * 1024 // 10MB
      }
    )

    if (stderr) {
      console.error('Python stderr:', stderr)
    }

    console.log('Python stdout:', stdout)

    // 生成されたJSONファイルを読み込む
    const dataPath = path.join(process.cwd(), 'tmp', 'freee_data', 'freee_data.json')
    const jsonData = await readFile(dataPath, 'utf-8')
    const data = JSON.parse(jsonData)

    return NextResponse.json({
      success: true,
      message: 'CSVデータを取得しました',
      updated_at: data.updated_at,
      period: data.period,
      data: data.data
    })
  } catch (error) {
    console.error('freee CSV取得失敗:', error)
    const detail =
      error instanceof Error ? error.message : 'freee CSVダウンロードに失敗しました'
    return NextResponse.json({ message: detail }, { status: 500 })
  }
}
