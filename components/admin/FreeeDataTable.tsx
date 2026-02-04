'use client'

import { useMemo, useState } from 'react'

type DataEntry = Record<string, string | number | null>

type FreeeDataTableProps = {
  data: DataEntry[]
  title: string
  emptyMessage?: string
}

function exportToCSV(data: DataEntry[], filename: string) {
  if (!data || data.length === 0) return

  const columns = Object.keys(data[0])
  const csvContent = [
    columns.join(','),
    ...data.map((row) =>
      columns.map((col) => {
        const value = row[col]
        // カンマや改行を含む場合はダブルクォートで囲む
        if (
          value &&
          (String(value).includes(',') ||
            String(value).includes('\n') ||
            String(value).includes('"'))
        ) {
          return `"${String(value).replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function FreeeDataTable({
  data,
  title,
  emptyMessage = 'データがありません'
}: FreeeDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const itemsPerPage = 50

  // データのカラムを取得
  const columns = useMemo(() => {
    if (!data || data.length === 0) return []
    return Object.keys(data[0])
  }, [data])

  // 検索フィルター
  const filteredData = useMemo(() => {
    if (!searchTerm) return data
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [data, searchTerm])

  // ページネーション
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredData.slice(start, end)
  }, [filteredData, currentPage, itemsPerPage])

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              exportToCSV(
                filteredData,
                `${title}_${new Date().toISOString().split('T')[0]}.csv`
              )
            }
            className="px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            CSV出力
          </button>
          <div className="text-sm text-gray-600">全 {data.length} 件のデータ</div>
        </div>
      </div>

      {/* 検索バー */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="検索..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-sm text-gray-600">
          {filteredData.length} 件中 {(currentPage - 1) * itemsPerPage + 1} -{' '}
          {Math.min(currentPage * itemsPerPage, filteredData.length)} 件を表示
        </div>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                  >
                    {row[column] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            前へ
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  )
}
