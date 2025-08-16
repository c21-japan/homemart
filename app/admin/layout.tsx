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
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  TrophyIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

interface Activity {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  time: string;
  user?: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false) // 認証チェックをスキップ
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // 最近のアクティビティデータ（サンプル）
  const [recentActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'success',
      message: '新しい物件が登録されました',
      time: '5分前',
      user: '田中太郎'
    },
    {
      id: '2',
      type: 'info',
      message: 'システムメンテナンスが完了しました',
      time: '1時間前',
      user: 'システム'
    },
    {
      id: '3',
      type: 'warning',
      message: 'リードのフォローアップが必要です',
      time: '2時間前',
      user: '佐藤花子'
    },
    {
      id: '4',
      type: 'error',
      message: 'ファイルのアップロードに失敗しました',
      time: '3時間前',
      user: '山田次郎'
    }
  ]);

  // 通知を閉じる
  const closeNotifications = () => {
    setNotificationsOpen(false);
  };

  // 通知外をクリックした時に閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsOpen) {
        const target = event.target as Element;
        if (!target.closest('.notifications-dropdown')) {
          setNotificationsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-orange-400 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">権限を確認しています...</p>
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
        icon: HomeIcon,
        requiredRole: UserRole.STAFF,
        isSensitive: false,
        color: 'text-blue-600'
      },
      {
        name: 'リード管理',
        href: '/admin/leads',
        icon: UsersIcon,
        requiredRole: UserRole.STAFF,
        isSensitive: true,
        color: 'text-emerald-600'
      },
      {
        name: '物件管理',
        href: '/admin/properties',
        icon: BuildingOfficeIcon,
        requiredRole: UserRole.STAFF,
        isSensitive: true,
        color: 'text-purple-600'
      },
      {
        name: '社内申請',
        href: '/admin/internal-applications',
        icon: ClipboardDocumentListIcon,
        requiredRole: UserRole.STAFF,
        isSensitive: true,
        color: 'text-amber-600'
      },
      {
        name: 'アルバイト勤怠',
        href: '/admin/part-time-attendance',
        icon: ClockIcon,
        requiredRole: UserRole.STAFF,
        isSensitive: true,
        color: 'text-cyan-600'
      },
      {
        name: 'ユーザー管理',
        href: '/admin/users',
        icon: UserCircleIcon,
        requiredRole: UserRole.ADMIN,
        isSensitive: true,
        color: 'text-indigo-600'
      },
      {
        name: '書類管理',
        href: '/admin/documents',
        icon: DocumentTextIcon,
        requiredRole: UserRole.ADMIN,
        isSensitive: true,
        color: 'text-rose-600'
      },
      {
        name: '勤怠管理',
        href: '/admin/attendance',
        icon: ClockIcon,
        requiredRole: UserRole.ADMIN,
        isSensitive: true,
        color: 'text-teal-600'
      },
      {
        name: 'レポート',
        href: '/admin/reports',
        icon: ChartBarIcon,
        requiredRole: UserRole.ADMIN,
        isSensitive: true,
        color: 'text-orange-600'
      },
      {
        name: 'キャリアパス管理',
        href: '/admin/career-path',
        icon: ShieldCheckIcon,
        requiredRole: UserRole.ADMIN,
        isSensitive: true,
        color: 'text-violet-600'
      },
      {
        name: 'チーム成績管理',
        href: '/admin/team-performance',
        icon: TrophyIcon,
        requiredRole: UserRole.ADMIN,
        isSensitive: true,
        color: 'text-yellow-600'
      },
      {
        name: 'リフォーム職人管理',
        href: '/admin/reform-workers',
        icon: WrenchScrewdriverIcon,
        requiredRole: UserRole.ADMIN,
        isSensitive: true,
        color: 'text-stone-600'
      }
    ]

    return items.filter(item => {
      if (userRole < item.requiredRole) return false
      if (item.isSensitive && !canAccessSensitiveInfo(userRole, item.href)) return false
      return true
    })
  }

  const navigationItems = getNavigationItems()

  const getRoleInfo = () => {
    switch (userRole) {
      case UserRole.OWNER:
        return { label: 'オーナー', color: 'bg-red-500', textColor: 'text-red-700' }
      case UserRole.ADMIN:
        return { label: '管理者', color: 'bg-blue-500', textColor: 'text-blue-700' }
      default:
        return { label: 'スタッフ', color: 'bg-green-500', textColor: 'text-green-700' }
    }
  }

  const roleInfo = getRoleInfo()

  // サイドバーコンポーネント
  const Sidebar = () => (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 shadow-sm">
      {/* ロゴ・ヘッダー部分 */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-orange-600 font-bold text-lg">H</span>
          </div>
          <span className="text-white font-bold text-lg">ホームマート</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-white hover:bg-orange-400 p-1 rounded"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* ユーザー情報 */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.firstName || user?.emailAddresses[0]?.emailAddress}
            </p>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color} text-white`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
              <span className="flex-1">{item.name}</span>
              {item.isSensitive && (
                <div className={`ml-2 w-2 h-2 rounded-full ${isActive ? 'bg-orange-200' : 'bg-red-400'}`} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* フッター */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="space-y-2">
          <SignOutButton>
            <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ログアウト
            </button>
          </SignOutButton>
          <Link 
            href="/" 
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            サイトトップ
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex bg-slate-50">
      {/* モバイル用サイドバーオーバーレイ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* デスクトップ用サイドバー */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar />
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* トップヘッダー */}
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              
              <div>
                <h1 className="text-xl font-bold text-slate-900">管理画面</h1>
                <p className="text-sm text-slate-500">センチュリー21 広陵店</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* 通知アイコン */}
              <div className="relative notifications-dropdown">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* 通知ドロップダウン */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
                    <div className="p-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">最近のアクティビティ</h3>
                        <button
                          onClick={closeNotifications}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {recentActivities.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {recentActivities.map((activity) => (
                            <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                  activity.type === 'success' ? 'bg-green-500' :
                                  activity.type === 'warning' ? 'bg-yellow-500' :
                                  activity.type === 'error' ? 'bg-red-500' :
                                  'bg-blue-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-900">{activity.message}</p>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-slate-500">
                                      {activity.user && `by ${activity.user}`}
                                    </p>
                                    <p className="text-xs text-slate-400">{activity.time}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-500">
                          <BellIcon className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                          <p className="text-sm">新しいアクティビティはありません</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                      <button className="w-full text-center text-sm text-slate-600 hover:text-slate-800 font-medium">
                        すべての通知を表示
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 機密情報表示 */}
              {PAGE_PERMISSIONS.find(p => p.path === pathname)?.isSensitive && (
                <div className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  機密情報
                </div>
              )}
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
