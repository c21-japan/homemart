'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">
                ホームマート管理画面
              </h1>
              <nav className="flex space-x-4">
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/admin/leads"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/leads'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  リード管理
                </Link>
                <Link
                  href="/admin/properties"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/properties'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  物件管理
                </Link>
                <Link
                  href="/admin/internal-applications"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/internal-applications'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  社内申請
                </Link>
                <Link
                  href="/admin/part-time-attendance"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/part-time-attendance'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                >
                  アルバイト勤怠
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                ようこそ、管理者
              </span>
              <Link
                href="/"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                トップページへ
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8">
        {children}
      </main>
    </div>
  )
}
