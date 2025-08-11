'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Property {
  id: string
  name: string
  price: number
  property_type: string
  prefecture: string
  city: string
  status: string
  is_new: boolean
  staff_comment?: string
  created_at: string
  updated_at: string
}

export default function AllPropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      alert('物件を削除しました')
      fetchProperties()
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('削除に失敗しました')
    }
  }

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      
      fetchProperties()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const filteredProperties = properties
    .filter(property => {
      const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.prefecture.includes(searchTerm) ||
                           property.city.includes(searchTerm)
      
      if (filterType === 'all') return matchesSearch
      if (filterType === 'published') return matchesSearch && property.status === 'published'
      if (filterType === 'draft') return matchesSearch && property.status === 'draft'
      if (filterType === 'featured') return matchesSearch && property.staff_comment
      return matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'price') return b.price - a.price
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-blue-600 hover:underline">
                ← ダッシュボード
              </Link>
              <h1 className="text-2xl font-bold">全物件一覧</h1>
            </div>
            <Link
              href="/admin/properties/new"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              新規物件登録
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="物件名、地域で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="published">公開中</option>
              <option value="draft">下書き</option>
              <option value="featured">おすすめ</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="created_at">登録日順</option>
              <option value="price">価格順</option>
              <option value="name">名前順</option>
            </select>
            
            <div className="flex items-center justify-end">
              <span className="text-gray-600">
                {filteredProperties.length}件表示
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  物件名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  種別
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  価格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  所在地
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {property.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        登録日: {new Date(property.created_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{property.property_type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {property.price.toLocaleString()}万円
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {property.prefecture} {property.city}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusToggle(property.id, property.status)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          property.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {property.status === 'published' ? '公開中' : '下書き'}
                      </button>
                      {property.staff_comment && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          おすすめ
                        </span>
                      )}
                      {property.is_new && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Link
                        href={`/properties/${property.id}`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        表示
                      </Link>
                      <button
                        onClick={() => router.push(`/admin/properties/${property.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">物件が見つかりませんでした</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
