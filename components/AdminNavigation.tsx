'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePermissions, PERMISSIONS } from '@/lib/supabase/staff-permissions'

interface NavigationItem {
  id: string
  name: string
  href: string
  icon: React.ReactNode
  permissions?: string[]
  children?: NavigationItem[]
}

export default function AdminNavigation({ userId }: { userId: string }) {
  const pathname = usePathname()
  const { permissions, role, loading } = usePermissions(userId)
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      name: 'ダッシュボード',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v14M16 5v14" />
        </svg>
      )
    },
    {
      id: 'properties',
      name: '物件管理',
      href: '/admin/properties',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      permissions: [PERMISSIONS.PROPERTY_VIEW],
      children: [
        {
          id: 'properties-list',
          name: '物件一覧',
          href: '/admin/properties-list',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
          permissions: [PERMISSIONS.PROPERTY_VIEW]
        },
        {
          id: 'properties-new',
          name: '新規登録',
          href: '/admin/properties/new',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ),
          permissions: [PERMISSIONS.PROPERTY_CREATE]
        }
      ]
    },
    {
      id: 'leads',
      name: 'リード管理',
      href: '/admin/leads',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      permissions: [PERMISSIONS.LEAD_VIEW],
      children: [
        {
          id: 'leads-list',
          name: 'リード一覧',
          href: '/admin/leads',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
          permissions: [PERMISSIONS.LEAD_VIEW]
        },
        {
          id: 'leads-new',
          name: '新規リード',
          href: '/admin/leads/new',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ),
          permissions: [PERMISSIONS.LEAD_CREATE]
        }
      ]
    },
    {
      id: 'inquiries',
      name: 'お問い合わせ',
      href: '/admin/inquiries',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      permissions: [PERMISSIONS.INQUIRY_VIEW]
    },
    {
      id: 'attendance',
      name: '勤怠管理',
      href: '/admin/part-time-attendance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      permissions: [PERMISSIONS.ATTENDANCE_VIEW],
      children: [
        {
          id: 'attendance-list',
          name: '勤怠一覧',
          href: '/admin/part-time-attendance',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
          permissions: [PERMISSIONS.ATTENDANCE_VIEW]
        },
        {
          id: 'attendance-form',
          name: '勤怠入力',
          href: '/admin/part-time-attendance/form',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
          permissions: [PERMISSIONS.ATTENDANCE_CREATE]
        },
        {
          id: 'attendance-reports',
          name: '勤怠レポート',
          href: '/admin/part-time-attendance/reports',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          permissions: [PERMISSIONS.ATTENDANCE_VIEW]
        }
      ]
    },
    {
      id: 'expenses',
      name: '経費管理',
      href: '/admin/internal-applications/forms/expense',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      permissions: [PERMISSIONS.EXPENSE_VIEW],
      children: [
        {
          id: 'expense-form',
          name: '経費申請',
          href: '/admin/internal-applications/forms/expense',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
          permissions: [PERMISSIONS.EXPENSE_CREATE]
        }
      ]
    },
    {
      id: 'reforms',
      name: 'リフォーム管理',
      href: '/admin/reform-projects',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      permissions: [PERMISSIONS.REFORM_VIEW]
    },
    {
      id: 'media',
      name: 'メディア管理',
      href: '/admin/media',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      permissions: [PERMISSIONS.MEDIA_VIEW]
    },
    {
      id: 'reports',
      name: 'レポート・分析',
      href: '/admin/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      permissions: [PERMISSIONS.REPORT_VIEW]
    }
  ]

  // 権限に基づいてメニュー項目をフィルタリング
  const filteredItems = navigationItems.filter(item => {
    if (!item.permissions || item.permissions.length === 0) {
      return true
    }
    return item.permissions.some(permission => permissions.includes(permission))
  })

  if (loading) {
    return (
      <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-lg font-bold">管理画面</h1>
        </div>
        
        <div className="text-sm text-gray-400 mb-4">
          役職: {role === 'admin' ? '管理者' : 
                 role === 'manager' ? '管理職' : 
                 role === 'staff' ? '一般社員' : 
                 role === 'part_time' ? 'パートタイム' : '不明'}
        </div>
      </div>

      <div className="px-2">
        {filteredItems.map((item) => (
          <div key={item.id}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleSection(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname.startsWith(item.href)
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      expandedSections.includes(item.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedSections.includes(item.id) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children
                      .filter(child => !child.permissions || child.permissions.some(p => permissions.includes(p)))
                      .map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                            pathname === child.href
                              ? 'bg-orange-600 text-white'
                              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          {child.icon}
                          <span>{child.name}</span>
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === item.href
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}
