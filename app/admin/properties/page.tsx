'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Property {
  id: number
  name: string
  price: number
  address: string
  description: string
  image_url: string
  featured: boolean
  created_at: string
}

export default function PropertiesList() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // 認証チェック
  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    const expiry = localStorage.getItem('authExpiry')
    
    if (auth === 'true' && expiry && Date.now() < Number(expiry)) {
      setIsAuthenticated(true)
    } else {
      router.push('/admin')
    }
  }, [router])

  // 物件一覧を取得
  useEffect(() => {
    fetchProperties()
  }, [])

  async function fetchProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 削除処理
  async function handleDelete(id: number, name: string) {
    if (!confirm(`「${name}」を本当に削除しますか？`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // 一覧を更新
      setProperties(properties.filter(p => p.id !== id))
      alert('削除しました')
    } catch (error) {
      console.error('Error:', error)
      alert('削除に失敗しました')
    }
  }

  // ログアウト
  const logout = () => {
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('authExpiry')
    router.push('/')
  }

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">物件管理</h1>
            <div className="flex gap-4">
              <Link href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                新規登録
              </Link>
              <a href="/" className="text-blue-600 hover:underline py-2">
                サイトを見る
              </a>
              <button onClick={logout} className="text-red-600 hover:underline py-2">
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 物件一覧 */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
              物件一覧（{properties.length}件）
            </h2>

            {loading ? (
              <p>読み込み中...</p>
            ) : properties.length === 0 ? (
              <p className="text-gray-500">物件がありません</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">画像</th>
                      <th className="text-left p-2">物件名</th>
                      <th className="text-left p-2">価格</th>
                      <th className="text-left p-2">住所</th>
                      <th className="text-left p-2">登録日</th>
                      <th className="text-center p-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr key={property.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {property.image_url ? (
                            <img 
                              src={property.image_url} 
                              alt={property.name}
                              className="w-20 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-20 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                              No Image
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <div>
                            {property.name}
                            {property.featured && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                おすすめ
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          {(property.price / 10000).toLocaleString()}万円
                        </td>
                        <td className="p-2 text-sm">
                          {property.address}
                        </td>
                        <td className="p-2 text-sm">
                          {new Date(property.created_at).toLocaleDateString('ja-JP')}
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2 justify-center">
                            <Link
                              href={`/admin/properties/${property.id}/edit`}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              編集
                            </Link>
                            <button
                              onClick={() => handleDelete(property.id, property.name)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
