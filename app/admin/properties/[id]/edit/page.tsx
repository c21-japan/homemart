'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

import Link from 'next/link'

interface Property {
  id: string
  name: string
  price: number
  address: string
  description?: string
  image_url?: string
  featured: boolean
}

export default function EditProperty() {
  const params = useParams()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const propertyId = typeof params?.id === 'string' ? params.id : ''
  
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [property, setProperty] = useState<Property | null>(null)
  const [message, setMessage] = useState('')

  // 物件データを取得
  useEffect(() => {
    if (!propertyId) return
    fetchProperty()
  }, [propertyId])

  async function fetchProperty() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (error) throw error
      
      setProperty(data)
      setImageUrl(data.image_url || '')
    } catch (error) {
      console.error('Error:', error)
      alert('物件が見つかりません')
      router.push('/admin/properties')
    } finally {
      setLoading(false)
    }
  }

  // 更新処理
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          name: formData.get('name') as string,
          price: Number(formData.get('price')),
          address: formData.get('address') as string,
          description: formData.get('description') as string,
          image_url: imageUrl || null,
          featured: formData.get('featured') === 'on'
        })
        .eq('id', propertyId)

      if (error) throw error
      
      setMessage('✅ 更新しました！')
      setTimeout(() => {
        router.push('/admin/properties')
      }, 1500)
    } catch (error) {
      console.error('Error:', error)
      setMessage('❌ 更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'var(--header-height, 0px)' }}>
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'var(--header-height, 0px)' }}>
      {/* ヘッダー */}
      <div className="bg-white shadow-sm mb-8">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">物件編集</h1>
            <Link 
              href="/admin/properties" 
              className="text-blue-600 hover:underline"
            >
              ← 一覧に戻る
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* メッセージ */}
        {message && (
          <div className={`px-4 py-3 rounded mb-6 ${
            message.includes('✅') 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* 編集フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">物件情報を編集</h2>
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* 画像 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                物件画像
              </label>
              {imageUrl ? (
                <div className="space-y-2">
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="物件画像"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">画像を変更する場合は、新しい画像URLを入力してください</p>
                </div>
              ) : (
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="画像URLを入力してください"
                  className="w-full p-3 border rounded-lg"
                />
              )}
            </div>
            
            {/* 物件名 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                物件名 <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                required
                defaultValue={property?.name}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            
            {/* 価格 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                価格（円） <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                type="number"
                required
                defaultValue={property?.price}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            
            {/* 住所 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                住所 <span className="text-red-500">*</span>
              </label>
              <input
                name="address"
                required
                defaultValue={property?.address}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            
            {/* 説明 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                物件説明
              </label>
              <textarea
                name="description"
                defaultValue={property?.description}
                className="w-full p-3 border rounded-lg"
                rows={4}
              />
            </div>
            
            {/* おすすめ */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                defaultChecked={property?.featured}
                className="mr-2"
              />
              <label htmlFor="featured">
                おすすめ物件として表示する
              </label>
            </div>
            
            {/* ボタン */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50"
              >
                {isSubmitting ? '更新中...' : '更新する'}
              </button>
              <Link
                href="/admin/properties"
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-bold text-center"
              >
                キャンセル
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
