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
  status: string
  is_new: boolean
  staff_comment?: string
  created_at: string
  updated_at: string
}

interface DashboardStats {
  total: number
  published: number
  draft: number
  featured: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    published: 0,
    draft: 0,
    featured: 0
  })
  const [recentProperties, setRecentProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 全物件を取得
      const { data: allProperties, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (allProperties) {
        // 統計情報を計算
        const stats: DashboardStats = {
          total: allProperties.length,
          published: allProperties.filter(p => p.status === 'published').length,
          draft: allProperties.filter(p => p.status === 'draft').length,
          featured: allProperties.filter(p => p.staff_comment).length
        }
        setStats(stats)

        // 最近の5件を取得
        setRecentProperties(allProperties.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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
      fetchDashboardData()
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('削除に失敗しました')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
    return date.toLocaleDateString('ja-JP')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">管理画面</h1>
          <div className="flex gap-4">
            <Link
              href="/admin/properties/new"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              新規物件登録
            </Link>
            <Link
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              サイトを見る
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/properties-list?view=all">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総物件数</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <span className="text-blue-600 text-sm hover:underline">すべて見る →</span>
              </div>
            </div>
          </Link>

          <Link href="/admin/properties-list?view=published">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">公開中</p>
                  <p className="text-3xl font-bold text-green-600">{stats.published}</p>
                </div>
                <span className="text-blue-600 text-sm hover:underline">すべて見る →</span>
              </div>
            </div>
          </Link>

          <Link href="/admin/properties-list?view=featured">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">おすすめ物件</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.featured}</p>
                </div>
                <span className="text-blue-600 text-sm hover:underline">すべて見る →</span>
              </div>
            </div>
          </Link>

          <Link href="/admin/properties">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">物件管理</p>
                  <p className="text-lg font-bold">一覧・編集</p>
                </div>
                <span className="text-blue-600 text-sm hover:underline">管理画面へ →</span>
              </div>
            </div>
          </Link>
        </div>

        {/* 最近登録した物件 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">最近登録した物件</h2>
            <Link
              href="/admin/properties-list?view=all"
              className="text-blue-600 hover:underline text-sm"
            >
              すべて見る →
            </Link>
          </div>
          
          <div className="p-6">
            {recentProperties.length > 0 ? (
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <div key={property.id} className="flex justify-between items-center border-b pb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{property.name}</h3>
                        {property.status === 'published' && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">公開中</span>
                        )}
                        {property.status === 'draft' && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">下書き</span>
                        )}
                        {property.staff_comment && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">おすすめ</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {property.property_type} / {property.price.toLocaleString()}万円
                        <span className="ml-2 text-xs">({formatDate(property.created_at)})</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
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
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">物件がありません</p>
            )}
          </div>
        </div>

        {/* クイックリンク */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/inquiries">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold mb-2">お問い合わせ管理</h3>
              <p className="text-sm text-gray-600">お客様からのお問い合わせを確認</p>
            </div>
          </Link>
          
          <Link href="/admin/settings">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold mb-2">設定</h3>
              <p className="text-sm text-gray-600">サイトの基本設定を変更</p>
            </div>
          </Link>
          
          <Link href="/admin/analytics">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold mb-2">アクセス解析</h3>
              <p className="text-sm text-gray-600">サイトのアクセス状況を確認</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
