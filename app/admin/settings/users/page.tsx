'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'staff'
  permissions: string[]
  status: 'pending' | 'active' | 'suspended'
  department?: string
  created_at: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  // 権限チェック
  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (role !== 'owner' && role !== 'admin') {
      router.push('/admin')
    }
  }, [router])

  // ダミーデータ（実際はSupabaseから取得）
  useEffect(() => {
    setUsers([
      {
        id: '1',
        email: 'y-inui@century21.group',
        name: '乾佑企',
        role: 'owner',
        permissions: ['all'],
        status: 'active',
        created_at: '2024-01-01'
      },
      {
        id: '2',
        email: 'm-yasuda@century21.group',
        name: '安田実加',
        role: 'admin',
        permissions: ['leads', 'customers', 'reports'],
        status: 'active',
        created_at: '2024-01-01'
      },
      {
        id: '3',
        email: 'info@century21.group',
        name: '山尾妃奈',
        role: 'staff',
        permissions: ['leads'],
        status: 'active',
        created_at: '2024-01-15'
      }
    ])

    setPendingUsers([
      {
        id: '4',
        email: 'new-staff@century21.group',
        name: '新規スタッフ',
        role: 'staff',
        permissions: [],
        status: 'pending',
        department: '営業部',
        created_at: '2024-08-14'
      }
    ])
  }, [])

  const handleApprove = async (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleReject = async (userId: string) => {
    if (confirm('この申請を却下しますか？')) {
      // API呼び出し
      setPendingUsers(pendingUsers.filter(u => u.id !== userId))
      alert('申請を却下しました')
    }
  }

  const handleSavePermissions = async () => {
    if (!selectedUser) return

    // API呼び出し
    alert(`${selectedUser.name}さんの権限を更新しました`)
    setIsModalOpen(false)
    
    // 承認済みリストに移動
    if (selectedUser.status === 'pending') {
      setPendingUsers(pendingUsers.filter(u => u.id !== selectedUser.id))
      setUsers([...users, {...selectedUser, status: 'active'}])
    }
  }

  const handlePermissionToggle = (permission: string) => {
    if (!selectedUser) return
    
    const newPermissions = selectedUser.permissions.includes(permission)
      ? selectedUser.permissions.filter(p => p !== permission)
      : [...selectedUser.permissions, permission]
    
    setSelectedUser({...selectedUser, permissions: newPermissions})
  }

  const handleRoleChange = (role: 'admin' | 'staff') => {
    if (!selectedUser) return
    setSelectedUser({...selectedUser, role})
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ユーザー管理</h1>
        <p className="text-gray-600">社員のアカウントと権限を管理</p>
      </div>

      {/* 承認待ちユーザー */}
      {pendingUsers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">
            承認待ち ({pendingUsers.length}件)
          </h2>
          <div className="bg-orange-50 rounded-lg p-4 space-y-3">
            {pendingUsers.map(user => (
              <div key={user.id} className="bg-white rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.department && (
                    <p className="text-sm text-gray-500">部署: {user.department}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(user)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    承認
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    却下
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* アクティブユーザー一覧 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">アクティブユーザー</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">メール</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">役割</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">権限</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'owner' ? 'オーナー' :
                       user.role === 'admin' ? '管理者' : 'スタッフ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user.permissions.includes('all') ? '全権限' :
                     user.permissions.join(', ')}
                  </td>
                  <td className="px-6 py-4">
                    {user.role !== 'owner' && (
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setIsModalOpen(true)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        編集
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 権限編集モーダル */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              権限設定: {selectedUser.name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                役割
              </label>
              <select
                value={selectedUser.role}
                onChange={(e) => handleRoleChange(e.target.value as 'admin' | 'staff')}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={selectedUser.role === 'owner'}
              >
                <option value="staff">スタッフ</option>
                <option value="admin">管理者</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                アクセス権限
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUser.permissions.includes('leads')}
                    onChange={() => handlePermissionToggle('leads')}
                    className="mr-2"
                  />
                  リード管理
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUser.permissions.includes('customers')}
                    onChange={() => handlePermissionToggle('customers')}
                    className="mr-2"
                  />
                  顧客管理
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUser.permissions.includes('reports')}
                    onChange={() => handlePermissionToggle('reports')}
                    className="mr-2"
                  />
                  レポート
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
