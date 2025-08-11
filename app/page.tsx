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
      
      // まずデフォルト画像を設定
      setSiteImages(defaultImages)
      
      // Supabase Storageから画像を取得する処理
      try {
        const { getMediaByCategory } = await import('@/lib/supabase-storage')
        
        if (getMediaByCategory) {
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
      } catch (storageError) {
        console.log('Supabase Storage not available, using placeholder images')
        // ストレージエラーの場合はデフォルト画像のまま
      }
    } catch (error) {
      console.error('Error loading site images:', error)
      // エラー時はプレースホルダー画像を使用
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            {/* ロゴエリア */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] p-2 rounded">
                <span className="text-black font-bold text-xl">CENTURY 21</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">ホームマート</h1>
                <p className="text-xs text-gray-600">奈良県北葛城郡の不動産売買</p>
              </div>
            </div>

            {/* 連絡先 */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-600">お気軽にお問い合わせください</p>
                <a href="tel:0120-43-8639" className="text-2xl font-bold text-[#FF6B00] hover:text-[#FF8C00]">
                  📞 0120-43-8639
                </a>
                <p className="text-xs text-gray-600">営業時間 9:00〜22:00</p>
              </div>
            </div>
          </div>

          {/* カラフルなナビゲーション */}
          <nav className="flex flex-wrap gap-0 -mx-4 overflow-x-auto">
            <Link href="/" className="nav-tab bg-[#4A90E2] hover:bg-[#5BA0F2]">
              <span className="text-white font-bold px-4 py-2 block">HOME</span>
            </Link>
            <Link href="/properties" className="nav-tab bg-[#FF6B00] hover:bg-[#FF7B10]">
              <span className="text-white font-bold px-4 py-2 block">物件検索</span>
            </Link>
            <Link href="/sell" className="nav-tab bg-[#9B59B6] hover:bg-[#AB69C6]">
              <span className="text-white font-bold px-4 py-2 block">査定・売却</span>
            </Link>
            <Link href="/staff" className="nav-tab bg-[#27AE60] hover:bg-[#37BE70]">
              <span className="text-white font-bold px-4 py-2 block">スタッフ紹介</span>
            </Link>
            <Link href="/voice" className="nav-tab bg-[#E91E63] hover:bg-[#F92E73]">
              <span className="text-white font-bold px-4 py-2 block">お客様の声</span>
            </Link>
            <Link href="/about" className="nav-tab bg-[#3498DB] hover:bg-[#44A8EB]">
              <span className="text-white font-bold px-4 py-2 block">会社概要</span>
            </Link>
            <Link href="/contact" className="nav-tab bg-[#2ECC71] hover:bg-[#3EDC81]">
              <span className="text-white font-bold px-4 py-2 block">お問い合わせ</span>
            </Link>
          </nav>
        </div>
      </header>

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

      {/* 物件検索セクション */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">物件を探す</h2>
            <p className="text-gray-600">ご希望の条件から物件をお探しください</p>
          </div>

                     {/* 検索タブ */}
           <div className="flex justify-center gap-4 mb-8">
             <button className="px-6 py-3 rounded-full font-bold transition bg-[#FF6B00] text-white">
               種別で探す
             </button>
             <button className="px-6 py-3 rounded-full font-bold transition bg-white text-gray-700 hover:bg-gray-100">
               エリアで探す
             </button>
           </div>

          {/* カテゴリーカード */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link href="/properties?type=新築戸建" className="property-card bg-[#4A90E2] hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="p-6 text-center text-white">
                <div className="text-5xl mb-4">🏡</div>
                <h3 className="text-xl font-bold mb-2">新築戸建</h3>
                <p className="text-sm opacity-90">最新の設備と快適な住環境</p>
              </div>
            </Link>

            <Link href="/properties?type=中古戸建" className="property-card bg-[#FF6B00] hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="p-6 text-center text-white">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="text-xl font-bold mb-2">中古戸建</h3>
                <p className="text-sm opacity-90">リフォーム済みの優良物件</p>
              </div>
            </Link>

            <Link href="/properties?type=マンション" className="property-card bg-[#E91E63] hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="p-6 text-center text-white">
                <div className="text-5xl mb-4">🏢</div>
                <h3 className="text-xl font-bold mb-2">マンション</h3>
                <p className="text-sm opacity-90">便利な立地の集合住宅</p>
              </div>
            </Link>

            <Link href="/properties?type=土地" className="property-card bg-[#27AE60] hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="p-6 text-center text-white">
                <div className="text-5xl mb-4">🏞️</div>
                <h3 className="text-xl font-bold mb-2">売り土地</h3>
                <p className="text-sm opacity-90">理想の家を建てる土地</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 新着情報セクション */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">新着情報</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <span className="bg-[#FF6B00] text-white text-xs px-3 py-1 rounded-full font-bold">重要</span>
                <div className="flex-1">
                  <p className="font-bold">年末年始の営業について</p>
                  <p className="text-sm text-gray-600 mt-1">12月29日〜1月3日は休業とさせていただきます</p>
                </div>
                <span className="text-sm text-gray-500">2024.12.15</span>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <span className="bg-[#4A90E2] text-white text-xs px-3 py-1 rounded-full font-bold">お知らせ</span>
                <div className="flex-1">
                  <p className="font-bold">センチュリー21広陵店オープン</p>
                  <p className="text-sm text-gray-600 mt-1">2025年3月に広陵店をオープン予定です</p>
                </div>
                <span className="text-sm text-gray-500">2024.12.10</span>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <span className="bg-[#27AE60] text-white text-xs px-3 py-1 rounded-full font-bold">キャンペーン</span>
                <div className="flex-1">
                  <p className="font-bold">リフォーム相談会開催</p>
                  <p className="text-sm text-gray-600 mt-1">水回り4点セットの特別価格キャンペーン実施中</p>
                </div>
                <span className="text-sm text-gray-500">2024.12.05</span>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/news" className="text-[#FF6B00] hover:underline font-bold">
                すべてのお知らせを見る →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* サービス紹介セクション */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">私たちのサービス</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 不動産売買 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-r from-[#4A90E2] to-[#5BA0F2] flex items-center justify-center">
                <span className="text-white text-6xl">🏠</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">不動産売買</h3>
                <p className="text-gray-600 mb-4">
                  センチュリー21の全国ネットワークを活用し、
                  お客様の理想の物件探しから売却まで、
                  経験豊富なスタッフが丁寧にサポートいたします。
                </p>
                <Link href="/properties" className="text-[#4A90E2] font-bold hover:underline">
                  詳しく見る →
                </Link>
              </div>
            </div>

            {/* リフォーム */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] flex items-center justify-center">
                <span className="text-white text-6xl">🔨</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">リフォーム</h3>
                <p className="text-gray-600 mb-4">
                  水回り4点セットから全面改装まで、
                  自社職人による確かな技術で、
                  お客様の理想の住まいを実現します。
                </p>
                <Link href="/reform" className="text-[#FF6B00] font-bold hover:underline">
                  詳しく見る →
                </Link>
              </div>
            </div>

            {/* 買取再販 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-r from-[#27AE60] to-[#37BE70] flex items-center justify-center">
                <span className="text-white text-6xl">💰</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">買取再販（URICO）</h3>
                <p className="text-gray-600 mb-4">
                  独自のURICO制度により、
                  純利益の80%をお客様に還元。
                  最大限の利益をお約束します。
                </p>
                <Link href="/urico" className="text-[#27AE60] font-bold hover:underline">
                  詳しく見る →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特別プロモーション */}
      <section className="py-16 bg-[#FFF3E0]">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 flex flex-col justify-center">
                <div className="bg-[#FF6B00] text-white text-sm px-4 py-2 rounded-full inline-block w-fit mb-4">
                  期間限定キャンペーン
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  リフォーム相談会開催中！
                </h2>
                <p className="text-gray-600 mb-6">
                  今なら水回り4点セット（キッチン・バス・トイレ・洗面）の
                  リフォームが特別価格でご提供。
                  まずは無料相談から始めませんか？
                </p>
                <div className="flex gap-4">
                  <Link href="/contact" className="bg-[#FF6B00] text-white px-6 py-3 rounded-full font-bold hover:bg-[#FF7B10] transition">
                    無料相談を申し込む
                  </Link>
                  <a href="tel:0120-43-8639" className="border-2 border-[#FF6B00] text-[#FF6B00] px-6 py-3 rounded-full font-bold hover:bg-[#FF6B00] hover:text-white transition">
                    電話で相談
                  </a>
                </div>
              </div>
              <div className="relative h-64 md:h-auto">
                <Image
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
                  alt="リフォーム"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 実績セクション */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">選ばれる理由</h2>
          
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

            <div className="text-center group hover:transform hover:scale-110 transition-all">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#B8860B] mb-2">
                80%
              </div>
              <p className="text-gray-700 font-medium">利益還元80%</p>
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
