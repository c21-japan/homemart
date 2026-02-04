'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const navigation = [
  { name: 'ダッシュボード', href: '/admin', icon: '📊' },
  { name: '顧客管理', href: '/admin/customers', icon: '👥' },
  { name: '物件管理', href: '/admin/properties', icon: '🏠' },
  { name: 'リード管理', href: '/admin/leads', icon: '🎯' },
  { name: '勤怠管理', href: '/admin/attendance', icon: '⏰' },
  { name: 'パートタイム勤怠', href: '/admin/part-time-attendance', icon: '👷' },
  { name: '内部申請', href: '/admin/internal-applications', icon: '📝' },
  { name: 'マニュアル', href: '/admin/manuals', icon: '📘' },
  { name: '問い合わせ', href: '/admin/inquiries', icon: '💬' },
  { name: 'リフォーム案件', href: '/admin/reform-projects', icon: '🔨' },
  { name: 'ユーザー管理', href: '/admin/users', icon: '👤' },
  { name: 'メディア管理', href: '/admin/media', icon: '📷' },
  { name: '経理', href: '/admin/accounting', icon: '💹' },
  { name: '設定', href: '/admin/settings/users', icon: '⚙️' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#FFF6DE]/70">
      {/* モバイルサイドバー */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-[#15130D] text-[#FFF6DE]">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-display text-[#F4C84B]">管理画面</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-[#F6EBD2]/70 hover:text-[#F4C84B]"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F4C84B] text-[#15130D]'
                      : 'text-[#F6EBD2]/80 hover:bg-[#F4C84B]/10 hover:text-[#F4C84B]'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* デスクトップサイドバー */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-[#15130D] text-[#FFF6DE] border-r border-[#2A2418]">
          <div className="flex h-16 items-center px-4 border-b border-[#2A2418]">
            <h1 className="text-xl font-display text-[#F4C84B]">管理画面</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F4C84B] text-[#15130D]'
                      : 'text-[#F6EBD2]/80 hover:bg-[#F4C84B]/10 hover:text-[#F4C84B]'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="lg:pl-64">
        {/* トップバー */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[#EAD8A6] bg-white/80 px-4 shadow-sm backdrop-blur sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-[#6E5B2E] lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">サイドバーを開く</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 text-sm font-semibold text-[#15130D]">ホームマート 管理</div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {new Date().toLocaleTimeString('ja-JP')}
              </div>
            </div>
          </div>
        </div>

        {/* ページコンテンツ */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
