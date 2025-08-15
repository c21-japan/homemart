'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { 
  UserRole, 
  PERMISSIONS, 
  hasPermission, 
  OWNER_EMAILS, 
  ADMIN_EMAILS,
  PAGE_PERMISSIONS,
  PermissionType
} from '@/lib/auth/permissions'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  department: string
  position: string
  createdAt: string
  status: 'active' | 'inactive'
  pagePermissions: {
    [pagePath: string]: PermissionType[]
  }
}

export default function UsersPage() {
  const { user: currentUser } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // メールアドレスベースの権限チェック
  const currentUserEmail = currentUser?.emailAddresses[0]?.emailAddress
  let currentUserRole: UserRole = UserRole.STAFF
  
  if (currentUserEmail) {
    if (OWNER_EMAILS.includes(currentUserEmail)) {
      currentUserRole = UserRole.OWNER
    } else if (ADMIN_EMAILS.includes(currentUserEmail)) {
      currentUserRole = UserRole.ADMIN
    }
  }

  // 権限チェック
  if (!currentUser || !hasPermission(currentUserRole, 'canManageUsers')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
          <p className="text-gray-600 mb-4">ユーザー管理の権限がありません。</p>
          <div className="text-sm text-gray-500 mb-4">
            メール: {currentUserEmail} | 権限: {currentUserRole}
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            管理画面に戻る
          </button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // 実際の実装では、Clerkの管理APIを使用
      // ここではサンプルデータを使用
      const sampleUsers: User[] = [
        {
          id: '1',
          email: 'y-inui@century21.group',
          firstName: '勇',
          lastName: '乾',
          role: UserRole.OWNER,
          department: '代表取締役',
          position: '代表取締役',
          createdAt: '2024-01-01',
          status: 'active',
          pagePermissions: {
            '/admin': [PermissionType.VIEW],
            '/admin/leads': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT, PermissionType.DELETE],
            '/admin/properties': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT, PermissionType.DELETE],
            '/admin/internal-applications': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT, PermissionType.APPROVE],
            '/admin/part-time-attendance': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
            '/admin/users': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT, PermissionType.DELETE],
            '/admin/documents': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT, PermissionType.DELETE],
            '/admin/attendance': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT, PermissionType.APPROVE],
            '/admin/reports': [PermissionType.VIEW, PermissionType.EXPORT],
            '/admin/career-path': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
            '/admin/team-performance': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
            '/admin/reform-workers': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT]
          }
        },
        {
          id: '2',
          email: 'm-yasuda@century21.group',
          firstName: '実加',
          lastName: '安田',
          role: UserRole.ADMIN,
          department: '営業部',
          position: '部長',
          createdAt: '2024-01-15',
          status: 'active',
          pagePermissions: {
            '/admin': [PermissionType.VIEW],
            '/admin/leads': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
            '/admin/properties': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
            '/admin/internal-applications': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT, PermissionType.APPROVE],
            '/admin/part-time-attendance': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
            '/admin/users': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
            '/admin/documents': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
            '/admin/attendance': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT, PermissionType.APPROVE],
            '/admin/reports': [PermissionType.VIEW, PermissionType.EXPORT],
            '/admin/career-path': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
            '/admin/team-performance': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
            '/admin/reform-workers': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT]
          }
        },
        {
          id: '3',
          email: 'info@century21.group',
          firstName: '妃奈',
          lastName: '山尾',
          role: UserRole.STAFF,
          department: '営業部',
          position: '主任',
          createdAt: '2024-02-01',
          status: 'active',
          pagePermissions: {
            '/admin': [PermissionType.VIEW],
            '/admin/leads': [PermissionType.VIEW, PermissionType.CREATE],
            '/admin/properties': [PermissionType.VIEW],
            '/admin/internal-applications': [PermissionType.VIEW, PermissionType.CREATE],
            '/admin/part-time-attendance': [PermissionType.VIEW]
          }
        },
        {
          id: '4',
          email: 't-toyoda@century21.group',
          firstName: '豊田',
          lastName: '豊田',
          role: UserRole.ADMIN,
          department: '管理部',
          position: '課長',
          createdAt: '2024-01-20',
          status: 'active',
          pagePermissions: {
            '/admin': [PermissionType.VIEW],
            '/admin/leads': [PermissionType.VIEW],
            '/admin/properties': [PermissionType.VIEW],
            '/admin/internal-applications': [PermissionType.VIEW, PermissionType.APPROVE],
            '/admin/part-time-attendance': [PermissionType.VIEW],
            '/admin/users': [PermissionType.VIEW],
            '/admin/documents': [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
            '/admin/attendance': [PermissionType.VIEW, PermissionType.APPROVE],
            '/admin/reports': [PermissionType.VIEW, PermissionType.EXPORT]
          }
        }
      ]
      
      setUsers(sampleUsers)
    } catch (error) {
      setError('ユーザー情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.OWNER:
        return 'bg-purple-100 text-purple-800'
      case UserRole.ADMIN:
        return 'bg-blue-100 text-blue-800'
      case UserRole.STAFF:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const getPermissionSummary = (pagePermissions: { [pagePath: string]: PermissionType[] }) => {
    const totalPages = Object.keys(pagePermissions).length
    const totalPermissions = Object.values(pagePermissions).reduce((sum, perms) => sum + perms.length, 0)
    
    return `${totalPages}ページ / ${totalPermissions}権限`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
            <p className="mt-2 text-gray-600">
              社員アカウントと権限の管理を行います
            </p>
            <div className="text-sm text-gray-500 mt-1">
              現在の権限: {currentUserRole} - {PERMISSIONS[currentUserRole]?.name}
            </div>
          </div>
          {hasPermission(currentUserRole, 'canManageUsers') && (
            <Link
              href="/admin/users/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新規ユーザー追加
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-orange-600 font-medium text-sm">
                        {user.lastName.charAt(0)}{user.firstName.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.lastName} {user.firstName}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {PERMISSIONS[user.role]?.name}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                        {user.status === 'active' ? 'アクティブ' : '非アクティブ'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{user.email}</span>
                      <span>•</span>
                      <span>{user.department} / {user.position}</span>
                      <span>•</span>
                      <span>登録日: {user.createdAt}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      権限: {getPermissionSummary(user.pagePermissions)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/users/${user.id}/edit`}
                    className="text-orange-600 hover:text-orange-900 mr-3 px-3 py-1 text-sm font-medium border border-orange-300 rounded-md hover:bg-orange-50 transition-colors"
                  >
                    編集
                  </Link>
                  {hasPermission(currentUserRole, 'canManageUsers') && user.id !== currentUser?.id && (
                    <button
                      onClick={() => {
                        // ユーザーの有効/無効切り替え処理
                        console.log('ユーザー状態切り替え:', user.id)
                      }}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        user.status === 'active'
                          ? 'text-red-600 hover:text-red-900 border border-red-300 hover:bg-red-50'
                          : 'text-green-600 hover:text-green-900 border border-green-300 hover:bg-green-50'
                      }`}
                    >
                      {user.status === 'active' ? '無効化' : '有効化'}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">権限管理について</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• <strong>編集ボタン</strong>をクリックすると、各スタッフの詳細な権限を設定できます</p>
              <p>• <strong>機密情報</strong>（リード情報、物件情報など）へのアクセスは、権限レベルに応じて制限されます</p>
              <p>• <strong>アルバイト</strong>でも、必要最小限の権限のみ付与し、機密情報へのアクセスを制限できます</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
