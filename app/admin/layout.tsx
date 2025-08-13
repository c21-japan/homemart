'use client'

import { useRequireAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, staff, loading, requireAuth } = useRequireAuth()
  const router = useRouter()

  useEffect(() => {
    const authStatus = requireAuth()
    
    if (authStatus === 'unauthenticated') {
      router.push('/admin/login')
    } else if (authStatus === 'unauthorized') {
      router.push('/admin/login')
    }
  }, [requireAuth, router])

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
  if (!user || !staff) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">ホームマート 管理画面</h1>
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {staff.role === 'admin' ? '管理者' : staff.role}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              ログイン中: {staff.first_name} {staff.last_name} ({user.email})
            </div>
            <button
              onClick={() => {
                // AuthContextのsignOutを使用
                window.location.href = '/admin/login'
              }}
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
