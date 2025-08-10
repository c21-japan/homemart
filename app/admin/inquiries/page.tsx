'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Inquiry {
  id: number
  property_name: string
  name: string
  email: string
  phone: string
  message: string
  status: string
  created_at: string
}

export default function InquiriesList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 認証チェック
  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    const expiry = localStorage.getItem('authExpiry')
    
    if (auth !== 'true' || !expiry || Date.now() >= Number(expiry)) {
      router.push('/admin')
    }
  }, [router])

  // 問い合わせ一覧を取得
  useEffect(() => {
    fetchInquiries()
  }, [])

  async function fetchInquiries() {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInquiries(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // ステータス更新
  async function updateStatus(id: number, status: string) {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      
      // 一覧を更新
      setInquiries(inquiries.map(inq => 
        inq.id === id ? { ...inq, status } : inq
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">お問い合わせ管理</h1>
            <div className="flex gap-4">
              <Link href="/admin" className="text-blue-600 hover:underline">
                物件登録
              </Link>
              <Link href="/admin/properties" className="text-blue-600 hover:underline">
                物件一覧
              </Link>
              <a href="/" className="text-blue-600 hover:underline">
                サイトを見る
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 一覧 */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
              お問い合わせ一覧（{inquiries.length}件）
            </h2>

            {loading ? (
              <p>読み込み中...</p>
            ) : inquiries.length === 0 ? (
              <p className="text-gray-500">お問い合わせはありません</p>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                          inquiry.status === 'new' 
                            ? 'bg-red-100 text-red-800' 
                            : inquiry.status === 'contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {inquiry.status === 'new' ? '新規' : 
                           inquiry.status === 'contacted' ? '対応中' : '完了'}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(inquiry.created_at).toLocaleString('ja-JP')}
                        </span>
                      </div>
                      <select
                        value={inquiry.status}
                        onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="new">新規</option>
                        <option value="contacted">対応中</option>
                        <option value="completed">完了</option>
                      </select>
                    </div>

                    {inquiry.property_name && (
                      <p className="text-sm bg-blue-50 px-2 py-1 rounded mb-2">
                        物件：{inquiry.property_name}
                      </p>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">お名前</p>
                        <p className="font-bold">{inquiry.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">電話番号</p>
                        <a href={`tel:${inquiry.phone}`} className="font-bold text-blue-600 hover:underline">
                          {inquiry.phone}
                        </a>
                      </div>
                      {inquiry.email && (
                        <div>
                          <p className="text-sm text-gray-600">メール</p>
                          <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline">
                            {inquiry.email}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-gray-600">お問い合わせ内容</p>
                      <p className="mt-1 whitespace-pre-wrap">{inquiry.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}