'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getLeads, getLeadStats, CustomerLead, LeadType, LeadStatus } from '@/lib/supabase/leads'

function LeadsContent() {
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status')
  const typeFilter = searchParams.get('type')
  const monthFilter = searchParams.get('month')
  const searchFilter = searchParams.get('search')
  
  const [leads, setLeads] = useState<CustomerLead[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    byStatus: { new: 0, in_progress: 0, won: 0, lost: 0 },
    byType: { purchase: 0, sell: 0, reform: 0 },
    byMonth: {}
  })
  const [selectedLead, setSelectedLead] = useState<CustomerLead | null>(null)
  const [searchTerm, setSearchTerm] = useState(searchFilter || '')

  useEffect(() => {
    fetchLeads()
    fetchStats()
  }, [statusFilter, typeFilter, monthFilter, searchFilter])

  const fetchLeads = async () => {
    try {
      const filters: any = {}
      if (statusFilter) filters.status = statusFilter
      if (typeFilter) filters.type = typeFilter
      if (monthFilter) filters.month = monthFilter
      if (searchFilter) filters.search = searchFilter

      const data = await getLeads(filters)
      setLeads(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await getLeadStats()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (statusFilter) params.set('status', statusFilter)
    if (typeFilter) params.set('type', typeFilter)
    if (monthFilter) params.set('month', monthFilter)
    
    const queryString = params.toString()
    const url = queryString ? `/admin/leads?${queryString}` : '/admin/leads'
    window.history.pushState({}, '', url)
    
    fetchLeads()
  }

  const handleViewLead = (lead: CustomerLead) => {
    setSelectedLead(lead)
  }

  const getStatusBadgeColor = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'won': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeBadgeColor = (type: LeadType) => {
    switch (type) {
      case 'purchase': return 'bg-purple-100 text-purple-800'
      case 'sell': return 'bg-indigo-100 text-indigo-800'
      case 'reform': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('ja-JP').format(amount) + '円'
  }

  const getExtraSummary = (lead: CustomerLead) => {
    const extra = lead.extra
    switch (extra.type) {
      case 'purchase':
        return extra.budget ? `予算: ${formatCurrency(extra.budget)}` : '予算未定'
      case 'sell':
        return extra.expected_price ? `希望価格: ${formatCurrency(extra.expected_price)}` : '価格要相談'
      case 'reform':
        return extra.rough_budget ? `概算予算: ${formatCurrency(extra.rough_budget)}` : '予算要相談'
      default:
        return ''
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-blue-600 hover:underline">
                ← ダッシュボード
              </Link>
              <h1 className="text-2xl font-bold">顧客情報管理</h1>
              <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {leads.length}件
              </span>
            </div>
            <Link
              href="/leads/new"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              新規顧客登録
            </Link>
          </div>
        </div>
      </header>

      {/* 統計情報 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">総顧客数</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">新規</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.byStatus.new}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">進行中</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.byStatus.in_progress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">成約</h3>
            <p className="text-3xl font-bold text-green-600">{stats.byStatus.won}</p>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">検索・フィルター</h3>
          
          {/* 検索バー */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="氏名、建物名、電話番号で検索"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              検索
            </button>
          </div>

          {/* フィルター */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin/leads"
              className={`px-4 py-2 rounded ${
                !statusFilter && !typeFilter && !monthFilter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              全て
            </Link>
            <Link
              href="/admin/leads?status=new"
              className={`px-4 py-2 rounded ${
                statusFilter === 'new'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              新規
            </Link>
            <Link
              href="/admin/leads?status=in_progress"
              className={`px-4 py-2 rounded ${
                statusFilter === 'in_progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              進行中
            </Link>
            <Link
              href="/admin/leads?status=won"
              className={`px-4 py-2 rounded ${
                statusFilter === 'won'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              成約
            </Link>
            <Link
              href="/admin/leads?status=lost"
              className={`px-4 py-2 rounded ${
                statusFilter === 'lost'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              失注
            </Link>
          </div>

          {/* 種別フィルター */}
          <div className="flex flex-wrap gap-4 mt-4">
            <Link
              href="/admin/leads?type=purchase"
              className={`px-4 py-2 rounded ${
                typeFilter === 'purchase'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              購入 ({stats.byType.purchase})
            </Link>
            <Link
              href="/admin/leads?type=sell"
              className={`px-4 py-2 rounded ${
                typeFilter === 'sell'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              売却 ({stats.byType.sell})
            </Link>
            <Link
              href="/admin/leads?type=reform"
              className={`px-4 py-2 rounded ${
                typeFilter === 'reform'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              リフォーム ({stats.byType.reform})
            </Link>
          </div>
        </div>

        {/* 顧客一覧 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    顧客名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    種別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    詳細
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    添付
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lead.last_name} {lead.first_name}
                        </div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(lead.type)}`}>
                        {lead.type === 'purchase' ? '購入' : lead.type === 'sell' ? '売却' : 'リフォーム'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(lead.status)}`}>
                        {lead.status === 'new' ? '新規' : lead.status === 'in_progress' ? '進行中' : lead.status === 'won' ? '成約' : '失注'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getExtraSummary(lead)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.attachments?.length || 0}件
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewLead(lead)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        詳細
                      </button>
                      <Link
                        href={`/admin/leads/${lead.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        編集
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 顧客詳細モーダル */}
      {selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">顧客詳細</h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">顧客名</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedLead.last_name} {selectedLead.first_name}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLead.email || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">電話番号</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLead.phone || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">種別</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(selectedLead.type)}`}>
                      {selectedLead.type === 'purchase' ? '購入' : selectedLead.type === 'sell' ? '売却' : 'リフォーム'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ステータス</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedLead.status)}`}>
                      {selectedLead.status === 'new' ? '新規' : selectedLead.status === 'in_progress' ? '進行中' : selectedLead.status === 'won' ? '成約' : '失注'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">詳細情報</label>
                  <p className="mt-1 text-sm text-gray-900">{getExtraSummary(selectedLead)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">備考</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.note || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">添付ファイル</label>
                  <div className="mt-1">
                    {selectedLead.attachments?.length ? (
                      <div className="text-sm text-gray-900">
                        {selectedLead.attachments.length}件のファイルが添付されています
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">添付ファイルなし</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <Link
                  href={`/admin/leads/${selectedLead.id}/edit`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  編集
                </Link>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LeadsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <LeadsContent />
    </Suspense>
  )
}
