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
  staff_comment?: string
  created_at: string
}

function FeaturedPropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProperties()
  }, [])

  const fetchFeaturedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .not('staff_comment', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Error:', error)
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
      fetchFeaturedProperties()
    } catch (error) {
      console.error('Error:', error)
      alert('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
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
              <h1 className="text-2xl font-bold">おすすめ物件一覧</h1>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                {properties.length}件
              </span>
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
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {properties.length > 0 ? (
              <div className="space-y-4">
                {properties.map((property) => (
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
            ) : (
              <p className="text-gray-500 text-center py-8">
                おすすめ物件はありません。
                <br />
                <span className="text-sm">物件編集画面でスタッフコメントを追加すると、おすすめ物件として表示されます。</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedPropertiesPage
