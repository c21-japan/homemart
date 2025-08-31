import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: '勤怠管理 | HomeMart',
  description: '従業員の勤怠打刻・管理システム',
}

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
