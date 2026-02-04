'use client'

import { useMemo } from 'react'

type JournalEntry = Record<string, string | number | null>

type FreeeMonthlyChartProps = {
  journalData?: JournalEntry[]
}

type MonthlyData = {
  month: string
  income: number
  expense: number
  profit: number
}

export default function FreeeMonthlyChart({ journalData }: FreeeMonthlyChartProps) {
  // 仕訳帳データから月次集計を作成
  const monthlyData = useMemo(() => {
    if (!journalData || journalData.length === 0) return []

    const dataByMonth: Record<string, { income: number; expense: number }> = {}

    journalData.forEach((entry) => {
      // 日付フィールドを探す（freee CSVによってフィールド名が異なる可能性がある）
      const dateField = entry['取引日'] || entry['日付'] || entry['date'] || entry['Date']
      const amountField = entry['金額'] || entry['amount'] || entry['Amount']
      const typeField = entry['貸借'] || entry['type'] || entry['Type']

      if (!dateField || !amountField) return

      try {
        const date = new Date(String(dateField))
        if (isNaN(date.getTime())) return

        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const amount = Number(amountField) || 0

        if (!dataByMonth[month]) {
          dataByMonth[month] = { income: 0, expense: 0 }
        }

        // 貸借や科目によって収入・支出を判定
        // ここは仕訳帳のフォーマットに応じて調整が必要
        if (String(typeField).includes('収益') || String(typeField).includes('売上')) {
          dataByMonth[month].income += amount
        } else if (String(typeField).includes('費用') || String(typeField).includes('経費')) {
          dataByMonth[month].expense += amount
        }
      } catch (err) {
        // 日付解析エラーは無視
      }
    })

    // 月次データを配列に変換してソート
    return Object.entries(dataByMonth)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        profit: data.income - data.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [journalData])

  const maxValue = useMemo(() => {
    if (monthlyData.length === 0) return 0
    const values = monthlyData.flatMap((d) => [
      Math.abs(d.income),
      Math.abs(d.expense),
      Math.abs(d.profit)
    ])
    return Math.max(...values)
  }, [monthlyData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(value)
  }

  if (!journalData || journalData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        月次推移を表示するには、仕訳帳データを取得してください
      </div>
    )
  }

  if (monthlyData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        月次データを生成できませんでした。仕訳帳のフォーマットを確認してください。
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">月次推移</h3>
        <p className="text-sm text-gray-600">
          仕訳帳データから集計した月次の収益・費用・利益の推移
        </p>
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>収益</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>費用</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>利益</span>
        </div>
      </div>

      {/* グラフ */}
      <div className="space-y-6">
        {monthlyData.map((data) => (
          <div key={data.month} className="space-y-2">
            <div className="text-sm font-medium text-gray-700">{data.month}</div>
            <div className="space-y-1">
              {/* 収益 */}
              <div className="flex items-center gap-4">
                <div className="w-16 text-xs text-gray-600">収益</div>
                <div className="flex-1">
                  <div className="h-6 rounded bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${maxValue ? (Math.abs(data.income) / maxValue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="w-32 text-right text-sm text-gray-900">
                  {formatCurrency(data.income)}
                </div>
              </div>
              {/* 費用 */}
              <div className="flex items-center gap-4">
                <div className="w-16 text-xs text-gray-600">費用</div>
                <div className="flex-1">
                  <div className="h-6 rounded bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${maxValue ? (Math.abs(data.expense) / maxValue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="w-32 text-right text-sm text-gray-900">
                  {formatCurrency(data.expense)}
                </div>
              </div>
              {/* 利益 */}
              <div className="flex items-center gap-4">
                <div className="w-16 text-xs text-gray-600">利益</div>
                <div className="flex-1">
                  <div className="h-6 rounded bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full ${data.profit >= 0 ? 'bg-green-500' : 'bg-rose-500'}`}
                      style={{ width: `${maxValue ? (Math.abs(data.profit) / maxValue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="w-32 text-right text-sm font-semibold text-gray-900">
                  {formatCurrency(data.profit)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-sm text-gray-600">総収益</div>
          <div className="text-lg font-semibold text-blue-600">
            {formatCurrency(monthlyData.reduce((sum, d) => sum + d.income, 0))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">総費用</div>
          <div className="text-lg font-semibold text-red-600">
            {formatCurrency(monthlyData.reduce((sum, d) => sum + d.expense, 0))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">総利益</div>
          <div className="text-lg font-semibold text-green-600">
            {formatCurrency(monthlyData.reduce((sum, d) => sum + d.profit, 0))}
          </div>
        </div>
      </div>
    </div>
  )
}
