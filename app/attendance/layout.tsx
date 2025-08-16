import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '勤怠管理 | HomeMart',
  description: '従業員の勤怠打刻・管理システム',
}

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
