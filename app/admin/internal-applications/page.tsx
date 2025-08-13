'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Application {
  id: string
  employee_name: string
  application_type: string
  title: string
  description: string
  status: string
  created_at: string
  start_date?: string
  end_date?: string
  days?: number
  reason?: string
}

export default function InternalApplications() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchApplications()
  }, [filterType, filterStatus])

  const fetchApplications = async () => {
    try {
      let query = supabase
        .from('internal_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterType !== 'all') {
        query = query.eq('application_type', filterType)
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching applications:', error)
        setApplications([])
      } else {
        setApplications(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('internal_applications')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      alert('ステータスを更新しました')
      fetchApplications()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('更新に失敗しました')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '承認待ち'
      case 'approved': return '承認済み'
      case 'rejected': return '却下'
      default: return '不明'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'paid_leave': return '有給申請'
      case 'sick_leave': return '病気休暇'
      case 'overtime': return '残業申請'
      case 'expense': return '経費申請'
      case 'other': return 'その他'
      default: return type
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
              <h1 className="text-3xl font-bold text-gray-800">社内申請管理</h1>
              <p className="text-gray-600 mt-2">従業員からの各種申請を管理</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/internal-applications/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold"
              >
                新規申請作成
              </Link>
              <Link
                href="/admin"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ダッシュボードに戻る
              </Link>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">申請種別</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="paid_leave">有給申請</option>
                <option value="sick_leave">病気休暇</option>
                <option value="overtime">残業申請</option>
                <option value="expense">経費申請</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="pending">承認待ち</option>
                <option value="approved">承認済み</option>
                <option value="rejected">却下</option>
              </select>
            </div>
          </div>
        </div>

        {/* 申請一覧（スプレッドシート形式） */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    申請日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    申請者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    申請種別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイトル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    期間/詳細
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
                {applications.length > 0 ? (
                  applications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(application.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {application.employee_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getTypeText(application.application_type)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={application.title}>
                          {application.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {application.application_type === 'paid_leave' || application.application_type === 'sick_leave' ? (
                          <div>
                            {application.start_date && application.end_date && (
                              <div>
                                {new Date(application.start_date).toLocaleDateString('ja-JP')} 〜 {new Date(application.end_date).toLocaleDateString('ja-JP')}
                                {application.days && <div className="text-xs text-gray-500">{application.days}日間</div>}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="max-w-xs truncate" title={application.description}>
                            {application.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(application.id, 'approved')}
                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"
                              >
                                承認
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
                              >
                                却下
                              </button>
                            </>
                          )}
                          <Link
                            href={`/admin/internal-applications/${application.id}`}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                          >
                            詳細
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      申請がありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 申請フォーム一覧 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">申請フォーム一覧</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/internal-applications/forms/paid-leave" className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-800">有給申請</h3>
                  <p className="text-sm text-blue-600">有給休暇の申請フォーム</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/internal-applications/forms/sick-leave" className="bg-red-50 border border-red-200 rounded-lg p-6 hover:bg-red-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-800">病気休暇</h3>
                  <p className="text-sm text-red-600">病気休暇の申請フォーム</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/internal-applications/forms/overtime" className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 hover:bg-yellow-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-yellow-800">残業申請</h3>
                  <p className="text-sm text-yellow-600">残業時間の申請フォーム</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/internal-applications/forms/expense" className="bg-green-50 border border-green-200 rounded-lg p-6 hover:bg-green-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-800">経費申請</h3>
                  <p className="text-sm text-green-600">経費の申請フォーム</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/internal-applications/forms/other" className="bg-purple-50 border border-purple-200 rounded-lg p-6 hover:bg-purple-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-800">その他申請</h3>
                  <p className="text-sm text-purple-600">その他の申請フォーム</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
