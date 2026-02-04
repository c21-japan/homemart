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
  const [canUpload, setCanUpload] = useState(false)
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
        if (!response.ok) {
          console.log('Failed to fetch user info:', response.status)
          setCanUpload(false)
          return
        }
        const data = await response.json()
        console.log('User data:', data)

        // permissionsはオブジェクト形式: { REPORTS: ["VIEW", "EXPORT"], ... }
        const hasReportsExport = data?.permissions?.REPORTS?.includes('EXPORT')
        const hasReportsEdit = data?.permissions?.REPORTS?.includes('EDIT')
        const canUploadResult =
          data?.role === 'OWNER' ||
          data?.role === 'ADMIN' ||
          hasReportsExport ||
          hasReportsEdit

        console.log('Can upload:', canUploadResult, {
          role: data?.role,
          hasReportsExport,
          hasReportsEdit
        })

        setCanUpload(canUploadResult)
      } catch (err) {
        console.error('Failed to fetch user info:', err)
        setCanUpload(false)
      }
    }

    fetchMe()
    fetchCsvData()
  }, [])

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setRefreshing(true)
    setError(null)
    try {
      const formData = new FormData()

      // ファイル名から種類を判定
      Array.from(files).forEach((file) => {
        const fileName = file.name.toLowerCase()
        if (fileName.includes('trial') || fileName.includes('試算表')) {
          formData.append('trial_balance', file)
        } else if (fileName.includes('journal') || fileName.includes('仕訳')) {
          formData.append('journal', file)
        } else if (fileName.includes('general') || fileName.includes('ledger') || fileName.includes('総勘定')) {
          formData.append('general_ledger', file)
        }
      })

      const response = await fetch('/api/freee/csv/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(data?.message || 'CSVアップロードに失敗しました')
        return
      }

      // CSVデータを再取得
      await fetchCsvData()
      alert('CSVファイルをアップロードしました')
      // サマリータブに切り替え
      setActiveTab('summary')
    } catch (err) {
      setError('CSVアップロードに失敗しました')
    } finally {
      setRefreshing(false)
      // inputをリセット
      event.target.value = ''
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
            決算期: 5月1日 〜 4月30日 | freeeからCSVをダウンロードしてアップロードしてください
          </p>
        </div>
        <div className="flex items-center gap-3">
          {csvData && (
            <div className="text-sm text-gray-500">
              最終更新日: {csvData.updated_at}（対象期間: {csvData.period.start_date} 〜{' '}
              {csvData.period.end_date}）
            </div>
          )}
          {canUpload && (
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                multiple
                onChange={handleCSVUpload}
                disabled={refreshing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className={`px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors cursor-pointer inline-block ${
                  refreshing ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {refreshing ? 'アップロード中...' : 'CSVアップロード'}
              </label>
            </div>
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
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 space-y-4">
                  <p className="text-sm text-gray-600 font-semibold">
                    まだfreeeデータがアップロードされていません。
                  </p>
                  {canUpload ? (
                    <div className="text-sm text-gray-600 space-y-2">
                      <p className="font-medium">CSVファイルのダウンロード手順：</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>freeeにログイン: <a href="https://secure.freee.co.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://secure.freee.co.jp/</a></li>
                        <li>レポート → 試算表 → CSVダウンロード</li>
                        <li>レポート → 仕訳帳 → CSVダウンロード</li>
                        <li>レポート → 総勘定元帳 → CSVダウンロード</li>
                        <li>ダウンロードした3つのCSVファイルをこのページにアップロード</li>
                      </ol>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      管理者に更新を依頼してください。
                    </p>
                  )}
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
                  仕訳帳データがありません。freeeからCSVファイルをダウンロードしてアップロードしてください。
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
                  総勘定元帳データがありません。freeeからCSVファイルをダウンロードしてアップロードしてください。
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
                  試算表データがありません。freeeからCSVファイルをダウンロードしてアップロードしてください。
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
