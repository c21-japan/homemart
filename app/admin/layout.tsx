'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { UserRole, PERMISSIONS, canAccessPage, hasPermission, OWNER_EMAILS, ADMIN_EMAILS } from '@/lib/auth/permissions'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        // 未認証の場合はログインページにリダイレクト
        router.push('/member/login')
        return
      }

      if (isSignedIn && user) {
        // ユーザーのメールアドレスを取得
        const userEmail = user.emailAddresses[0]?.emailAddress
        
        // メールアドレスベースの権限チェック
        let userRole: UserRole = UserRole.STAFF
        
        if (userEmail) {
          if (OWNER_EMAILS.includes(userEmail)) {
            userRole = UserRole.OWNER
          } else if (ADMIN_EMAILS.includes(userEmail)) {
            userRole = UserRole.ADMIN
          }
        }
        
        // 現在のページにアクセス権限があるかチェック
        if (!canAccessPage(userRole, pathname)) {
          // 権限がない場合はトップページにリダイレクト
          router.push('/')
          return
        }
        
        // 権限チェック完了
        setIsChecking(false)
      }
    }
  }, [isLoaded, isSignedIn, user, router, pathname])

  // ローディング中または権限チェック中
  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証中...</p>
        </div>
      </div>
    )
  }

  // ユーザーの権限を取得（メールアドレスベース）
  const userEmail = user?.emailAddresses[0]?.emailAddress
  let userRole: UserRole = UserRole.STAFF
  
  if (userEmail) {
    if (OWNER_EMAILS.includes(userEmail)) {
      userRole = UserRole.OWNER
    } else if (ADMIN_EMAILS.includes(userEmail)) {
      userRole = UserRole.ADMIN
    }
  }
  
  const userPermissions = PERMISSIONS[userRole]

  // 権限に応じたナビゲーションメニューを生成
  const getNavigationItems = () => {
    const allItems = [
      { href: '/admin', label: 'ダッシュボード', icon: '📊' },
      { href: '/admin/leads', label: 'リード管理', icon: '📋' },
      { href: '/admin/properties', label: '物件管理', icon: '🏠' },
      { href: '/admin/internal-applications', label: '社内申請', icon: '📝' },
      { href: '/admin/part-time-attendance', label: 'アルバイト勤怠', icon: '⏰' },
      { href: '/admin/users', label: 'ユーザー管理', icon: '👥', requiresPermission: 'canManageUsers' },
      { href: '/admin/documents', label: '書類管理', icon: '📁' },
      { href: '/admin/attendance', label: '勤怠管理', icon: '📅' },
      { href: '/admin/reports', label: 'レポート', icon: '📈' },
      { href: '/admin/career-path', label: 'キャリアパス管理', icon: '🎯' },
      { href: '/admin/team-performance', label: 'チーム成績管理', icon: '🏆' },
      { href: '/admin/reform-workers', label: 'リフォーム職人管理', icon: '🔨' }
    ]

    return allItems.filter(item => {
      if (item.requiresPermission) {
        return hasPermission(userRole, item.requiresPermission as keyof typeof PERMISSIONS[UserRole])
      }
      return canAccessPage(userRole, item.href)
    })
  }

  const navigationItems = getNavigationItems()

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
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <div>ようこそ、{user?.firstName || user?.emailAddresses[0]?.emailAddress}</div>
                <div className="text-xs text-gray-500">
                  {userPermissions?.name} - {userPermissions?.description}
                </div>
                <div className="text-xs text-gray-400">
                  メール: {userEmail} | 権限: {userRole}
                </div>
              </div>
              <SignOutButton>
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  ログアウト
                </button>
              </SignOutButton>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
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
