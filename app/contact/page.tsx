'use client'
import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// メインのコンポーネントを分離
function ContactForm() {
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
          <h2 className="text-2xl font-bold mb-4 text-[#36454F]">送信完了しました</h2>
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


      {/* メインビジュアル */}
      <div className="bg-gradient-to-r from-[#FFA500] to-[#FFD700] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">お問い合わせ</h1>
          <p className="text-xl text-white">お気軽にご相談ください</p>
        </div>
      </div>

      {/* パンくず */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <nav className="text-sm">
          <Link href="/" className="text-[#FFD700] hover:underline">トップ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">お問い合わせ</span>
        </nav>
      </div>

      {/* お問い合わせ方法 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-3">📞</div>
            <h3 className="text-lg font-bold mb-2">お電話</h3>
            <p className="text-2xl font-bold text-[#FF0000] mb-2">0120-43-8639</p>
            <p className="text-xs text-gray-600">受付時間: 9:00〜22:00</p>
            <a 
              href="tel:0120438639" 
              className="mt-3 bg-[#FF0000] text-white px-4 py-2 rounded-lg inline-block hover:bg-red-700 transition-colors text-sm"
            >
              今すぐ電話
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-3">📧</div>
            <h3 className="text-lg font-bold mb-2">メール</h3>
            <p className="text-sm text-gray-600 mb-3">
              24時間受付<br />
              翌営業日までにご返信
            </p>
            <p className="text-xs text-[#36454F]">
              下記フォームよりお問い合わせ
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-3">🏢</div>
            <h3 className="text-lg font-bold mb-2">来店</h3>
            <p className="text-xs text-gray-600 mb-3">
              〒635-0821
              奈良県北葛城郡広陵町笠287-1
            </p>
            <p className="text-xs text-[#FF0000]">
              ※事前予約をお勧めします
            </p>
          </div>
        </div>

        {/* フォーム */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-[#36454F]">お問い合わせフォーム</h2>
            
            {propertyName && (
              <div className="bg-[#FFD700] bg-opacity-20 p-4 rounded mb-6">
                <p className="text-sm text-[#36454F]">
                  物件：<span className="font-bold">{propertyName}</span> についてのお問い合わせ
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    お名前 <span className="text-[#FF0000]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
                    placeholder="山田 太郎"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    電話番号 <span className="text-[#FF0000]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  お問い合わせ内容 <span className="text-[#FF0000]">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700]"
                  placeholder="ご質問やご要望をお書きください"
                />
              </div>

              <div className="bg-[#F5F5DC] rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">個人情報の取り扱いについて</span><br />
                  ご記入いただいた個人情報は、お問い合わせへの対応およびご連絡のためにのみ使用し、
                  適切に管理いたします。
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                    isSubmitting 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-[#FFD700] text-black hover:bg-[#DAA520] transform hover:scale-105'
                  }`}
                >
                  {isSubmitting ? '送信中...' : '送信する'}
                </button>
                <Link
                  href="/"
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-bold text-center transition-colors"
                >
                  キャンセル
                </Link>
              </div>
            </form>

            <div className="mt-8 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <strong className="text-[#36454F]">営業時間</strong><br />
                平日：9:00〜18:00 / 土日祝：10:00〜17:00<br />
                定休日：水曜日<br />
                お客様専用ダイヤル（9:00〜22:00）：<span className="font-bold text-[#FF0000]">0120-43-8639</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* よくあるご質問 */}
      <div className="bg-[#F5F5DC] py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center text-[#36454F]">よくあるご質問</h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-bold mb-2 text-[#36454F]">Q. 査定は無料ですか？</h3>
              <p className="text-gray-700">A. はい、査定は完全無料です。お気軽にご相談ください。</p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-bold mb-2 text-[#36454F]">Q. 相談だけでも大丈夫ですか？</h3>
              <p className="text-gray-700">A. もちろん大丈夫です。まずはお話をお聞かせください。</p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-bold mb-2 text-[#36454F]">Q. 営業時間外でも対応可能ですか？</h3>
              <p className="text-gray-700">A. お客様専用ダイヤルは22時まで対応しております。事前予約で時間外対応も可能です。</p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-bold mb-2 text-[#36454F]">Q. どのエリアに対応していますか？</h3>
              <p className="text-gray-700">A. 奈良県・大阪府全域に対応しております。その他のエリアもご相談ください。</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

// Suspenseで囲んだメインコンポーネント
export default function Contact() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    }>
      <ContactForm />
    </Suspense>
  )
}
