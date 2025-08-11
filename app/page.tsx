'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

interface SiteImages {
  ceo: string
  hero: string
  character: string
  shiro: string
  modelRoom: string
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [siteImages, setSiteImages] = useState<SiteImages>({
    ceo: 'https://via.placeholder.com/500x600/FFD700/000?text=代表写真',
    hero: 'https://via.placeholder.com/1920x1080/FFD700/000?text=ヒーロー画像',
    character: 'https://via.placeholder.com/150x150/FFD700/000?text=キャラクター',
    shiro: 'https://via.placeholder.com/80x80/FFD700/000?text=シロ',
    modelRoom: 'https://via.placeholder.com/1200x800/FFD700/000?text=モデルルーム'
  })

  useEffect(() => {
    fetchFeaturedProperties()
    loadSiteImages()
  }, [])

  const fetchFeaturedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .not('staff_comment', 'is', null)
        .limit(6)

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSiteImages = async () => {
    try {
      // デフォルトのプレースホルダー画像を設定
      const defaultImages = {
        ceo: 'https://via.placeholder.com/500x600/FFD700/000?text=代表写真',
        hero: 'https://via.placeholder.com/1920x1080/FFD700/000?text=ヒーロー画像',
        character: 'https://via.placeholder.com/150x150/FFD700/000?text=キャラクター',
        shiro: 'https://via.placeholder.com/80x80/FFD700/000?text=シロ',
        modelRoom: 'https://via.placeholder.com/1200x800/FFD700/000?text=モデルルーム'
      }
      
      setSiteImages(defaultImages)
      
      // Supabase Storageから画像を取得する処理（動的インポート）
      try {
        const storageModule = await import('@/lib/supabase-storage').catch(() => null)
        
        if (storageModule && storageModule.getMediaByCategory) {
          const { getMediaByCategory } = storageModule
          
          const [ceoImages, heroImages, characterImages, modelRoomImages] = await Promise.all([
            getMediaByCategory('ceo').catch(() => []),
            getMediaByCategory('hero').catch(() => []),
            getMediaByCategory('characters').catch(() => []),
            getMediaByCategory('model-room').catch(() => [])
          ])
          
          // 取得した画像があれば更新
          setSiteImages({
            ceo: ceoImages[0]?.url || defaultImages.ceo,
            hero: heroImages[0]?.url || defaultImages.hero,
            character: characterImages.find((img: any) => img.name?.includes('shin'))?.url || 
                      characterImages[0]?.url || 
                      defaultImages.character,
            shiro: characterImages.find((img: any) => img.name?.includes('shiro'))?.url || 
                   characterImages[1]?.url || 
                   defaultImages.shiro,
            modelRoom: modelRoomImages[0]?.url || defaultImages.modelRoom
          })
        }
      } catch (error) {
        console.log('Supabase Storage is not configured yet, using placeholder images')
      }
    } catch (error) {
      console.error('Error loading site images:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* ヒーローセクション */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={siteImages.hero}
            alt="ヒーロー画像"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/80 to-[#B8860B]/80"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* キャラクター配置 */}
        <div className="absolute top-10 right-10 z-20 animate-bounce">
          <div className="relative">
            <Image 
              src={siteImages.character}
              alt="ホームマートくん" 
              width={150} 
              height={150}
              className="drop-shadow-2xl"
            />
            <div className="absolute -bottom-8 -left-20 bg-white rounded-full px-4 py-2 shadow-lg">
              <p className="text-sm font-bold text-[#B8860B]">お家探しなら任せるゾ〜！</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white p-2 rounded">
                  <p className="text-2xl font-bold text-[#B8860B]">センチュリー21</p>
                </div>
                <span className="text-white text-2xl font-bold">ホームマート</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                奈良で選ばれ続けて<br />
                <span className="text-[#FFD700]">10年の信頼</span>
              </h1>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                センチュリー21加盟店 日本一の964店舗ネットワーク<br />
                不動産売買からリフォームまでワンストップサービス
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/properties" className="group relative overflow-hidden bg-white text-[#B8860B] px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all">
                  <span className="relative z-10">物件を探す</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#FFA500] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Link>
                
                <a href="tel:0120-43-8639" className="bg-white/20 backdrop-blur text-white border-2 border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#B8860B] transition-all">
                  📞 0120-43-8639
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* スクロールインジケーター */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* 実績セクション */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group hover:transform hover:scale-110 transition-all">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#B8860B] mb-2">
                964
              </div>
              <p className="text-gray-700 font-medium">センチュリー21<br />日本一の店舗数</p>
            </div>
            
            <div className="text-center group hover:transform hover:scale-110 transition-all">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#B8860B] mb-2">
                10年
              </div>
              <p className="text-gray-700 font-medium">地域密着の<br />信頼と実績</p>
            </div>
            
            <div className="text-center group hover:transform hover:scale-110 transition-all">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#B8860B] mb-2">
                100%
              </div>
              <p className="text-gray-700 font-medium">お客様満足度<br />自社職人施工</p>
            </div>
          </div>
        </div>
      </section>

      {/* 代表メッセージセクション */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#FFD700] rounded-full opacity-20"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#B8860B] rounded-full opacity-20"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <Image 
                    src={siteImages.ceo}
                    alt="代表取締役 乾佑企" 
                    width={500} 
                    height={600}
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h3 className="text-white text-2xl font-bold">乾 佑企</h3>
                    <p className="text-white/90">代表取締役</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-4xl font-bold mb-6 text-gray-800">
                  代表からのメッセージ
                </h2>
                <div className="bg-gradient-to-r from-[#FFD700] to-[#B8860B] h-1 w-20 mb-6"></div>
                
                <p className="text-xl text-[#B8860B] font-bold mb-6 leading-relaxed">
                  「お客様の悩みや不安を解決し、<br />
                  人生の転機を支える存在でありたい」
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  私たちホームマートは、2014年の創業以来、奈良県北葛城郡を中心に
                  地域の皆様の不動産・住まいに関するあらゆるご相談に対応してまいりました。
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  センチュリー21の全国ネットワークと、地域密着の細やかなサービスを融合し、
                  お客様一人ひとりに最適なご提案をお約束いたします。
                </p>
                
                <p className="text-gray-700 leading-relaxed">
                  不動産売買からリフォームまで、住まいのことなら何でもお任せください。
                  私たちが全力でサポートいたします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* サービスセクション */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">サービス一覧</h2>
          <p className="text-center text-gray-600 mb-12">不動産のことなら何でもお任せください</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] rounded-full -mr-16 -mt-16 opacity-20"></div>
              <div className="relative p-8">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">不動産売買</h3>
                <p className="text-gray-600 mb-4">
                  売却・購入のご相談から契約まで、経験豊富なスタッフが丁寧にサポート
                </p>
                <Link href="/properties" className="inline-flex items-center text-[#B8860B] font-bold hover:gap-3 transition-all gap-2">
                  詳しく見る
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B8860B] rounded-full -mr-16 -mt-16 opacity-20"></div>
              <div className="relative p-8">
                <div className="text-5xl mb-4">🔨</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">リフォーム</h3>
                <p className="text-gray-600 mb-4">
                  水回り4点セットから全面改装まで、自社職人による確かな施工
                </p>
                <Link href="#reform" className="inline-flex items-center text-[#B8860B] font-bold hover:gap-3 transition-all gap-2">
                  詳しく見る
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] rounded-full -mr-16 -mt-16 opacity-20"></div>
              <div className="relative p-8">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">買取再販</h3>
                <p className="text-gray-600 mb-4">
                  URICO制度で純利益の80%還元。お客様に最大限の利益を
                </p>
                <Link href="#urico" className="inline-flex items-center text-[#B8860B] font-bold hover:gap-3 transition-all gap-2">
                  詳しく見る
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* おすすめ物件セクション */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">おすすめ物件</h2>
          <p className="text-center text-gray-600 mb-12">スタッフが厳選した今週のおすすめ</p>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
              <p className="mt-4 text-gray-600">物件情報を読み込み中...</p>
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {properties.map((property) => (
                <Link key={property.id} href={`/properties/${property.id}`} className="group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
                    <div className="relative h-48 bg-gradient-to-r from-[#FFD700] to-[#B8860B]">
                      {property.image_url ? (
                        <Image 
                          src={property.image_url} 
                          alt={property.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-white text-6xl">🏠</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-[#FFD700] text-black px-3 py-1 rounded-full text-sm font-bold">
                        おすすめ
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2 text-gray-800">{property.name}</h3>
                      <p className="text-3xl font-bold text-[#B8860B] mb-2">
                        {property.price.toLocaleString()}万円
                      </p>
                      <p className="text-gray-600 text-sm mb-3">
                        {property.prefecture} {property.city} / {property.property_type}
                      </p>
                      {property.staff_comment && (
                        <div className="bg-yellow-50 border-l-4 border-[#FFD700] p-3">
                          <p className="text-sm text-gray-700">{property.staff_comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-600">現在おすすめ物件を準備中です</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/properties" className="inline-flex items-center bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all transform hover:scale-105">
              すべての物件を見る
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* お客様の声セクション */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">お客様の声</h2>
          <p className="text-center text-gray-600 mb-12">たくさんの喜びの声をいただいています</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FFD700] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                「初めての不動産購入で不安でしたが、乾社長をはじめスタッフの皆様が親身になって相談に乗ってくださいました。理想の物件に出会えて感謝しています。」
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-white font-bold">
                  K
                </div>
                <div>
                  <p className="font-bold">K.T様</p>
                  <p className="text-sm text-gray-600">広陵町・30代</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FFD700] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                「水回りのリフォームをお願いしました。自社職人さんの丁寧な仕事ぶりに感動！価格も良心的で、次回もぜひお願いしたいです。」
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#B8860B] rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <p className="font-bold">M.S様</p>
                  <p className="text-sm text-gray-600">香芝市・50代</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FFD700] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                「実家の売却でお世話になりました。センチュリー21のネットワークで早期売却でき、価格も満足です。信頼できる会社です。」
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-white font-bold">
                  Y
                </div>
                <div>
                  <p className="font-bold">Y.N様</p>
                  <p className="text-sm text-gray-600">大和高田市・40代</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-20 bg-gradient-to-r from-[#FFD700] to-[#B8860B]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              まずはお気軽にご相談ください
            </h2>
            <p className="text-white/90 text-xl mb-12">
              不動産のプロが親身になってお応えします
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="text-5xl mb-4">📞</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">お電話でのご相談</h3>
                <a href="tel:0120-43-8639" className="text-4xl font-bold text-[#B8860B] hover:text-[#FFD700] transition-colors">
                  0120-43-8639
                </a>
                <p className="text-gray-600 mt-2">受付時間: 9:00〜22:00</p>
                <p className="text-sm text-gray-500 mt-2">土日祝日も対応</p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">モデルルーム見学</h3>
                <div className="mb-4 rounded-lg overflow-hidden h-32 relative">
                  <Image
                    src={siteImages.modelRoom}
                    alt="モデルルーム"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-lg text-gray-700 mb-4">
                  159.8㎡の広々2LDK
                </p>
                <Link href="/contact" className="inline-block bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all">
                  見学予約する
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フッターキャラクター */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-8">
            <Image 
              src={siteImages.shiro}
              alt="シロ" 
              width={80} 
              height={80}
              className="animate-bounce"
            />
            <p className="text-gray-600 text-sm">
              © 2024 センチュリー21 ホームマート All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
