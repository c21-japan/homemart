'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Head from 'next/head'

interface ReformProject {
  id: string
  title: string
  before_image_url: string
  after_image_url: string
  description?: string
  created_at: string
}

export default function ReformPage() {
  const [projects, setProjects] = useState<ReformProject[]>([])
  const [loading, setLoading] = useState(true)
  const [showContactModal, setShowContactModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    reformType: '',
    budget: '',
    message: ''
  })
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchReformProjects()
  }, [])

  const fetchReformProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('reform_projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching reform projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // エラーをクリア
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      errors.name = 'お名前を入力してください'
    }
    
    if (!formData.phone.trim()) {
      errors.phone = '電話番号を入力してください'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスを入力してください'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '正しいメールアドレスを入力してください'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // ここで実際のAPI呼び出しを行う
      // 例: await submitForm(formData)
      
      // 送信完了後の処理
      alert('見積もり依頼を承りました。2営業日以内に担当者よりご連絡いたします。')
      setShowContactModal(false)
      setFormData({
        name: '',
        phone: '',
        email: '',
        reformType: '',
        budget: '',
        message: ''
      })
      setFormErrors({})
    } catch (error) {
      alert('送信に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>リフォーム | CENTURY 21 ホームマート - 自社職人による確かな施工</title>
        <meta name="description" content="CENTURY 21ホームマートのリフォームサービス。自社職人による水回り4点セット（風呂・キッチン・トイレ・洗面台）から全面改装まで、中間マージンカットで適正価格を実現。確かな技術と充実の保証でお客様をサポート。" />
        <meta name="keywords" content="リフォーム,水回り,キッチン,風呂,トイレ,洗面台,自社職人,奈良,大阪,CENTURY21,ホームマート" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* ヒーローセクション */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
          {/* 背景装飾 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-600/10 to-transparent transform rotate-12 scale-150"></div>
          
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block bg-yellow-600 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold mb-6 uppercase tracking-wider">
                リフォームサービス
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                自社職人による<br />
                <span className="text-yellow-400">確かなリフォーム</span>
              </h1>
              <p className="text-xl md:text-2xl mb-12 opacity-90 leading-relaxed max-w-3xl mx-auto">
                水回り4点セットから全面改装まで、<br />
                中間マージンカットで高品質を適正価格で。
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a
                  href="#service-menu"
                  className="bg-yellow-600 hover:bg-yellow-500 text-gray-900 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  料金プランを見る
                </a>
                <a
                  href="tel:0120-43-8639"
                  className="border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-gray-900 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  📞 無料見積もり
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 特徴セクション */}
        <div className="py-20 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                ホームマートのリフォームが選ばれる理由
              </h2>
              <div className="w-20 h-1 bg-yellow-600 mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                自社職人による確かな技術と、お客様第一の姿勢で<br />
                理想のリフォームを実現します
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">自社職人による直接施工</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  経験豊富な自社職人が直接施工を行うため、中間マージンをカット。高い技術力と責任感で、お客様のご要望にお応えします。
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">明確な料金体系</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  価格帯別のパッケージプランで、分かりやすい料金設定。追加費用は事前にご相談し、安心してご依頼いただけます。
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">充実の保証・アフターサービス</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  施工後の保証はもちろん、定期点検やメンテナンスまで対応。長期間にわたってお客様の住まいをサポートします。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 料金プランセクション */}
        <div className="py-20 bg-white" id="service-menu">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                リフォームメニュー・料金
              </h2>
              <div className="w-20 h-1 bg-yellow-600 mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                ご予算に合わせた3つのプランをご用意しております
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* エコノミープラン */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200 relative">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-4">50万円台</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">エコノミープラン</h3>
                  
                  <ul className="text-left space-y-4 mb-8">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">水回り1箇所のリフォーム</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">トイレの便器・クロス交換</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">洗面台の交換</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">ミニキッチンの交換</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">1年保証</span>
                    </li>
                  </ul>
                  
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
                  >
                    詳しく相談する
                  </button>
                </div>
              </div>

              {/* スタンダードプラン（おすすめ） */}
              <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-4 border-2 border-yellow-600 relative transform scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-600 text-gray-900 px-6 py-2 rounded-full text-sm font-bold">
                    おすすめ
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-4">100万円台</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">スタンダードプラン</h3>
                  
                  <ul className="text-left space-y-4 mb-8">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">水回り4点セット</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">キッチン・風呂・トイレ・洗面台</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">内装工事（クロス・床材）</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">電気・給排水工事込み</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">3年保証</span>
                    </li>
                  </ul>
                  
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
                  >
                    詳しく相談する
                  </button>
                </div>
              </div>

              {/* プレミアムプラン */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200 relative">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-4">200万円台</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">プレミアムプラン</h3>
                  
                  <ul className="text-left space-y-4 mb-8">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">全面リノベーション</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">間取り変更可能</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">高級設備・建材使用</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">デザイン提案・設計</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">5年保証</span>
                    </li>
                  </ul>
                  
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
                  >
                    詳しく相談する
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 保証・アフターサービスセクション */}
        <div className="py-20 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                充実の保証・アフターサービス
              </h2>
              <div className="w-20 h-1 bg-yellow-600 mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                施工後も安心してお住まいいただけるよう、<br />
                充実したサポート体制をご用意しております
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">最大5年保証</h3>
                <p className="text-gray-600 leading-relaxed">
                  施工内容に応じて最大5年間の保証をご提供。万が一の不具合にも迅速に対応いたします。
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">定期点検サービス</h3>
                <p className="text-gray-600 leading-relaxed">
                  年1回の定期点検を実施。小さな不具合も早期発見・対応で、長期間快適にお使いいただけます。
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">24時間対応</h3>
                <p className="text-gray-600 leading-relaxed">
                  緊急時は24時間対応。水漏れなどの急なトラブルにも、経験豊富なスタッフが駆けつけます。
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">メンテナンスサポート</h3>
                <p className="text-gray-600 leading-relaxed">
                  定期的なメンテナンス方法のアドバイスから、消耗品の交換まで、長期的にサポートします。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* サービス紹介 */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                リフォームサービス
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                住まいの様々なニーズに対応するリフォームサービスをご提供いたします
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">内装リフォーム</h3>
                <p className="text-gray-600">
                  壁紙、床材、天井材の張り替えから、キッチン、浴室、トイレの設備更新まで
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">外装リフォーム</h3>
                <p className="text-gray-600">
                  外壁塗装、屋根塗装、サイディング張り替えなど、外観の美しさと耐久性を向上
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">設備更新</h3>
                <p className="text-gray-600">
                  給排水設備、電気設備、空調設備の更新で、快適性と安全性を向上
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">断熱・遮熱</h3>
                <p className="text-gray-600">
                  断熱材の施工、窓の二重化などで、省エネ性と快適性を大幅に向上
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">耐震・制震</h3>
                <p className="text-gray-600">
                  耐震補強工事、制震装置の設置で、地震に対する安全性を向上
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">バリアフリー</h3>
                <p className="text-gray-600">
                  手すりの設置、段差の解消などで、高齢者や障がい者に配慮した住まいに
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 施工実績 */}
        <div className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                施工実績
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                お客様のご要望に応じて、数多くのリフォーム工事を手がけてまいりました
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {/* 施工前後の画像を横並びで表示 */}
                    <div className="grid grid-cols-2 gap-0">
                      <div className="relative h-64">
                        <Image
                          src={project.before_image_url}
                          alt={`${project.title} - 施工前`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          施工前
                        </div>
                      </div>
                      <div className="relative h-64">
                        <Image
                          src={project.after_image_url}
                          alt={`${project.title} - 施工後`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          施工後
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-gray-600 mb-4">
                          {project.description}
                        </p>
                      )}
                      <div className="text-sm text-gray-500">
                        施工完了: {new Date(project.created_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">施工実績の準備中です</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA セクション */}
        <div className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
          {/* 背景装飾 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-600/10 to-transparent transform rotate-12 scale-150"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              リフォームのご相談はお気軽に
            </h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed">
              経験豊富なスタッフが、お客様のご要望をお聞きし、<br />
              最適なリフォームプランをご提案いたします。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <a
                href="tel:0120-43-8639"
                className="bg-yellow-600 hover:bg-yellow-500 text-gray-900 px-12 py-5 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                0120-43-8639
              </a>
              <button
                onClick={() => setShowContactModal(true)}
                className="border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-gray-900 px-12 py-5 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                無料見積もり依頼
              </button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-yellow-600 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-yellow-400 font-semibold">営業時間</div>
                  <div className="text-sm opacity-90">9:00〜22:00</div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="bg-yellow-600 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-yellow-400 font-semibold">対応日</div>
                  <div className="text-sm opacity-90">土日祝も対応</div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="bg-yellow-600 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-yellow-400 font-semibold">サービス</div>
                  <div className="text-sm opacity-90">現地調査・見積もり無料</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* お問い合わせモーダル */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">リフォーム無料見積もり依頼</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="山田太郎"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      電話番号 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="090-1234-5678"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="reform-type" className="block text-sm font-semibold text-gray-700 mb-2">
                      リフォーム箇所
                    </label>
                    <select
                      id="reform-type"
                      name="reformType"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      value={formData.reformType}
                      onChange={handleInputChange}
                    >
                      <option value="">選択してください</option>
                      <option value="kitchen">キッチン</option>
                      <option value="bathroom">バスルーム</option>
                      <option value="toilet">トイレ</option>
                      <option value="washroom">洗面台</option>
                      <option value="4set">水回り4点セット</option>
                      <option value="full">全面リノベーション</option>
                      <option value="other">その他</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
                      ご予算
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      value={formData.budget}
                      onChange={handleInputChange}
                    >
                      <option value="">選択してください</option>
                      <option value="50">50万円台</option>
                      <option value="100">100万円台</option>
                      <option value="200">200万円台</option>
                      <option value="300">300万円以上</option>
                      <option value="consultation">相談して決めたい</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    ご要望・ご質問
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="リフォームのご要望やご質問をお聞かせください"
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '送信中...' : '見積もり依頼を送信'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300"
                  >
                    閉じる
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
