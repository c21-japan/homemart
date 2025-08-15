'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { 
  UserRole, 
  PERMISSIONS, 
  canAccessPage, 
  hasPermission, 
  OWNER_EMAILS, 
  ADMIN_EMAILS,
  PAGE_PERMISSIONS,
  canAccessSensitiveInfo,
  canPerformAction
} from '@/lib/auth/permissions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/member/login')
        return
      }
      if (isSignedIn && user) {
        const userEmail = user.emailAddresses[0]?.emailAddress
        let userRole: UserRole = UserRole.STAFF
        if (userEmail) {
          if (OWNER_EMAILS.includes(userEmail)) {
            userRole = UserRole.OWNER
          } else if (ADMIN_EMAILS.includes(userEmail)) {
            userRole = UserRole.ADMIN
          }
        }
        
        // ページアクセス権限チェック
        if (!canAccessPage(userRole, pathname)) {
          router.push('/')
          return
        }
        
        // 機密情報へのアクセス権限チェック
        if (!canAccessSensitiveInfo(userRole, pathname)) {
          router.push('/admin')
          return
        }
        
        setIsChecking(false)
      }
    }
  }, [isLoaded, isSignedIn, user, router, pathname])

  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">権限チェック中...</p>
        </div>
      </div>
    )
  }

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

  const getNavigationItems = () => {
    const items = [
      {
        name: 'ダッシュボード',
        href: '/admin',
        icon: '📊',
        requiredRole: UserRole.STAFF,
        isSensitive: false
      },
      {
        name: 'リード管理',
        href: '/admin/leads',
        icon: '👥',
        requiredRole: UserRole.STAFF,
        isSensitive: true
      },
      {
        name: '物件管理',
        href: '/admin/properties',
        icon: '🏠',
        requiredRole: UserRole.STAFF,
        isSensitive: true
      },
      {
        name: '社内申請',
        href: '/admin/internal-applications',
        icon: '📝',
        requiredRole: UserRole.STAFF,
        isSensitive: true
      },
      {
        name: 'アルバイト勤怠',
        href: '/admin/part-time-attendance',
        icon: '⏰',
        requiredRole: UserRole.STAFF,
        isSensitive: true
      },
      {
        name: 'ユーザー管理',
        href: '/admin/users',
        icon: '👤',
        requiredRole: UserRole.ADMIN,
        isSensitive: true
      },
      {
        name: '書類管理',
        href: '/admin/documents',
        icon: '📁',
        requiredRole: UserRole.ADMIN,
        isSensitive: true
      },
      {
        name: '勤怠管理',
        href: '/admin/attendance',
        icon: '📅',
        requiredRole: UserRole.ADMIN,
        isSensitive: true
      },
      {
        name: 'レポート',
        href: '/admin/reports',
        icon: '📈',
        requiredRole: UserRole.ADMIN,
        isSensitive: true
      },
      {
        name: 'キャリアパス管理',
        href: '/admin/career-path',
        icon: '🎯',
        requiredRole: UserRole.ADMIN,
        isSensitive: true
      },
      {
        name: 'チーム成績管理',
        href: '/admin/team-performance',
        icon: '🏆',
        requiredRole: UserRole.ADMIN,
        isSensitive: true
      },
      {
        name: 'リフォーム職人管理',
        href: '/admin/reform-workers',
        icon: '🔨',
        requiredRole: UserRole.ADMIN,
        isSensitive: true
      }
    ]

    return items.filter(item => {
      // 権限レベルチェック
      if (userRole < item.requiredRole) return false
      
      // 機密情報へのアクセス権限チェック
      if (item.isSensitive && !canAccessSensitiveInfo(userRole, item.href)) return false
      
      return true
    })
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="flex justify-between items-center py-4 px-6">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-semibold text-gray-900">管理画面</h1>
            <nav className="flex space-x-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                const canAccess = canAccessPage(userRole, item.href)
                
                if (!canAccess) return null
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                    {item.isSensitive && (
                      <span className="ml-1 text-xs text-red-600">🔒</span>
                    )}
                  </Link>
                )
              })}
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
              {PAGE_PERMISSIONS.find(p => p.path === pathname)?.isSensitive && (
                <div className="text-xs text-red-600 font-medium">
                  🔒 機密情報ページ
                </div>
              )}
            </div>
            <SignOutButton>
              <button className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors">
                ログアウト
              </button>
            </SignOutButton>
            <Link 
              href="/" 
              className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              サイトトップ
            </Link>
          </div>
        </div>
      </header>
      
      <main className="py-8">
        {children}
      </main>
    </div>
  )
}
