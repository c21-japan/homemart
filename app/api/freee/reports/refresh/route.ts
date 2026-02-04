import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/session'
import { getUserPermissions } from '@/lib/auth/permissions-server'
import { hasPermission } from '@/lib/auth/permissions'
import { fetchTrialBS, fetchTrialPL } from '@/lib/freee/reports'
import { getFiscalRange, formatJstDate } from '@/lib/freee/dates'
import { buildBsSummary, buildPlSummary } from '@/lib/freee/summary'
import { writeJson, getReportCachePath } from '@/lib/freee/storage'

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await verifySession()
  if (!session) {
    return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
  }

  if (session.role !== 'OWNER') {
    return NextResponse.json({ message: '更新はオーナーのみ可能です' }, { status: 403 })
  }

  const permissions = getUserPermissions(session.userId)
  if (!permissions || !hasPermission(permissions, 'REPORTS', 'EXPORT')) {
    return NextResponse.json({ message: '権限がありません' }, { status: 403 })
  }

  try {
    const now = new Date()
    const { startDate, endDate } = getFiscalRange(now)

    const [trialPL, trialBS] = await Promise.all([
      fetchTrialPL(startDate, endDate),
      fetchTrialBS(startDate, endDate)
    ])

    const plBalances = trialPL.trial_pl?.balances || []
    const bsBalances = trialBS.trial_bs?.balances || []

    const summary = {
      pl: buildPlSummary(plBalances),
      bs: buildBsSummary(bsBalances)
    }

    const payload = {
      updated_at: formatJstDate(now),
      period: { start_date: startDate, end_date: endDate },
      trial_pl: trialPL,
      trial_bs: trialBS,
      summary
    }

    await writeJson(getReportCachePath(), payload)

    return NextResponse.json({
      updated_at: payload.updated_at,
      period: payload.period,
      summary: payload.summary
    })
  } catch (error) {
    console.error('freeeレポート取得失敗:', error)
    const detail =
      error instanceof Error ? error.message : 'freeeレポート取得に失敗しました'
    return NextResponse.json({ message: detail }, { status: 500 })
  }
}
