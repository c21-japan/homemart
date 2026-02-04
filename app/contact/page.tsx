'use client'
import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// メインのコンポーネントを分離
function ContactForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyName = searchParams?.get('property') || ''
  const propertyId = searchParams?.get('id') || ''
  
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
      <div className="bg-gradient-to-r from-[#121212] to-[#252526] py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-transparent to-[#BEAF87]/10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="text-sm font-medium text-[#BEAF87] uppercase tracking-widest mb-4">CONTACT US</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">お問い合わせ</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            不動産のプロが親身になってお応えします。<br />
            お気軽にご相談ください。
          </p>
        </div>
      </div>

      {/* パンくず */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="text-sm">
          <Link href="/" className="text-[#BEAF87] hover:text-[#746649] transition-colors">トップ</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">お問い合わせ</span>
        </nav>
      </div>

      {/* お問い合わせ方法 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[#121212]">3つの相談方法</h2>
            <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
            <p className="text-lg text-[#727273] max-w-2xl mx-auto">
              お客様のご都合に合わせて、お好きな方法でご相談いただけます
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border-2 border-gray-100 rounded-xl p-8 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-[#BEAF87]">
              <div className="w-20 h-20 bg-[#F8F7F2] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📞</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#121212]">お電話</h3>
              <p className="text-gray-600 mb-6">
                お急ぎの方、直接お話しされたい方におすすめです。
              </p>
              <div className="mb-6">
                <p className="text-3xl font-bold text-[#517394] mb-2">0120-43-8639</p>
                <p className="text-sm text-[#727273]">通話料無料</p>
              </div>
              <a 
                href="tel:0120438639" 
                className="inline-flex items-center justify-center px-6 py-3 bg-[#517394] text-white rounded-full font-semibold hover:bg-[#6E8FAF] transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="mr-2">📞</span>
                今すぐ電話する
              </a>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-xl p-8 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-[#BEAF87]">
              <div className="w-20 h-20 bg-[#F8F7F2] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📧</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#121212]">メール</h3>
              <p className="text-gray-600 mb-6">
                24時間受付。翌営業日までにご返信いたします。
              </p>
              <div className="mb-6">
                <p className="font-semibold text-[#121212]">24時間受付</p>
                <p className="text-sm text-[#727273]">営業時間内に折り返しご連絡いたします</p>
              </div>
              <a 
                href="#contact-form" 
                className="inline-flex items-center justify-center px-6 py-3 bg-[#517394] text-white rounded-full font-semibold hover:bg-[#6E8FAF] transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="mr-2">📝</span>
                フォームで相談する
              </a>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-xl p-8 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-[#BEAF87]">
              <div className="w-20 h-20 bg-[#F8F7F2] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🏢</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#121212]">来店</h3>
              <p className="text-gray-600 mb-6">
                直接お越しいただいて、じっくりご相談いただけます。
              </p>
              <div className="mb-6">
                <p className="font-semibold text-[#121212]">〒635-0821</p>
                <p className="text-sm text-[#727273]">奈良県北葛城郡広陵町笠287-1</p>
                <p className="text-sm text-[#8D312E] mt-2">※事前予約をお勧めします</p>
              </div>
              <a 
                href="#access" 
                className="inline-flex items-center justify-center px-6 py-3 bg-[#517394] text-white rounded-full font-semibold hover:bg-[#6E8FAF] transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="mr-2">🗺️</span>
                アクセスを見る
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 営業時間・対応体制 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[#121212]">営業時間・対応体制</h2>
            <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
            <p className="text-lg text-[#727273] max-w-2xl mx-auto">
              社長直結だから実現できる、迅速で柔軟な対応
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold mb-3 text-[#121212]">平日</h3>
              <div className="text-2xl font-bold text-[#517394] mb-2">9:00 - 18:00</div>
              <p className="text-sm text-[#727273]">月曜日〜金曜日</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold mb-3 text-[#121212]">土日祝</h3>
              <div className="text-2xl font-bold text-[#517394] mb-2">10:00 - 17:00</div>
              <p className="text-sm text-[#727273]">水曜日定休</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold mb-3 text-[#121212]">お客様専用</h3>
              <div className="text-2xl font-bold text-[#517394] mb-2">9:00 - 22:00</div>
              <p className="text-sm text-[#727273]">年中無休対応</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold mb-3 text-[#121212]">緊急時</h3>
              <div className="text-2xl font-bold text-[#517394] mb-2">24時間</div>
              <p className="text-sm text-[#727273]">契約済みのお客様限定</p>
            </div>
          </div>
        </div>
      </section>

      {/* フォーム */}
      <section className="py-20 bg-white" id="contact-form">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[#121212]">お問い合わせフォーム</h2>
            <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
            <p className="text-lg text-[#727273] max-w-2xl mx-auto">
              以下のフォームにご記入いただき、送信してください
            </p>
          </div>
          
          <div className="bg-white border-2 border-gray-100 rounded-xl shadow-lg p-8">
            {propertyName && (
              <div className="bg-[#F8F7F2] border border-[#BEAF87] p-4 rounded-lg mb-8">
                <p className="text-sm text-[#121212]">
                  物件：<span className="font-bold">{propertyName}</span> についてのお問い合わせ
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#121212]">
                    お名前 <span className="text-[#8D312E]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#517394] focus:border-[#517394] transition-all duration-300"
                    placeholder="山田 太郎"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#121212]">
                    電話番号 <span className="text-[#8D312E]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#517394] focus:border-[#517394] transition-all duration-300"
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-[#121212]">
                  メールアドレス
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#517394] focus:border-[#517394] transition-all duration-300"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-[#121212]">
                  お問い合わせ内容 <span className="text-[#8D312E]">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#517394] focus:border-[#517394] transition-all duration-300 resize-vertical"
                  placeholder="ご質問やご要望をお書きください"
                />
              </div>

              <div className="bg-[#F8F7F2] border border-[#BEAF87] rounded-lg p-6 mb-8">
                <p className="text-sm text-[#121212]">
                  <span className="font-bold">個人情報の取り扱いについて</span><br />
                  ご記入いただいた個人情報は、お問い合わせへの対応およびご連絡のためにのみ使用し、
                  適切に管理いたします。
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-4 px-8 rounded-full font-semibold text-lg transition-all duration-300 ${
                    isSubmitting 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-[#517394] text-white hover:bg-[#6E8FAF] transform hover:-translate-y-1 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? '送信中...' : '送信する'}
                </button>
                <Link
                  href="/"
                  className="flex-1 bg-gray-300 text-gray-700 py-4 px-8 rounded-full hover:bg-gray-400 font-semibold text-lg text-center transition-all duration-300"
                >
                  キャンセル
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* アクセス情報 */}
      <section className="py-20 bg-gray-50" id="access">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[#121212]">アクセス情報</h2>
            <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
            <p className="text-lg text-[#727273] max-w-2xl mx-auto">
              お気軽にお立ち寄りください
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-8 text-[#121212]">店舗情報</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-6 h-6 text-[#BEAF87] mr-4 mt-1 flex-shrink-0">📍</div>
                  <div>
                    <h4 className="font-semibold text-[#121212] mb-1">住所</h4>
                    <p className="text-[#727273]">〒635-0821<br />奈良県北葛城郡広陵町笠287-1</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 text-[#BEAF87] mr-4 mt-1 flex-shrink-0">🚇</div>
                  <div>
                    <h4 className="font-semibold text-[#121212] mb-1">最寄り駅</h4>
                    <p className="text-[#727273]">近鉄田原本線「築山駅」徒歩12分<br />JR和歌山線「高田駅」車で8分</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 text-[#BEAF87] mr-4 mt-1 flex-shrink-0">🚗</div>
                  <div>
                    <h4 className="font-semibold text-[#121212] mb-1">駐車場</h4>
                    <p className="text-[#727273]">店舗前に3台完備<br />お車でお越しの際はお気軽にどうぞ</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 text-[#BEAF87] mr-4 mt-1 flex-shrink-0">⏰</div>
                  <div>
                    <h4 className="font-semibold text-[#121212] mb-1">営業時間</h4>
                    <p className="text-[#727273]">平日：9:00〜18:00 / 土日祝：10:00〜17:00<br />定休日：水曜日</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 text-[#BEAF87] mr-4 mt-1 flex-shrink-0">📞</div>
                  <div>
                    <h4 className="font-semibold text-[#121212] mb-1">電話番号</h4>
                    <p className="text-[#727273]">0120-43-8639（通話料無料）<br />お気軽にお電話ください</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 text-[#BEAF87] mr-4 mt-1 flex-shrink-0">✉️</div>
                  <div>
                    <h4 className="font-semibold text-[#121212] mb-1">メールアドレス</h4>
                    <p className="text-[#727273]">info@homemart-nara.com<br />24時間受付中</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl text-[#BEAF87] mb-4">🗺️</div>
                <h4 className="text-xl font-semibold mb-4 text-[#121212]">店舗地図</h4>
                <p className="text-[#727273]">詳細な地図は実際のサイトで<br />ご確認いただけます</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* よくあるご質問 */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[#121212]">よくあるご質問</h2>
            <div className="w-20 h-0.5 bg-[#BEAF87] mx-auto mb-6"></div>
            <p className="text-lg text-[#727273] max-w-2xl mx-auto">
              お客様からよく寄せられるご質問にお答えします
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="font-bold mb-3 text-[#121212] flex items-center">
                <span className="text-[#BEAF87] font-bold mr-3">Q.</span>
                査定は無料ですか？
              </h3>
              <p className="text-[#727273] flex items-start">
                <span className="text-[#517394] font-bold mr-3 mt-0.5">A.</span>
                はい、査定は完全無料です。お気軽にご相談ください。
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="font-bold mb-3 text-[#121212] flex items-center">
                <span className="text-[#BEAF87] font-bold mr-3">Q.</span>
                相談だけでも大丈夫ですか？
              </h3>
              <p className="text-[#727273] flex items-start">
                <span className="text-[#517394] font-bold mr-3 mt-0.5">A.</span>
                もちろん大丈夫です。まずはお話をお聞かせください。
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="font-bold mb-3 text-[#121212] flex items-center">
                <span className="text-[#BEAF87] font-bold mr-3">Q.</span>
                営業時間外でも対応可能ですか？
              </h3>
              <p className="text-[#727273] flex items-start">
                <span className="text-[#517394] font-bold mr-3 mt-0.5">A.</span>
                お客様専用ダイヤルは22時まで対応しております。事前予約で時間外対応も可能です。
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="font-bold mb-3 text-[#121212] flex items-center">
                <span className="text-[#BEAF87] font-bold mr-3">Q.</span>
                どのエリアに対応していますか？
              </h3>
              <p className="text-[#727273] flex items-start">
                <span className="text-[#517394] font-bold mr-3 mt-0.5">A.</span>
                奈良県・大阪府全域に対応しております。その他のエリアもご相談ください。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Suspenseで囲んだメインコンポーネント
export default function Contact() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BEAF87] mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    }>
      <ContactForm />
    </Suspense>
  )
}
