'use client'

import { useState, useEffect } from 'react'
import { 
  UserGroupIcon, 
  HomeIcon, 
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { getLeadStats } from '@/lib/supabase/leads'
import { getAgreementStats } from '@/app/(secure)/actions/agreements'
import { getChecklistStats } from '@/app/(secure)/actions/checklists'
import { formatCurrency, formatDateJP } from '@/lib/utils/format'

export default function DashboardPage() {
  const [leadStats, setLeadStats] = useState<any>(null)
  const [agreementStats, setAgreementStats] = useState<any>(null)
  const [checklistStats, setChecklistStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState('current')

  useEffect(() => {
    fetchDashboardData()
    
    // 毎分自動更新
    const interval = setInterval(fetchDashboardData, 60000)
    return () => clearInterval(interval)
  }, [selectedPeriod])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 各統計データを並行取得
      const [leads, agreements, checklists] = await Promise.all([
        getLeadStats(),
        getAgreementStats(),
        getChecklistStats()
      ])

      setLeadStats(leads)
      setAgreementStats(agreements)
      setChecklistStats(checklists)

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      if (error?.message?.includes('Failed to fetch')) {
        setError('ネットワークエラーです。接続を確認してください')
      } else {
        setError('ダッシュボードデータの取得に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">ダッシュボードを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">統合ダッシュボード</h1>
                <p className="text-sm text-gray-600">営業成績・案件進捗・未完了業務の一覧</p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="current">今月</option>
                  <option value="last">先月</option>
                  <option value="quarter">四半期</option>
                  <option value="year">年間</option>
                </select>
                <button
                  onClick={fetchDashboardData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* 主要指標 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">総顧客数</p>
                <p className="text-2xl font-bold text-gray-900">{leadStats?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HomeIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">媒介契約</p>
                <p className="text-2xl font-bold text-gray-900">{agreementStats?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentCheckIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">チェックリスト</p>
                <p className="text-2xl font-bold text-gray-900">{checklistStats?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">緊急案件</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(agreementStats?.reinsOverdue || 0) + (agreementStats?.dueReports || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 顧客統計 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">顧客統計</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">ステータス別</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{leadStats?.byStatus?.new || 0}</p>
                      <p className="text-sm text-gray-600">新規</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{leadStats?.byStatus?.in_progress || 0}</p>
                      <p className="text-sm text-gray-600">進行中</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{leadStats?.byStatus?.won || 0}</p>
                      <p className="text-sm text-gray-600">成約</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{leadStats?.byStatus?.lost || 0}</p>
                      <p className="text-sm text-gray-600">失注</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">用途別</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-600">{leadStats?.byType?.purchase || 0}</p>
                      <p className="text-sm text-gray-600">購入</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-600">{leadStats?.byType?.sell || 0}</p>
                      <p className="text-sm text-gray-600">売却</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-purple-600">{leadStats?.byType?.reform || 0}</p>
                      <p className="text-sm text-gray-600">リフォーム</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 媒介契約統計 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">媒介契約統計</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">契約種別別</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-600">{agreementStats?.byType?.専属専任 || 0}</p>
                      <p className="text-sm text-gray-600">専属専任</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-600">{agreementStats?.byType?.専任 || 0}</p>
                      <p className="text-sm text-gray-600">専任</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-600">{agreementStats?.byType?.一般 || 0}</p>
                      <p className="text-sm text-gray-600">一般</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">緊急案件</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">本日報告対象</span>
                      <span className="text-lg font-bold text-yellow-600">{agreementStats?.dueReports || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">レインズ期限切れ</span>
                      <span className="text-lg font-bold text-red-600">{agreementStats?.reinsOverdue || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* チェックリスト進捗 */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">チェックリスト進捗</h2>
          </div>
          <div className="p-6">
            {checklistStats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {checklistStats.overall.avgProgress}%
                  </div>
                  <p className="text-sm text-gray-600">全体平均進捗率</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {checklistStats.overall.completedItems}
                  </div>
                  <p className="text-sm text-gray-600">完了項目数</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {checklistStats.overall.totalItems}
                  </div>
                  <p className="text-sm text-gray-600">総項目数</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center">チェックリストデータがありません</p>
            )}
          </div>
        </div>

        {/* 最近の活動 */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">最近の活動</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">チェックリスト完了通知が送信されました</span>
                <span className="text-xs text-gray-400">2時間前</span>
              </div>
              <div className="flex items-center space-x-3">
                <BellIcon className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-gray-600">媒介契約の報告期限が近づいています</span>
                <span className="text-xs text-gray-400">4時間前</span>
              </div>
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">新しい顧客情報が登録されました</span>
                <span className="text-xs text-gray-400">6時間前</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
