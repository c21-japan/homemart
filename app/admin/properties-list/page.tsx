'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

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
  featured?: boolean
  created_at: string
  updated_at: string
}

function PropertiesListContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewParam = searchParams?.get('view') || 'all'
  
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')

  useEffect(() => {
    fetchProperties()
  }, [viewParam])

  const fetchProperties = async () => {
    try {
      let query = supabase.from('properties').select('*')
      
      // URLパラメータに基づいてフィルタリング
      if (viewParam === 'published') {
        query = query.eq('status', 'published')
      } else if (viewParam === 'featured') {
        // featuredフィールドがtrueの物件、またはstaff_commentがある物件を取得
        query = query.or('featured.eq.true,staff_comment.not.is.null')
      }
      // viewParam === 'all' の場合はフィルタなし
      
      const { data, error } = await query.order('created_at', { ascending: false })

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

  const handleFeaturedToggle = async (id: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ featured: !currentFeatured })
        .eq('id', id)

      if (error) throw error
      
      alert(`おすすめ物件${!currentFeatured ? 'に設定' : 'から解除'}しました`)
      fetchProperties()
    } catch (error) {
      console.error('Error updating featured status:', error)
    }
  }

  const getFilteredProperties = () => {
    let filtered = [...properties]

    if (searchTerm) {
      filtered = filtered.filter(property => 
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.prefecture.includes(searchTerm) ||
        property.city.includes(searchTerm)
      )
    }

    filtered.sort((a, b) => {
      if (sortBy === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'price') return b.price - a.price
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

    return filtered
  }

  const filteredProperties = getFilteredProperties()

  const getPageTitle = () => {
    switch (viewParam) {
      case 'published': return '公開中物件一覧'
      case 'featured': return 'おすすめ物件一覧'
      default: return '全物件一覧'
    }
  }

  const getBadgeColor = () => {
    switch (viewParam) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'featured': return 'bg-purple-100 text-purple-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" style={{ paddingTop: 'var(--header-height, 0px)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ paddingTop: 'var(--header-height, 0px)' }}>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-blue-600 hover:underline">
                ← ダッシュボード
              </Link>
              <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
              <span className={`px-3 py-1 rounded-full text-sm ${getBadgeColor()}`}>
                {filteredProperties.length}件
              </span>
            </div>
            <Link
              href="/admin/properties"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              新規物件登録
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex -mb-px">
              <Link
                href="/admin/properties-list?view=all"
                className={`py-2 px-6 border-b-2 font-medium text-sm ${
                  viewParam === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                全物件
              </Link>
              <Link
                href="/admin/properties-list?view=published"
                className={`py-2 px-6 border-b-2 font-medium text-sm ${
                  viewParam === 'published'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                公開中
              </Link>
              <Link
                href="/admin/properties-list?view=featured"
                className={`py-2 px-6 border-b-2 font-medium text-sm ${
                  viewParam === 'featured'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                おすすめ
              </Link>
            </nav>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="物件名、地域で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              
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
                <button
                  onClick={fetchProperties}
                  className="text-blue-600 hover:text-blue-800"
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {viewParam === 'featured' && filteredProperties.length > 0 ? (
            <div className="p-6">
              <div className="space-y-4">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{property.name}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          {property.property_type} / {property.price.toLocaleString()}万円
                          <span className="ml-2">{property.prefecture} {property.city}</span>
                        </div>
                        {property.staff_comment && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded">
                            <p className="text-sm text-yellow-800">
                              <span className="font-medium">スタッフコメント：</span>
                              {property.staff_comment}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link
                          href={`/properties/${property.id}`}
                          className="text-gray-600 hover:bg-gray-50 p-2 rounded"
                        >
                          表示
                        </Link>
                        <button
                          onClick={() => router.push(`/admin/properties/${property.id}/edit`)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleFeaturedToggle(property.id, property.featured || false)}
                          className="text-purple-600 hover:bg-purple-50 p-2 rounded"
                        >
                          {property.featured ? 'おすすめ解除' : 'おすすめ設定'}
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
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
                        {(property.featured || property.staff_comment) && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
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
          )}
          
          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {viewParam === 'featured' 
                  ? 'おすすめ物件はありません。物件編集画面でスタッフコメントを追加するか、おすすめ設定をしてください。'
                  : '物件が見つかりませんでした'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PropertiesListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" style={{ paddingTop: 'var(--header-height, 0px)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PropertiesListContent />
    </Suspense>
  )
}
