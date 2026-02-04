'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  hasPermission,
  canEditPermissions,
  type Role,
  type UserPermissions
} from '@/lib/auth/permissions'

interface User {
  id: string
  email: string
  name: string
  role: Role
  created_at: string
  permissions: UserPermissions
}

interface CurrentUser {
  id: string
  email: string
  name: string
  role: Role
  permissions: UserPermissions | null
}

const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'オーナー',
  ADMIN: '管理者',
  STAFF: '社員'
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [currentRes, usersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/users')
      ])

      if (currentRes.ok) {
        const currentData = await currentRes.json()
        setCurrentUser(currentData)
      } else {
        setCurrentUser(null)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      } else {
        setError('ユーザー情報の取得に失敗しました')
      }
    } catch (err) {
      setError('ユーザー情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const canViewUsers =
    !!currentUser?.permissions && hasPermission(currentUser.permissions, 'USERS', 'VIEW')

  const canCreateUsers =
    !!currentUser?.permissions && hasPermission(currentUser.permissions, 'USERS', 'CREATE')

  const getPermissionSummary = (permissions: UserPermissions) => {
    const totalFeatures = Object.keys(permissions).length
    const totalPermissions = Object.values(permissions).reduce(
      (sum, perms) => sum + (perms?.length || 0),
      0
    )

    return `${totalFeatures}機能 / ${totalPermissions}権限`
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

  if (!currentUser || !canViewUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
          <p className="text-gray-600 mb-4">ユーザー管理の権限がありません。</p>
          <div className="text-sm text-gray-500 mb-4">
            メール: {currentUser?.email || '未ログイン'} | 権限: {currentUser?.role || '-'}
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
            <p className="mt-2 text-gray-600">社員アカウントと権限の管理を行います</p>
            <div className="text-sm text-gray-500 mt-1">
              現在の権限: {ROLE_LABELS[currentUser.role]}
            </div>
          </div>
          {canCreateUsers && (
            <Link
              href="/admin/users/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
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
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
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
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{user.email}</span>
                      <span>•</span>
                      <span>登録日: {user.created_at}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      権限: {getPermissionSummary(user.permissions || {})}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/admin/users/${user.id}/edit`}
                    className="text-orange-600 hover:underline text-sm"
                  >
                    編集
                  </Link>
                  {canEditPermissions(currentUser.role, user.role) && (
                    <Link
                      href={`/admin/users/${user.id}/permissions`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      権限設定
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
