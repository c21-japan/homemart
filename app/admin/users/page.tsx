'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { UserRole, PERMISSIONS, hasPermission } from '@/lib/auth/permissions'

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
}

export default function UsersPage() {
  const { user: currentUser } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 権限チェック
  if (!currentUser || !hasPermission(currentUser.publicMetadata?.role as UserRole, 'canManageUsers')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
          <p className="text-gray-600 mb-4">ユーザー管理の権限がありません。</p>
          <Link
            href="/admin"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            管理画面に戻る
          </Link>
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
          firstName: '佑企',
          lastName: '乾',
          role: UserRole.OWNER,
          department: '経営企画部',
          position: '代表取締役',
          createdAt: '2024-01-01',
          status: 'active'
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
          status: 'active'
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
          status: 'active'
        }
      ]
      
      setUsers(sampleUsers)
    } catch (error) {
      setError('ユーザー情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      // 実際の実装では、Clerkの管理APIを使用
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (error) {
      setError('権限の更新に失敗しました')
    }
  }

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      // 実際の実装では、Clerkの管理APIを使用
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ))
    } catch (error) {
      setError('ステータスの更新に失敗しました')
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
            <p className="mt-2 text-gray-600">
              社員アカウントの管理と権限設定を行います
            </p>
          </div>
          <Link
            href="/admin/users/new"
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            新規ユーザー追加
          </Link>
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">ユーザー一覧</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  部署・役職
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  権限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-orange-800">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.lastName} {user.firstName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.department}</div>
                    <div className="text-sm text-gray-500">{user.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      disabled={!hasPermission(currentUser.publicMetadata?.role as UserRole, 'canManagePermissions')}
                      className="text-sm border border-gray-300 rounded px-2 py-1 disabled:bg-gray-100"
                    >
                      <option value={UserRole.STAFF}>社員</option>
                      <option value={UserRole.ADMIN}>管理者</option>
                      {hasPermission(currentUser.publicMetadata?.role as UserRole, 'canManagePermissions') && (
                        <option value={UserRole.OWNER}>オーナー</option>
                      )}
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      {PERMISSIONS[user.role]?.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value as 'active' | 'inactive')}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="active">アクティブ</option>
                      <option value="inactive">非アクティブ</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-orange-600 hover:text-orange-900 mr-3">
                      編集
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
