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
import {
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
  TrophyIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(3) // 通知数のサンプル

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
        
        if (!canAccessPage(userRole, pathname)) {
          router.push('/')
          return
        }
        
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-orange-600 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-b-4 border-orange-300 mx-auto opacity-20"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">システム準備中...</p>
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

  const navigationItems = [
    {
      name: 'ダッシュボード',
      href: '/admin',
      icon: HomeIcon,
      requiredRole: UserRole.STAFF,
      isSensitive: false,
      badge: null
    },
    {
      name: 'リード管理',
      href: '/admin/leads',
      icon: UserGroupIcon,
      requiredRole: UserRole.STAFF,
      isSensitive: true,
      badge: '新着12'
    },
    {
      name: '物件管理',
      href: '/admin/properties',
      icon: BuildingOfficeIcon,
      requiredRole: UserRole.STAFF,
      isSensitive: true,
      badge: null
    },
    {
      name: '社内申請',
      href: '/admin/internal-applications',
      icon: DocumentTextIcon,
      requiredRole: UserRole.STAFF,
      isSensitive: true,
      badge: '承認待ち3'
    },
    {
      name: 'アルバイト勤怠',
      href: '/admin/part-time-attendance',
      icon: ClockIcon,
      requiredRole: UserRole.STAFF,
      isSensitive: true,
      badge: null
    },
    {
      name: 'ユーザー管理',
      href: '/admin/users',
      icon: UserCircleIcon,
      requiredRole: UserRole.ADMIN,
      isSensitive: true,
      badge: null
    },
    {
      name: '書類管理',
      href: '/admin/documents',
      icon: DocumentTextIcon,
      requiredRole: UserRole.ADMIN,
      isSensitive: true,
      badge: null
    },
    {
      name: '勤怠管理',
      href: '/admin/attendance',
      icon: ClockIcon,
      requiredRole: UserRole.ADMIN,
      isSensitive: true,
      badge: null
    },
    {
      name: 'レポート',
      href: '/admin/reports',
      icon: ChartBarIcon,
      requiredRole: UserRole.ADMIN,
      isSensitive: true,
      badge: null
    },
    {
      name: 'キャリアパス',
      href: '/admin/career-path',
      icon: AcademicCapIcon,
      requiredRole: UserRole.ADMIN,
      isSensitive: true,
      badge: null
    },
    {
      name: 'チーム成績',
      href: '/admin/team-performance',
      icon: TrophyIcon,
      requiredRole: UserRole.ADMIN,
      isSensitive: true,
      badge: null
    },
    {
      name: '職人管理',
      href: '/admin/reform-workers',
      icon: WrenchScrewdriverIcon,
      requiredRole: UserRole.ADMIN,
      isSensitive: true,
      badge: null
    }
  ].filter(item => {
    if (userRole < item.requiredRole) return false
    if (item.isSensitive && !canAccessSensitiveInfo(userRole, item.href)) return false
    return true
  })

  const roleColors = {
    [UserRole.OWNER]: 'bg-gradient-to-r from-purple-600 to-purple-700',
    [UserRole.ADMIN]: 'bg-gradient-to-r from-blue-600 to-blue-700',
    [UserRole.STAFF]: 'bg-gradient-to-r from-gray-600 to-gray-700'
  }

  const roleBadgeColors = {
    [UserRole.OWNER]: 'bg-purple-100 text-purple-800 border-purple-200',
    [UserRole.ADMIN]: 'bg-blue-100 text-blue-800 border-blue-200',
    [UserRole.STAFF]: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* サイドバー - デスクトップ */}
      <div className={`fixed inset-y-0 left-0 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-xl transition-all duration-300 transform hidden lg:block`}>
        <div className="flex flex-col h-full">
          {/* ロゴエリア */}
          <div className={`${roleColors[userRole]} p-4`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${!isSidebarOpen && 'justify-center'}`}>
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-xl">H</span>
                </div>
                {isSidebarOpen && (
                  <div className="ml-3">
                    <h2 className="text-white font-bold text-lg">ホームマート</h2>
                    <p className="text-white/80 text-xs">管理システム</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ユーザー情報 */}
          {isSidebarOpen && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0].toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName || user?.emailAddresses[0]?.emailAddress.split('@')[0]}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleBadgeColors[userRole]}`}>
                    {userPermissions?.name}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ナビゲーション */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-orange-50 text-orange-600 shadow-sm border-l-4 border-orange-600' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                        ${!isSidebarOpen && 'justify-center'}
                      `}
                      title={!isSidebarOpen ? item.name : undefined}
                    >
                      <div className="flex items-center">
                        <Icon className={`h-5 w-5 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} />
                        {isSidebarOpen && (
                          <span className="ml-3 font-medium">{item.name}</span>
                        )}
                      </div>
                      {isSidebarOpen && item.badge && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* 下部メニュー */}
          <div className="p-4 border-t">
            <SignOutButton>
              <button className={`
                flex items-center w-full px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors
                ${!isSidebarOpen && 'justify-center'}
              `}>
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                {isSidebarOpen && <span className="ml-3 font-medium">ログアウト</span>}
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-gray-900"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
              <div className="ml-3">
                <h2 className="text-lg font-bold text-gray-900">ホームマート</h2>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="relative p-2">
                {notifications > 0 ? (
                  <>
                    <BellIconSolid className="h-6 w-6 text-orange-600" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  </>
                ) : (
                  <BellIcon className="h-6 w-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* モバイルサイドバー */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col h-full pt-16">
                <nav className="flex-1 overflow-y-auto p-4">
                  <ul className="space-y-1">
                    {navigationItems.map((item) => {
                      const isActive = pathname === item.href
                      const Icon = item.icon
                      
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                              flex items-center justify-between px-3 py-2.5 rounded-lg
                              ${isActive 
                                ? 'bg-orange-50 text-orange-600' 
                                : 'text-gray-700 hover:bg-gray-100'
                              }
                            `}
                          >
                            <div className="flex items-center">
                              <Icon className="h-5 w-5" />
                              <span className="ml-3">{item.name}</span>
                            </div>
                            {item.badge && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* メインコンテンツ */}
      <div className={`${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300`}>
        {/* トップバー */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-20 hidden lg:block">
          <div className="flex justify-between items-center px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {navigationItems.find(item => item.href === pathname)?.name || 'ダッシュボード'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('ja-JP', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 通知 */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                {notifications > 0 ? (
                  <>
                    <BellIconSolid className="h-6 w-6 text-orange-600" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {notifications}
                    </span>
                  </>
                ) : (
                  <BellIcon className="h-6 w-6" />
                )}
              </button>

              {/* 設定 */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Cog6ToothIcon className="h-6 w-6" />
              </button>

              {/* サイトトップリンク */}
              <Link 
                href="/" 
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-sm"
              >
                サイトトップ
              </Link>
            </div>
          </div>
        </header>
        
        <main className="p-4 lg:p-6 mt-16 lg:mt-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
