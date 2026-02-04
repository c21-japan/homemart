'use client'

import { useEffect, useMemo, useState } from 'react'
import FreeeDataTable from './FreeeDataTable'
import FreeeMonthlyChart from './FreeeMonthlyChart'
import { parseTrialBalanceSummary } from '@/lib/freee/csv-parser'

type SummaryLine = {
  label: string
  value: number
}

type Summary = {
  highlights: SummaryLine[]
  categories: SummaryLine[]
}

type CSVDataPayload = {
  updated_at: string
  period: { start_date: string; end_date: string }
  data: {
    journal?: Record<string, string | number | null>[]
    general_ledger?: Record<string, string | number | null>[]
    trial_balance?: Record<string, string | number | null>[]
  }
}

type TabType = 'summary' | 'journal' | 'general_ledger' | 'trial_balance'

const currencyFormatter = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function buildTopCategories(items: SummaryLine[], limit = 6) {
  return [...items]
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, limit)
}

function BarChart({ items }: { items: SummaryLine[] }) {
  const maxValue = useMemo(() => {
    const values = items.map((item) => Math.abs(item.value))
    return values.length ? Math.max(...values) : 0
  }, [items])

  if (!items.length) {
    return <p className="text-sm text-gray-500">データがありません</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const width = maxValue ? (Math.abs(item.value) / maxValue) * 100 : 0
        const isPositive = item.value >= 0
        return (
          <div key={item.label} className="flex items-center gap-4">
            <div className="w-40 text-sm text-gray-700 truncate">{item.label}</div>
            <div className="flex-1">
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full ${isPositive ? 'bg-blue-500' : 'bg-rose-500'}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
            <div className="w-32 text-right text-sm text-gray-700">
              {formatCurrency(item.value)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function FreeeReportsPage() {
  const [csvData, setCsvData] = useState<CSVDataPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('summary')

  // CSVデータから試算表のサマリーを生成
  const summary = useMemo(() => {
    if (!csvData?.data?.trial_balance) {
      return { pl: { highlights: [], categories: [] }, bs: { highlights: [], categories: [] } }
    }
    return parseTrialBalanceSummary(csvData.data.trial_balance)
  }, [csvData])

  const fetchCsvData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/freee/csv/data', { cache: 'no-store' })
      if (response.ok) {
        const data = (await response.json()) as CSVDataPayload
        setCsvData(data)
      } else if (response.status === 404) {
        setCsvData(null)
      } else {
        const data = await response.json().catch(() => null)
        setError(data?.message || 'CSVデータ取得に失敗しました')
      }
    } catch (err) {
      console.error('CSVデータ取得失敗:', err)
      setError('CSVデータ取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json()
        setIsOwner(data?.role === 'OWNER')
      } catch (err) {
        setIsOwner(false)
      }
    }

    fetchMe()
    fetchCsvData()
  }, [])

  const handleRefreshFromCSV = async () => {
    setRefreshing(true)
    setError(null)
    try {
      const response = await fetch('/api/freee/csv/refresh', {
        method: 'POST'
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(data?.message || 'CSVダウンロードに失敗しました')
        return
      }
      // CSVデータを再取得
      await fetchCsvData()
      alert('CSVデータを取得しました')
      // サマリータブに切り替え
      setActiveTab('summary')
    } catch (err) {
      setError('CSVダウンロードに失敗しました')
    } finally {
      setRefreshing(false)
    }
  }

  const plHighlights = summary.pl.highlights
  const bsHighlights = summary.bs.highlights
  const plCategories = buildTopCategories(summary.pl.categories)
  const bsCategories = buildTopCategories(summary.bs.categories)

  const tabs = [
    { id: 'summary' as TabType, label: 'サマリー' },
    { id: 'journal' as TabType, label: '仕訳帳' },
    { id: 'general_ledger' as TabType, label: '総勘定元帳' },
    { id: 'trial_balance' as TabType, label: '試算表' }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">freee 財務レポート</h1>
          <p className="text-sm text-gray-500">
            決算期: 5月1日 〜 4月30日（CSV取得ボタンを押した日までの最新分）
          </p>
        </div>
        <div className="flex items-center gap-3">
          {csvData && (
            <div className="text-sm text-gray-500">
              最終更新日: {csvData.updated_at}（対象期間: {csvData.period.start_date} 〜{' '}
              {csvData.period.end_date}）
            </div>
          )}
          {isOwner && (
            <button
              onClick={handleRefreshFromCSV}
              disabled={refreshing}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold disabled:opacity-60 hover:bg-green-700 transition-colors"
            >
              {refreshing ? 'CSV取得中...' : 'CSV取得'}
            </button>
          )}
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* サマリータブ */}
          {activeTab === 'summary' && (
            <>
              {!csvData && !error && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                  <p className="text-sm text-gray-600">
                    まだfreeeデータが取得されていません。{isOwner ? 'CSV取得ボタンを押してデータを取得してください。' : 'オーナーに更新を依頼してください。'}
                  </p>
                </div>
              )}

              {csvData && csvData.data.trial_balance && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">損益計算書（PL）ハイライト</h2>
                      <div className="space-y-3">
                        {plHighlights.length ? (
                          plHighlights.map((item) => (
                            <div key={item.label} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.label}</span>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(item.value)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">ハイライトがありません</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">貸借対照表（BS）ハイライト</h2>
                      <div className="space-y-3">
                        {bsHighlights.length ? (
                          bsHighlights.map((item) => (
                            <div key={item.label} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.label}</span>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(item.value)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">ハイライトがありません</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">損益計算書（PL）カテゴリ別</h2>
                      <BarChart items={plCategories} />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">貸借対照表（BS）カテゴリ別</h2>
                      <BarChart items={bsCategories} />
                    </div>
                  </div>

                  {/* 月次推移グラフ */}
                  {csvData?.data?.journal && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <FreeeMonthlyChart journalData={csvData.data.journal} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* 仕訳帳タブ */}
          {activeTab === 'journal' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              {csvData?.data?.journal ? (
                <FreeeDataTable
                  data={csvData.data.journal}
                  title="仕訳帳"
                  emptyMessage="仕訳帳データがありません"
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  仕訳帳データがありません。CSV取得ボタンを押してデータを取得してください。
                </div>
              )}
            </div>
          )}

          {/* 総勘定元帳タブ */}
          {activeTab === 'general_ledger' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              {csvData?.data?.general_ledger ? (
                <FreeeDataTable
                  data={csvData.data.general_ledger}
                  title="総勘定元帳"
                  emptyMessage="総勘定元帳データがありません"
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  総勘定元帳データがありません。CSV取得ボタンを押してデータを取得してください。
                </div>
              )}
            </div>
          )}

          {/* 試算表タブ */}
          {activeTab === 'trial_balance' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              {csvData?.data?.trial_balance ? (
                <FreeeDataTable
                  data={csvData.data.trial_balance}
                  title="試算表"
                  emptyMessage="試算表データがありません"
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  試算表データがありません。CSV取得ボタンを押してデータを取得してください。
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
