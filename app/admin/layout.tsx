'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UsersIcon, 
  ChartBarIcon,
  ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const checkAuth = () => {
    // セキュアな認証チェック
    const authData = localStorage.getItem('admin-auth')
    
    if (!authData) {
      if (pathname !== '/admin/login') {
        router.push('/admin/login')
      }
      setLoading(false)
      return
    }

    try {
      const auth = JSON.parse(authData)
      const now = new Date().getTime()
      
      // トークンの有効期限チェック（24時間）
      if (auth.expires && auth.expires > now) {
        setIsAuthenticated(true)
        
        // トークンの自動更新（残り1時間を切ったら更新）
        const timeRemaining = auth.expires - now
        if (timeRemaining < 3600000) { // 1時間
          const newExpires = now + 86400000 // 24時間延長
          const updatedAuth = { ...auth, expires: newExpires }
          localStorage.setItem('admin-auth', JSON.stringify(updatedAuth))
        }
      } else {
        // 期限切れ
        localStorage.removeItem('admin-auth')
        setIsAuthenticated(false)
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
      }
    } catch (error) {
      console.error('認証エラー:', error)
      localStorage.removeItem('admin-auth')
      setIsAuthenticated(false)
      if (pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    }
    
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin-auth')
    setIsAuthenticated(false)
    router.push('/admin/login')
  }

  // ログインページの場合は認証不要
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 未認証
  if (!isAuthenticated) {
    return null
  }

  // ナビゲーションメニュー
  const navItems = [
    { href: '/admin', label: 'ダッシュボード', icon: HomeIcon },
    { href: '/admin/properties', label: '物件管理', icon: BuildingOfficeIcon },
    { href: '/admin/inquiries', label: 'お問い合わせ', icon: UsersIcon },
    { href: '/admin/analytics', label: '分析', icon: ChartBarIcon }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* サイドバー */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
        <div className="flex flex-col h-full">
          {/* ロゴ */}
          <div className="px-6 py-4 bg-gray-800">
            <h2 className="text-xl font-bold text-white">
              ホームマート管理画面
            </h2>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* ログアウトボタン */}
          <div className="px-4 py-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="ml-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
