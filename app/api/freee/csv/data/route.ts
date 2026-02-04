import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/session'
import { getUserPermissions } from '@/lib/auth/permissions-server'
import { hasPermission } from '@/lib/auth/permissions'
import { readFile } from 'fs/promises'
import path from 'path'

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
    // CSVから生成されたJSONファイルを読み込む
    const dataPath = path.join(process.cwd(), 'tmp', 'freee_data', 'freee_data.json')
    const jsonData = await readFile(dataPath, 'utf-8')
    const data = JSON.parse(jsonData)

    return NextResponse.json({
      success: true,
      updated_at: data.updated_at,
      period: data.period,
      data: data.data
    })
  } catch (error) {
    console.error('freee CSVデータ読み込み失敗:', error)

    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { message: 'CSVデータがまだ取得されていません。CSV取得ボタンを押してデータを取得してください。' },
        { status: 404 }
      )
    }

    const detail =
      error instanceof Error ? error.message : 'CSVデータの読み込みに失敗しました'
    return NextResponse.json({ message: detail }, { status: 500 })
  }
}
