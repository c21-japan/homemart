'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  PERMISSION_TYPES,
  type Feature,
  type PermissionType,
  type UserPermissions
} from '@/lib/auth/permissions'
import PermissionMatrix from '@/components/admin/PermissionMatrix'

interface UserData {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'STAFF'
  permissions: UserPermissions
}

interface CurrentUser {
  id: string
  email: string
  name: string
  role: 'OWNER' | 'ADMIN' | 'STAFF'
  permissions: UserPermissions | null
}

export default function PermissionsEditPage() {
  const params = useParams()
  const router = useRouter()
  const userId = typeof params?.id === 'string' ? params.id : ''

  const [user, setUser] = useState<UserData | null>(null)
  const [permissions, setPermissions] = useState<UserPermissions>({})
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!userId) return
    fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      const userRes = await fetch(`/api/admin/users/${userId}`)
      const userData = await userRes.json()
      setUser(userData)
      setPermissions(userData.permissions || {})

      const currentRes = await fetch('/api/auth/me')
      if (currentRes.ok) {
        const currentData = await currentRes.json()
        setCurrentUser(currentData)
      } else {
        setCurrentUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePermissionChange = (
    feature: Feature,
    permissionType: PermissionType,
    checked: boolean
  ) => {
    setPermissions((prev) => {
      const current = prev[feature] || []
      if (checked) {
        return { ...prev, [feature]: [...current, permissionType] }
      }
      return { ...prev, [feature]: current.filter((p) => p !== permissionType) }
    })
  }

  const handleSelectAll = (feature: Feature) => {
    const allPermissions = Object.keys(PERMISSION_TYPES) as PermissionType[]
    setPermissions((prev) => ({ ...prev, [feature]: allPermissions }))
  }

  const handleClearAll = (feature: Feature) => {
    setPermissions((prev) => ({ ...prev, [feature]: [] }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions })
      })

      if (response.ok) {
        setMessage('権限を保存しました')
      } else {
        const data = await response.json()
        setMessage(data.message || '保存に失敗しました')
      }
    } catch (error) {
      setMessage('エラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  const canEdit = () => {
    if (!currentUser || !user) return false
    if (currentUser.role === 'OWNER') return true
    if (currentUser.role === 'ADMIN' && user.role === 'STAFF') return true
    return false
  }

  if (isLoading) {
    return <div className="p-8">読み込み中...</div>
  }

  if (!user) {
    return <div className="p-8">ユーザーが見つかりません</div>
  }

  if (!canEdit()) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded">
          このユーザーの権限を編集する権限がありません
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-blue-600 hover:underline mb-4">
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold">権限設定</h1>
        <p className="text-gray-600 mt-1">
          {user.name}（{user.email}）- {user.role}
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded ${
            message.includes('失敗') || message.includes('エラー')
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-green-50 text-green-600 border border-green-200'
          }`}
        >
          {message}
        </div>
      )}

      <PermissionMatrix
        permissions={permissions}
        onChange={handlePermissionChange}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
        disabled={isSaving}
      />

      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? '保存中...' : '権限を保存'}
        </button>
      </div>
    </div>
  )
}
