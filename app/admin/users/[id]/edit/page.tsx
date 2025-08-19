'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { 
  UserRole, 
  PERMISSIONS, 
  hasPermission, 
  OWNER_EMAILS, 
  ADMIN_EMAILS,
  PAGE_PERMISSIONS,
  PermissionType,
  canPerformAction
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

export default function EditUserPage() {
  const { user: currentUser } = useUser()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  useEffect(() => {
    // 権限チェック
    if (!currentUser || !hasPermission(currentUserRole, 'canManageUsers')) {
      return
    }
    
    fetchUser()
  }, [userId, currentUser, currentUserRole])

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
            onClick={() => router.back()}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  const fetchUser = async () => {
    try {
      // 実際の実装では、Clerkの管理APIを使用
      // ここではサンプルデータを使用
      const sampleUser: User = {
        id: userId,
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
      }
      
      setUser(sampleUser)
    } catch (error) {
      setError('ユーザー情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (newRole: UserRole) => {
    if (!user) return
    
    setUser(prev => prev ? {
      ...prev,
      role: newRole,
      // 権限レベルが下がった場合、ページ権限を調整
      pagePermissions: adjustPagePermissions(newRole, prev.pagePermissions)
    } : null)
  }

  const handlePagePermissionChange = (pagePath: string, permission: PermissionType, enabled: boolean) => {
    if (!user) return
    
    setUser(prev => {
      if (!prev) return null
      
      const currentPermissions = prev.pagePermissions[pagePath] || []
      let newPermissions: PermissionType[]
      
      if (enabled) {
        newPermissions = [...currentPermissions, permission]
      } else {
        newPermissions = currentPermissions.filter(p => p !== permission)
      }
      
      return {
        ...prev,
        pagePermissions: {
          ...prev.pagePermissions,
          [pagePath]: newPermissions
        }
      }
    })
  }

  const adjustPagePermissions = (newRole: UserRole, currentPermissions: { [pagePath: string]: PermissionType[] }) => {
    const adjustedPermissions: { [pagePath: string]: PermissionType[] } = {}
    
    PAGE_PERMISSIONS.forEach(page => {
      if (newRole >= page.requiredRole) {
        // 新しい権限レベルでアクセス可能なページ
        const currentPagePermissions = currentPermissions[page.path] || []
        // 現在の権限と新しい権限の共通部分を保持
        adjustedPermissions[page.path] = currentPagePermissions.filter(p => 
          page.permissions.includes(p)
        )
      }
    })
    
    return adjustedPermissions
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // 実際の実装では、Clerkの管理APIを使用
      console.log('更新するユーザー情報:', user)
      
      setSuccess('ユーザー情報が正常に更新されました')
      setTimeout(() => {
        router.push('/admin/users')
      }, 2000)
    } catch (error) {
      setError('ユーザー情報の更新に失敗しました')
    } finally {
      setSaving(false)
    }
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">ユーザーが見つかりません</h1>
          <button
            onClick={() => router.back()}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ユーザー権限編集</h1>
        <p className="mt-2 text-gray-600">
          {user.lastName} {user.firstName}さんの詳細な権限を設定します
        </p>
        <div className="text-sm text-gray-500 mt-1">
          現在の権限: {currentUserRole} - {PERMISSIONS[currentUserRole]?.name}
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

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本情報 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">基本情報</h2>
          </div>
          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">名前</label>
                <div className="mt-1 text-sm text-gray-900">
                  {user.lastName} {user.firstName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <div className="mt-1 text-sm text-gray-900">{user.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">部署</label>
                <div className="mt-1 text-sm text-gray-900">{user.department}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">役職</label>
                <div className="mt-1 text-sm text-gray-900">{user.position}</div>
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  権限レベル
                </label>
                <select
                  id="role"
                  name="role"
                  value={user.role}
                  onChange={(e) => handleRoleChange(Number(e.target.value) as UserRole)}
                  disabled={!hasPermission(currentUserRole, 'canManagePermissions')}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                >
                  <option value={UserRole.STAFF}>社員</option>
                  <option value={UserRole.ADMIN}>管理者</option>
                  {hasPermission(currentUserRole, 'canManagePermissions') && (
                    <option value={UserRole.OWNER}>オーナー</option>
                  )}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {PERMISSIONS[user.role]?.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ページ権限設定 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">ページ権限設定</h2>
            <p className="text-sm text-gray-500 mt-1">
              各ページでの操作権限を細かく設定できます
            </p>
          </div>
          <div className="px-6 py-6">
            <div className="space-y-6">
              {PAGE_PERMISSIONS
                .filter(page => user.role >= page.requiredRole)
                .map((page) => (
                  <div key={page.path} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{page.name}</h3>
                        <p className="text-sm text-gray-500">{page.description}</p>
                        {page.isSensitive && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                            機密情報
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        必要権限: {PERMISSIONS[page.requiredRole]?.name}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                      {page.permissions.map((permission) => {
                        const isEnabled = user.pagePermissions[page.path]?.includes(permission) || false
                        const permissionLabel = {
                          [PermissionType.VIEW]: '閲覧',
                          [PermissionType.CREATE]: '作成',
                          [PermissionType.EDIT]: '編集',
                          [PermissionType.DELETE]: '削除',
                          [PermissionType.APPROVE]: '承認',
                          [PermissionType.EXPORT]: '出力'
                        }[permission]
                        
                        return (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => handlePagePermissionChange(page.path, permission, e.target.checked)}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{permissionLabel}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : '権限を保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
