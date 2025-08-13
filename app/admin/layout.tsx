'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // ログインページの場合はレイアウトを適用しない
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  useEffect(() => {
    // セッションストレージから認証状態をチェック
    const checkAuth = () => {
      const authStatus = sessionStorage.getItem('admin-auth')
      const timestamp = sessionStorage.getItem('admin-timestamp')
      
      if (authStatus === 'authenticated' && timestamp) {
        const now = Date.now()
        const authTime = parseInt(timestamp)
        
        // 24時間以内の認証であれば有効
        if (now - authTime < 24 * 60 * 60 * 1000) {
          setIsAuthenticated(true)
        } else {
          // 認証期限切れ
          sessionStorage.removeItem('admin-auth')
          sessionStorage.removeItem('admin-timestamp')
          router.push('/admin/login')
        }
      } else {
        // 認証されていない場合はログインページにリダイレクト
        router.push('/admin/login')
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem('admin-auth')
    sessionStorage.removeItem('admin-timestamp')
    router.push('/admin/login')
  }

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // 認証されていない場合
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">ホームマート 管理画面</h1>
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              管理者
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              ログイン中: 管理者
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* PWAインストール促進 */}
      <PWAInstallPrompt />
    </div>
  )
}
