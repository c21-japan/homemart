import { NextResponse } from 'next/server'
import { readJsonIfExists, getReportCachePath } from '@/lib/freee/storage'
import { verifySession } from '@/lib/auth/session'
import { getUserPermissions } from '@/lib/auth/permissions-server'
import { hasPermission } from '@/lib/auth/permissions'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await verifySession()
  if (!session) {
    return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
  }

  const permissions = await getUserPermissions(session.userId)
  if (!permissions || !hasPermission(permissions, 'REPORTS', 'VIEW')) {
    return NextResponse.json({ message: '権限がありません' }, { status: 403 })
  }

  const cache = await readJsonIfExists<any>(getReportCachePath())

  if (!cache) {
    return NextResponse.json({ message: 'レポートが未取得です' }, { status: 404 })
  }

  const { updated_at, period, summary } = cache
  return NextResponse.json({ updated_at, period, summary })
}
