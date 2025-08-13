'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { deleteCookie } from 'cookies-next'

interface SearchResult {
  type: 'property' | 'inquiry' | 'lead' | 'reform_project'
  id: string
  title: string
  description: string
  status?: string
  created_at: string
  url: string
}

export default function AdminSearch() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    properties: 0,
    inquiries: 0,
    leads: 0,
    reformProjects: 0
  })

  const handleLogout = () => {
    deleteCookie('admin-auth')
    router.push('/admin/login')
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
      } catch (leadError) {
        console.log('Leads table not available')
      }

      // リフォーム施工実績検索
      try {
        const { data: reformProjects, error: reformError } = await supabase
          .from('reform_projects')
          .select('id, title, description, created_at')
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .order('created_at', { ascending: false })

        if (!reformError && reformProjects) {
          reformProjects.forEach(project => {
            allResults.push({
              type: 'reform_project',
              id: project.id,
              title: project.title,
              description: project.description || '説明なし',
              created_at: project.created_at,
              url: `/admin/reform-projects`
            })
          })
        }
      } catch (reformError) {
        console.log('Reform projects table not available')
      }

      // 結果を日付順でソート
      allResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setResults(allResults)
      setStats({
        properties: allResults.filter(r => r.type === 'property').length,
        inquiries: allResults.filter(r => r.type === 'inquiry').length,
        leads: allResults.filter(r => r.type === 'lead').length,
        reformProjects: allResults.filter(r => r.type === 'reform_project').length
      })

    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'property': return '物件'
      case 'inquiry': return 'お問い合わせ'
      case 'lead': return 'リード'
      case 'reform_project': return '施工実績'
      default: return 'その他'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'property': return 'bg-blue-100 text-blue-800'
      case 'inquiry': return 'bg-green-100 text-green-800'
      case 'lead': return 'bg-purple-100 text-purple-800'
      case 'reform_project': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-orange-100 text-orange-800'
      case 'won': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'var(--header-height, 0px)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ paddingTop: 'var(--header-height, 0px)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">検索結果</h1>
              <p className="text-gray-600 mt-2">検索クエリ: "{query}"</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ダッシュボードに戻る
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

        {/* 検索統計 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">物件</p>
                <p className="text-3xl font-bold text-blue-600">{stats.properties}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">お問い合わせ</p>
                <p className="text-3xl font-bold text-green-600">{stats.inquiries}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">リード</p>
                <p className="text-3xl font-bold text-purple-600">{stats.leads}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">施工実績</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.reformProjects}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 検索結果 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">検索結果 ({results.length}件)</h2>
          
          {results.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">検索結果が見つかりません</h3>
              <p className="mt-1 text-sm text-gray-500">別のキーワードで検索してみてください。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={`${result.type}-${result.id}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                          {getTypeLabel(result.type)}
                        </span>
                        {result.status && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{result.title}</h3>
                      <p className="text-gray-600 mb-2">{result.description}</p>
                      <p className="text-sm text-gray-500">
                        作成日: {new Date(result.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div className="ml-4">
                      <Link
                        href={result.url}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        詳細を見る
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
