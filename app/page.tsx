'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Property {
  id: string
  name: string
  price: number
  property_type: string
  prefecture: string
  city: string
  staff_comment?: string
  image_url?: string
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProperties()
  }, [])

  const fetchFeaturedProperties = async () => {
    try {
      // おすすめ物件を優先的に取得（画像URLがある物件を優先）
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .limit(6)

      if (error) throw error
      
      // 画像URLがある物件を先頭に並べ替え
      const sortedProperties = (data || []).sort((a, b) => {
        if (a.image_url && !b.image_url) return -1
        if (!a.image_url && b.image_url) return 1
        return 0
      })
      
      setProperties(sortedProperties)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* メインビジュアル */}
      <section className="relative bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF6B00] py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="mb-8">
              <div className="inline-block bg-white/20 backdrop-blur px-6 py-2 rounded-full mb-6">
                <span className="text-white font-bold">センチュリー21加盟店 全国964店舗</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                奈良で選ばれ続けて10年
              </h2>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                お客様の悩みや不安を解決し<br />
                人生の転機を支える存在でありたい
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/properties" className="bg-white text-[#FF6B00] px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition">
                🏠 物件を探す
              </Link>
              <Link href="/sell" className="bg-white/20 backdrop-blur text-white border-2 border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#FF6B00] transition">
                📋 無料査定を申し込む
              </Link>
              <a href="tel:0120-43-8639" className="bg-white/20 backdrop-blur text-white border-2 border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#FF6B00] transition">
                📞 今すぐ電話相談
              </a>
            </div>
          </div>
        </div>
        
        {/* 装飾的な波形 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-20">
            <path fill="#ffffff" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* 3つの強み */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">ホームマートの3つの強み</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition">
                <span className="text-5xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold mb-3">全国ネットワーク</h3>
              <p className="text-gray-600">
                センチュリー21の全国964店舗のネットワークを活用し、
                お客様の物件を幅広く紹介
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-[#4A90E2] to-[#5BA0F2] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition">
                <span className="text-5xl">🔨</span>
              </div>
              <h3 className="text-xl font-bold mb-3">自社職人施工</h3>
              <p className="text-gray-600">
                水回り4点セットから全面改装まで、
                自社職人による確かな技術で対応
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-[#27AE60] to-[#37BE70] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition">
                <span className="text-5xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-3">URICO制度</h3>
              <p className="text-gray-600">
                独自の買取再販制度で、
                純利益の80%をお客様に還元
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 物件検索 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">物件を探す</h2>
            <p className="text-gray-600">ご希望の条件から理想の物件をお探しください</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Link href="/properties?type=新築戸建" className="group">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition p-6 text-center">
                <div className="text-4xl mb-3">🏡</div>
                <h3 className="font-bold text-gray-800">新築戸建</h3>
                <p className="text-sm text-gray-600 mt-1">最新設備の家</p>
              </div>
            </Link>
            
            <Link href="/properties?type=中古戸建" className="group">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition p-6 text-center">
                <div className="text-4xl mb-3">🏠</div>
                <h3 className="font-bold text-gray-800">中古戸建</h3>
                <p className="text-sm text-gray-600 mt-1">リフォーム済み</p>
              </div>
            </Link>
            
            <Link href="/properties?type=マンション" className="group">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition p-6 text-center">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="font-bold text-gray-800">マンション</h3>
                <p className="text-sm text-gray-600 mt-1">便利な立地</p>
              </div>
            </Link>
            
            <Link href="/properties?type=土地" className="group">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition p-6 text-center">
                <div className="text-4xl mb-3">🏞️</div>
                <h3 className="font-bold text-gray-800">売り土地</h3>
                <p className="text-sm text-gray-600 mt-1">理想の場所</p>
              </div>
            </Link>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/properties" className="inline-flex items-center bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition">
              すべての物件を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* おすすめ物件 */}
      {properties.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">おすすめ物件</h2>
              <p className="text-gray-600">スタッフが厳選した今週のおすすめ</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {properties.slice(0, 3).map((property) => (
                <Link key={property.id} href={`/properties/${property.id}`} className="group">
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden relative property-image-container">
                      {property.image_url ? (
                        <>
                          <img
                            src={property.image_url}
                            alt={property.name}
                            className="property-image"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const fallback = target.nextElementSibling as HTMLElement
                              if (fallback) fallback.style.display = 'flex'
                            }}
                            loading="lazy"
                          />
                          <span className="text-6xl text-gray-400 absolute" style={{ display: 'none' }}>🏠</span>
                        </>
                      ) : (
                        <span className="text-6xl text-gray-400">🏠</span>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-[#FFD700] text-black text-xs px-2 py-1 rounded font-bold">おすすめ</span>
                        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">{property.property_type}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{property.name}</h3>
                      <p className="text-2xl font-bold text-[#FF6B00] mb-2">
                        {property.price.toLocaleString()}万円
                      </p>
                      <p className="text-sm text-gray-600">
                        {property.prefecture} {property.city}
                      </p>
                      {property.staff_comment && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded text-sm">
                          💬 {property.staff_comment}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* サービス紹介 */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">サービス内容</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="w-16 h-16 bg-[#4A90E2] rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-bold mb-3">不動産売買</h3>
              <p className="text-gray-600 mb-4">
                売却・購入のご相談から契約まで、経験豊富なスタッフが丁寧にサポート
              </p>
              <Link href="/properties" className="text-[#4A90E2] font-bold hover:underline">
                詳しく見る →
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="w-16 h-16 bg-[#FF6B00] rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔨</span>
              </div>
              <h3 className="text-xl font-bold mb-3">リフォーム</h3>
              <p className="text-gray-600 mb-4">
                水回り4点セットから全面改装まで、自社職人による確かな施工
              </p>
              <Link href="/contact" className="text-[#FF6B00] font-bold hover:underline">
                詳しく見る →
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="w-16 h-16 bg-[#27AE60] rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-3">買取再販（URICO）</h3>
              <p className="text-gray-600 mb-4">
                独自のURICO制度で純利益の80%還元。お客様に最大限の利益を
              </p>
              <Link href="/contact" className="text-[#27AE60] font-bold hover:underline">
                詳しく見る →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 実績 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">数字で見るホームマート</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#FFD700] mb-2">964</div>
              <p className="text-sm text-gray-600">全国店舗数<br />日本一</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#4A90E2] mb-2">10年</div>
              <p className="text-sm text-gray-600">創業からの<br />信頼と実績</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#27AE60] mb-2">100%</div>
              <p className="text-sm text-gray-600">お客様<br />満足度</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#FF6B00] mb-2">80%</div>
              <p className="text-sm text-gray-600">URICO制度<br />利益還元率</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#FFD700] to-[#FFA500]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">まずはお気軽にご相談ください</h2>
          <p className="text-xl text-white/90 mb-8">不動産のプロが親身になってお応えします</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:0120-43-8639" className="bg-white text-[#FF6B00] px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition">
              📞 0120-43-8639
            </a>
            <Link href="/contact" className="bg-white/20 backdrop-blur text-white border-2 border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#FF6B00] transition">
              お問い合わせフォーム
            </Link>
          </div>
          
          <p className="text-white/80 mt-6">営業時間: 9:00〜22:00 | 土日祝も対応</p>
        </div>
      </section>

    </div>
  )
}
