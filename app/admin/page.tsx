'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteCookie } from 'cookies-next'

interface Property {
  id: string
  name: string
  price: number
  property_type: string
  status: string
  created_at: string
  staff_comment?: string
  featured?: boolean
}

interface Inquiry {
  id: string
  name: string
  email: string
  property_name?: string
  status: string
  created_at: string
}

interface ReformProject {
  id: string
  title: string
  before_image_url: string
  after_image_url: string
  description?: string
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [reformProjects, setReformProjects] = useState<ReformProject[]>([])
  const [stats, setStats] = useState({
    totalProperties: 0,
    publishedProperties: 0,
    newInquiries: 0,
    featuredProperties: 0,
    totalReformProjects: 0
  })
  const [loading, setLoading] = useState(true)

  const handleLogout = () => {
    deleteCookie('admin-auth')
    router.push('/admin/login')
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 物件データ取得
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (propertiesError) {
        console.error('Properties error:', propertiesError)
        // エラーが発生しても処理を続行
      }

      // お問い合わせデータ取得
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (inquiriesError) {
        console.error('Inquiries error:', inquiriesError)
        // エラーが発生しても処理を続行
      }

      // リフォーム施工実績データ取得
      let reformData = []
      let reformCount = 0
      try {
        const { data: reformProjects, error: reformError } = await supabase
          .from('reform_projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        if (reformError) {
          console.error('Reform projects error:', reformError)
        } else {
          reformData = reformProjects || []
        }

        // 施工実績の総数を取得
        const { count: reformTotal } = await supabase
          .from('reform_projects')
          .select('*', { count: 'exact', head: true })
        
        reformCount = reformTotal || 0
      } catch (reformError) {
        console.error('Reform projects fetch error:', reformError)
        // テーブルが存在しない場合のエラーを無視
      }

      // 統計データ取得
      let totalCount = 0
      let publishedCount = 0
      let newInquiriesCount = 0
      let featuredCount = 0

      try {
        const { count: total } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
        totalCount = total || 0

        const { count: published } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published')
        publishedCount = published || 0

        const { count: newInquiries } = await supabase
          .from('inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new')
        newInquiriesCount = newInquiries || 0

        const { count: featured } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('featured', true)
        featuredCount = featured || 0
      } catch (statsError) {
        console.error('Stats fetch error:', statsError)
        // 統計データの取得エラーを無視
      }

      setProperties(propertiesData || [])
      setInquiries(inquiriesData || [])
      setReformProjects(reformData)
      setStats({
        totalProperties: totalCount,
        publishedProperties: publishedCount,
        newInquiries: newInquiriesCount,
        featuredProperties: featuredCount,
        totalReformProjects: reformCount
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // エラーが発生しても空のデータで初期化
      setProperties([])
      setInquiries([])
      setReformProjects([])
      setStats({
        totalProperties: 0,
        publishedProperties: 0,
        newInquiries: 0,
        featuredProperties: 0,
        totalReformProjects: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('この物件を削除してもよろしいですか？')) return

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

  const handleDeleteReformProject = async (id: string) => {
    if (!confirm('この施工実績を削除してもよろしいですか？')) return

    try {
      const { error } = await supabase
        .from('reform_projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('施工実績を削除しました')
      fetchDashboardData()
    } catch (error) {
      console.error('Error deleting reform project:', error)
      alert('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">管理画面ダッシュボード</h1>
              <p className="text-gray-600 mt-2">センチュリー21 ホームマート</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/properties"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold"
              >
                新規物件登録
              </Link>
              <Link
                href="/"
                target="_blank"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                サイトを確認
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Link href="/admin/properties-list?view=all" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総物件数</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalProperties}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/admin/properties-list?view=published" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">公開中</p>
                <p className="text-3xl font-bold text-green-600">{stats.publishedProperties}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/admin/inquiries?status=new" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">新着問い合わせ</p>
                <p className="text-3xl font-bold text-orange-600">{stats.newInquiries}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/admin/properties-list?view=featured" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">おすすめ物件</p>
                <p className="text-3xl font-bold text-purple-600">{stats.featuredProperties}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/admin/reform-projects" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">施工実績</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.totalReformProjects}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* クイックアクセス - 画像管理と社内申請を追加 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
          <Link href="/admin/properties" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">新規物件登録</h3>
                <p className="text-sm text-gray-600">物件を新規登録する</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/properties-list?view=all" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">物件管理</h3>
                <p className="text-sm text-gray-600">登録済み物件を管理</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/inquiries" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">お問い合わせ管理</h3>
                <p className="text-sm text-gray-600">お問い合わせを確認</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/media" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">画像管理</h3>
                <p className="text-sm text-gray-600">サイト画像を管理</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/reform-projects" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">施工実績管理</h3>
                <p className="text-sm text-gray-600">リフォーム施工実績を管理</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/internal-applications" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-teal-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">社内申請管理</h3>
                <p className="text-sm text-gray-600">従業員の申請を管理</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 最近の物件 */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">最近登録した物件</h2>
                <Link href="/admin/properties-list?view=all" className="text-blue-600 hover:underline text-sm">
                  すべて見る →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {properties.length > 0 ? (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="flex justify-between items-center border-b pb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{property.name}</h3>
                          {property.featured && (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">おすすめ</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {property.property_type} / {property.price.toLocaleString()}万円
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
                          onClick={() => handleDeleteProperty(property.id)}
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

          {/* 最近の施工実績 */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">最近の施工実績</h2>
                <Link href="/admin/reform-projects" className="text-indigo-600 hover:underline text-sm">
                  すべて見る →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {reformProjects.length > 0 ? (
                <div className="space-y-4">
                  {reformProjects.map((project) => (
                    <div key={project.id} className="flex justify-between items-center border-b pb-3">
                      <div className="flex-1">
                        <h3 className="font-medium">{project.title}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          {project.description && project.description.length > 30 
                            ? `${project.description.substring(0, 30)}...` 
                            : project.description}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/reform-projects/${project.id}/edit`)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteReformProject(project.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">施工実績がありません</p>
              )}
            </div>
          </div>

          {/* 最近のお問い合わせ */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">最近のお問い合わせ</h2>
                <Link href="/admin/inquiries" className="text-blue-600 hover:underline text-sm">
                  すべて見る →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {inquiries.length > 0 ? (
                <div className="space-y-4">
                  {inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="border-b pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{inquiry.name}</h3>
                          <p className="text-sm text-gray-600">{inquiry.email}</p>
                          {inquiry.property_name && (
                            <p className="text-sm text-blue-600 mt-1">物件: {inquiry.property_name}</p>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          inquiry.status === 'new' 
                            ? 'bg-orange-100 text-orange-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {inquiry.status === 'new' ? '新着' : '対応済み'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">お問い合わせがありません</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// Deploy trigger
