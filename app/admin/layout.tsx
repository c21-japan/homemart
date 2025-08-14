'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [adminName, setAdminName] = useState('')

  useEffect(() => {
    // ログインページは除外
    if (pathname === '/admin/login') {
      setIsAuthorized(true)
      return
    }

    // 認証チェック
    const isAdmin = localStorage.getItem('isAdmin')
    const name = localStorage.getItem('adminName')
    
    if (!isAdmin) {
      router.push('/admin/login')
    } else {
      setIsAuthorized(true)
      setAdminName(name || '管理者')
    }
  }, [router, pathname])

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminName')
    router.push('/admin/login')
  }

  // ログインページの場合はレイアウトなし
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

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
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                ようこそ、{adminName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                ログアウト
              </button>
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
