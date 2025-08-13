'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AdminNavigation from '@/components/AdminNavigation'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // 社員テーブルでユーザーを確認
        const { data: staff, error } = await supabase
          .from('staff_members')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error || !staff) {
          // 社員として登録されていない場合は一般ユーザーとして扱う
          console.log('社員として登録されていません')
          router.push('/admin/login')
          return
        }

        setUser(user)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('認証エラー:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">ホームマート 管理画面</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              ログイン中: {user.email}
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

      <div className="flex">
        {/* サイドバーナビゲーション */}
        <AdminNavigation userId={user.id} />
        
        {/* メインコンテンツ */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>

      {/* PWAインストール促進 */}
      <PWAInstallPrompt />
    </div>
  )
}
