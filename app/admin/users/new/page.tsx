'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole, PERMISSIONS, hasPermission, OWNER_EMAILS, ADMIN_EMAILS } from '@/lib/auth/permissions'
import { useSession } from 'next-auth/react'

export default function NewUserPage() {
  const { user: currentUser } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.STAFF,
    department: '',
    position: ''
  })
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // ここでClerkのユーザー作成APIを呼び出す
      // 実際の実装では、Clerkの管理APIを使用
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess('ユーザーが正常に作成されました')
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          role: UserRole.STAFF,
          department: '',
          position: ''
        })
        setTimeout(() => {
          router.push('/admin/users')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'ユーザー作成に失敗しました')
      }
    } catch (error) {
      setError('ユーザー作成中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">新規ユーザー登録</h1>
        <p className="mt-2 text-gray-600">
          新しい社員アカウントを作成し、適切な権限を設定します
        </p>
        <div className="text-sm text-gray-500 mt-1">
          現在の権限: {currentUserRole} - {PERMISSIONS[currentUserRole]?.name}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">ユーザー情報</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                名前
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="太郎"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                姓
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="田中"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="tanaka@century21.group"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                権限レベル
              </label>
              <select
                name="role"
                id="role"
                required
                value={formData.role}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                <option value={UserRole.STAFF}>社員</option>
                <option value={UserRole.ADMIN}>管理者</option>
                {hasPermission(currentUserRole, 'canManagePermissions') && (
                  <option value={UserRole.OWNER}>オーナー</option>
                )}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {PERMISSIONS[formData.role]?.description}
              </p>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                部署
              </label>
              <input
                type="text"
                name="department"
                id="department"
                value={formData.department}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="営業部"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                役職
              </label>
              <input
                type="text"
                name="position"
                id="position"
                value={formData.position}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="主任"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '作成中...' : 'ユーザー作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
