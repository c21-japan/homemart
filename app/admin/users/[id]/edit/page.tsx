'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { hasPermission, type UserPermissions } from '@/lib/auth/permissions'

interface CurrentUser {
  id: string
  email: string
  name: string
  role: 'OWNER' | 'ADMIN' | 'STAFF'
  permissions: UserPermissions | null
}

interface UserForm {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'STAFF'
  password: string
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = typeof params?.id === 'string' ? params.id : ''

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [formData, setFormData] = useState<UserForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!userId) return
    void fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      const [currentRes, userRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/admin/users/${userId}`)
      ])

      if (currentRes.ok) {
        const data = await currentRes.json()
        setCurrentUser(data)
      } else {
        setCurrentUser(null)
      }

      if (userRes.ok) {
        const user = await userRes.json()
        setFormData({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          password: ''
        })
      } else {
        setError('ユーザー情報の取得に失敗しました')
      }
    } catch (err) {
      setError('ユーザー情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const canEditUsers =
    !!currentUser?.permissions && hasPermission(currentUser.permissions, 'USERS', 'EDIT')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password
        })
      })

      if (res.ok) {
        setSuccess('ユーザー情報を更新しました')
        setTimeout(() => router.push('/admin/users'), 1200)
      } else {
        const data = await res.json()
        setError(data.message || '更新に失敗しました')
      }
    } catch (err) {
      setError('更新に失敗しました')
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

  if (!currentUser || !canEditUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
          <p className="text-gray-600 mb-4">ユーザー編集の権限がありません。</p>
          <div className="text-sm text-gray-500 mb-4">
            メール: {currentUser?.email || '未ログイン'} | 権限: {currentUser?.role || '-'}
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

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">ユーザーが見つかりません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ユーザー編集</h1>
        <p className="mt-2 text-gray-600">ユーザー情報を更新します</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                ユーザーID
              </label>
              <input
                type="text"
                name="id"
                id="id"
                disabled
                value={formData.id}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                氏名
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                権限
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="OWNER">オーナー</option>
                <option value="ADMIN">管理者</option>
                <option value="STAFF">社員</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                新しいパスワード（任意）
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {saving ? '更新中...' : '更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
