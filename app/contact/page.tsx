'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function Contact() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyName = searchParams.get('property') || ''
  const propertyId = searchParams.get('id') || ''
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('inquiries')
        .insert({
          property_id: propertyId ? parseInt(propertyId) : null,
          property_name: propertyName,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        })

      if (error) throw error

      // メール送信処理を追加
      try {
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
            propertyName: propertyName
          })
        })
        
        if (!emailResponse.ok) {
          console.error('メール送信に失敗しましたが、お問い合わせは受付けました')
        } else {
          console.log('メール送信成功')
        }
      } catch (emailError) {
        console.error('メール送信エラー:', emailError)
        // メール送信に失敗してもフォーム送信は成功とする
      }

      setShowSuccess(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
      
      // 3秒後にトップページへ
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
      alert('送信に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4">送信完了しました</h2>
          <p className="text-gray-600 mb-4">
            お問い合わせありがとうございます。<br />
            担当者より連絡させていただきます。
          </p>
          <p className="text-sm text-gray-500">
            3秒後にトップページに戻ります...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              株式会社ホームマート
            </Link>
            <a 
              href="tel:0120438639" 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              📞 0120-43-8639
            </a>
          </div>
        </div>
      </header>

      {/* パンくず */}
      <div className="container mx-auto px-4 py-2">
        <nav className="text-sm">
          <Link href="/" className="text-blue-600 hover:underline">トップ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">お問い合わせ</span>
        </nav>
      </div>

      {/* フォーム */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-6">お問い合わせ</h1>
            
            {propertyName && (
              <div className="bg-blue-50 p-4 rounded mb-6">
                <p className="text-sm text-blue-800">
                  物件：<span className="font-bold">{propertyName}</span> についてのお問い合わせ
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="山田 太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="090-1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ご質問やご要望をお書きください"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50"
                >
                  {isSubmitting ? '送信中...' : '送信する'}
                </button>
                <Link
                  href="/"
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-bold text-center"
                >
                  キャンセル
                </Link>
              </div>
            </form>

            <div className="mt-8 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <strong>営業時間</strong><br />
                平日：9:00〜18:00 / 土日祝：10:00〜17:00<br />
                定休日：水曜日<br />
                お急ぎの方は直接お電話ください：0120-43-8639
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
