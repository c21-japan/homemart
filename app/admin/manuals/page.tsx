'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface ManualSummary {
  id: string
  title: string
  category: '工務部' | '営業/事務'
  created_at: string
  updated_at: string
  content?: string
}

const CATEGORY_OPTIONS: Array<{ value: 'all' | ManualSummary['category']; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: '工務部', label: '工務部' },
  { value: '営業/事務', label: '営業/事務' }
]

export default function ManualListPage() {
  const [manuals, setManuals] = useState<ManualSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | ManualSummary['category']>('all')

  useEffect(() => {
    fetchManuals()
  }, [search, category])

  const fetchManuals = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('manuals')
        .select('id, title, category, created_at, updated_at, content')
        .order('updated_at', { ascending: false })

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      if (search.trim()) {
        const keyword = `%${search.trim()}%`
        query = query.or(`title.ilike.${keyword},content.ilike.${keyword}`)
      }

      const { data, error } = await query

      if (error) throw error
      setManuals(data || [])
    } catch (error) {
      console.error('Error fetching manuals:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCountLabel = useMemo(() => {
    if (loading) return ''
    if (manuals.length === 0) return '0件'
    return `${manuals.length}件`
  }, [loading, manuals.length])

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'var(--header-height, 0px)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">社内マニュアル</h1>
              <p className="text-gray-600 mt-1">検索して必要な手順や目的をすぐに確認できます</p>
            </div>
            <Link
              href="/admin/manuals/new"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              新規マニュアル作成
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">検索</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="例: 入力の流れ, 書類作成, 物件登録"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">カテゴリ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'all' | ManualSummary['category'])}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">検索結果: {filteredCountLabel}</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : manuals.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
            マニュアルがありません。新規作成してください。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {manuals.map(manual => (
              <Link
                key={manual.id}
                href={`/admin/manuals/${manual.id}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                        {manual.title}
                      </h2>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${manual.category === '工務部' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {manual.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {manual.content}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    更新: {new Date(manual.updated_at).toLocaleString('ja-JP')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
