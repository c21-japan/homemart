'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// ここで useUser/useSession を使う実装ならこのままOK
// もしサーバーコンポーネントでユーザー判定している場合は
// フックをやめてクライアントに寄せる or auth() に置換してください。

interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string
  message?: string
  property_name?: string
  status: string
  created_at: string
}

function InquiriesContent() {
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status')
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)

  useEffect(() => {
    fetchInquiries()
  }, [statusFilter])

  const fetchInquiries = async () => {
    try {
      let query = supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter === 'new') {
        query = query.eq('status', 'new')
      }

      const { data, error } = await query

      if (error) throw error
      setInquiries(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    
    // 新着の場合は既読にする
    if (inquiry.status === 'new') {
      try {
        const { error } = await supabase
          .from('inquiries')
          .update({ status: 'read' })
          .eq('id', inquiry.id)

        if (error) throw error
        
        // リストを更新
        fetchInquiries()
      } catch (error) {
        console.error('Error updating status:', error)
      }
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
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {statusFilter === 'new' ? '新着問い合わせ' : 'お問い合わせ管理'}
            </h1>
            <Link
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 一覧 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <div className="flex gap-2">
                  <button
                    onClick={() => window.location.href = '/admin/inquiries'}
                    className={`px-4 py-2 rounded ${!statusFilter ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    すべて
                  </button>
                  <button
                    onClick={() => window.location.href = '/admin/inquiries?status=new'}
                    className={`px-4 py-2 rounded ${statusFilter === 'new' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
                  >
                    新着のみ
                  </button>
                </div>
              </div>
              
              <div className="divide-y">
                {inquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    onClick={() => handleViewInquiry(inquiry)}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{inquiry.name}</h3>
                          {inquiry.status === 'new' && (
                            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded">新着</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{inquiry.email}</p>
                        {inquiry.property_name && (
                          <p className="text-sm text-blue-600 mt-1">物件: {inquiry.property_name}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(inquiry.created_at).toLocaleString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {inquiries.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  お問い合わせがありません
                </div>
              )}
            </div>
          </div>

          {/* 詳細表示 */}
          <div className="lg:col-span-1">
            {selectedInquiry ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4">お問い合わせ詳細</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">お名前</p>
                    <p className="font-medium">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">メールアドレス</p>
                    <p className="font-medium">{selectedInquiry.email}</p>
                  </div>
                  {selectedInquiry.phone && (
                    <div>
                      <p className="text-sm text-gray-600">電話番号</p>
                      <p className="font-medium">{selectedInquiry.phone}</p>
                    </div>
                  )}
                  {selectedInquiry.property_name && (
                    <div>
                      <p className="text-sm text-gray-600">対象物件</p>
                      <p className="font-medium text-blue-600">{selectedInquiry.property_name}</p>
                    </div>
                  )}
                  {selectedInquiry.message && (
                    <div>
                      <p className="text-sm text-gray-600">メッセージ</p>
                      <p className="mt-1 whitespace-pre-wrap">{selectedInquiry.message}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">受信日時</p>
                    <p>{new Date(selectedInquiry.created_at).toLocaleString('ja-JP')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-center">
                  お問い合わせを選択してください
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InquiriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <InquiriesContent />
    </Suspense>
  )
}
