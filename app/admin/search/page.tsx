'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface SearchResult {
  type: 'property' | 'inquiry' | 'lead' | 'reform_project'
  id: string
  title: string
  description: string
  status?: string
  created_at: string
  url: string
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams?.get('q') || ''
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    properties: 0,
    inquiries: 0,
    leads: 0,
    reformProjects: 0
  })

  const handleLogout = async () => {
    // ログアウト処理を削除 - トップページへ移動
    router.push('/');
  }

  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query])

  const performSearch = async (searchTerm: string) => {
    setLoading(true)
    const allResults: SearchResult[] = []

    try {
      // 物件検索
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, property_type, status, created_at, staff_comment')
        .or(`name.ilike.%${searchTerm}%,property_type.ilike.%${searchTerm}%,staff_comment.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (!propertiesError && properties) {
        properties.forEach(property => {
          allResults.push({
            type: 'property',
            id: property.id,
            title: property.name,
            description: `${property.property_type} - ${property.status}`,
            status: property.status,
            created_at: property.created_at,
            url: `/admin/properties/${property.id}/edit`
          })
        })
      }

      // お問い合わせ検索
      const { data: inquiries, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('id, name, email, property_name, status, created_at')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,property_name.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (!inquiriesError && inquiries) {
        inquiries.forEach(inquiry => {
          allResults.push({
            type: 'inquiry',
            id: inquiry.id,
            title: inquiry.name,
            description: `${inquiry.email} - ${inquiry.property_name || '物件未指定'}`,
            status: inquiry.status,
            created_at: inquiry.created_at,
            url: `/admin/inquiries`
          })
        })
      }

      // リード検索
      try {
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('id, name, email, phone, status, created_at, property_name')
          .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,property_name.ilike.%${searchTerm}%`)
          .order('created_at', { ascending: false })

        if (!leadsError && leads) {
          leads.forEach(lead => {
            allResults.push({
              type: 'lead',
              id: lead.id,
              title: lead.name,
              description: `${lead.email} - ${lead.phone || '電話番号なし'} - ${lead.property_name || '物件未指定'}`,
              status: lead.status,
              created_at: lead.created_at,
              url: `/admin/leads/${lead.id}`
            })
          })
        }
      } catch (error) {
        console.error('リード検索エラー:', error)
      }

      // リフォーム案件検索
      try {
        const { data: reformProjects, error: reformError } = await supabase
          .from('reform_projects')
          .select('id, project_name, client_name, status, created_at, description')
          .or(`project_name.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .order('created_at', { ascending: false })

        if (!reformError && reformProjects) {
          reformProjects.forEach(project => {
            allResults.push({
              type: 'reform_project',
              id: project.id,
              title: project.project_name,
              description: `${project.client_name} - ${project.description || '説明なし'}`,
              status: project.status,
              created_at: project.created_at,
              url: `/admin/reform-projects`
            })
          })
        }
      } catch (error) {
        console.error('リフォーム案件検索エラー:', error)
      }

      // 統計を更新
      setStats({
        properties: allResults.filter(r => r.type === 'property').length,
        inquiries: allResults.filter(r => r.type === 'inquiry').length,
        leads: allResults.filter(r => r.type === 'lead').length,
        reformProjects: allResults.filter(r => r.type === 'reform_project').length
      })

      setResults(allResults)
    } catch (error) {
      console.error('検索エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'property':
        return '🏠'
      case 'inquiry':
        return '📧'
      case 'lead':
        return '👤'
      case 'reform_project':
        return '🔨'
      default:
        return '📄'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'property':
        return '物件'
      case 'inquiry':
        return 'お問い合わせ'
      case 'lead':
        return 'リード'
      case 'reform_project':
        return 'リフォーム案件'
      default:
        return 'その他'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">検索結果</h1>
              {query && (
                <span className="ml-4 text-sm text-gray-500">
                  「{query}」の検索結果
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                ダッシュボード
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 検索フォーム */}
          <div className="mb-8">
            <form onSubmit={(e) => { e.preventDefault(); performSearch(query); }}>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => router.push(`/admin/search?q=${encodeURIComponent(e.target.value)}`)}
                  placeholder="検索キーワードを入力..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  検索
                </button>
              </div>
            </form>
          </div>

          {/* 統計 */}
          {query && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.properties}</div>
                <div className="text-sm text-gray-600">物件</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-green-600">{stats.inquiries}</div>
                <div className="text-sm text-gray-600">お問い合わせ</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.leads}</div>
                <div className="text-sm text-gray-600">リード</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-orange-600">{stats.reformProjects}</div>
                <div className="text-sm text-gray-600">リフォーム案件</div>
              </div>
            </div>
          )}

          {/* 検索結果 */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : query && results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">検索結果が見つかりませんでした。</p>
              <p className="text-sm text-gray-400 mt-2">別のキーワードで検索してみてください。</p>
            </div>
          ) : query ? (
            <div className="space-y-4">
              {results.map((result) => (
                <div key={`${result.type}-${result.id}`} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getTypeIcon(result.type)}</span>
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {getTypeLabel(result.type)}
                        </span>
                        {result.status && (
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <Link href={result.url} className="hover:text-blue-600">
                          {result.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mb-2">{result.description}</p>
                      <p className="text-sm text-gray-400">
                        作成日: {new Date(result.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <Link
                      href={result.url}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      詳細を見る →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">検索キーワードを入力してください。</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function AdminSearch() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
