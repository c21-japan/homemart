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

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('buy')

  useEffect(() => {
    fetchFeaturedProperties()
  }, [])

  const fetchFeaturedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .limit(8)

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
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

      {/* メインビジュアル - 4分割グリッド */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="grid grid-cols-2 grid-rows-2 h-full">
          <div className="relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800"
              alt="奈良の風景"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
              alt="住宅街"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800"
              alt="奈良公園"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=800"
              alt="桜と寺"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* 中央メッセージボックス */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 p-8 rounded-lg shadow-2xl text-center max-w-xl">
          <div className="w-20 h-20 bg-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🏠</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            お客様の悩みや不安を解決し<br />
            人生の転機を支える存在でありたい
          </h2>
          <p className="text-gray-600 mb-6">
            センチュリー21ホームマートは、奈良県北葛城郡を中心に<br />
            地域密着で10年、お客様の理想の住まい探しをサポートします
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/properties" className="bg-[#FF6B00] text-white px-6 py-3 rounded-full font-bold hover:bg-[#FF7B10] transition">
              物件を探す
            </Link>
            <Link href="/sell" className="bg-[#9B59B6] text-white px-6 py-3 rounded-full font-bold hover:bg-[#AB69C6] transition">
              無料査定
            </Link>
          </div>
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
            <button
              onClick={() => setActiveTab('buy')}
              className={`px-6 py-3 rounded-full font-bold transition ${
                activeTab === 'buy' 
                  ? 'bg-[#FF6B00] text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              種別で探す
            </button>
            <button
              onClick={() => setActiveTab('area')}
              className={`px-6 py-3 rounded-full font-bold transition ${
                activeTab === 'area' 
                  ? 'bg-[#FF6B00] text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">選ばれる理由</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">964</span>
              </div>
              <h3 className="font-bold mb-2">全国964店舗</h3>
              <p className="text-sm text-gray-600">センチュリー21<br />日本一の店舗数</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-[#4A90E2] to-[#5BA0F2] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">10年</span>
              </div>
              <h3 className="font-bold mb-2">創業10年</h3>
              <p className="text-sm text-gray-600">地域密着の<br />信頼と実績</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-[#27AE60] to-[#37BE70] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">100%</span>
              </div>
              <h3 className="font-bold mb-2">満足度100%</h3>
              <p className="text-sm text-gray-600">お客様満足度<br />自社職人施工</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-[#E91E63] to-[#F92E73] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">80%</span>
              </div>
              <h3 className="font-bold mb-2">利益還元80%</h3>
              <p className="text-sm text-gray-600">URICO制度で<br />最大限の還元</p>
            </div>
          </div>
        </div>
      </section>

      {/* お客様の声 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">お客様の声</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FFD700] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                「初めての不動産購入で不安でしたが、乾社長をはじめスタッフの皆様が親身になって相談に乗ってくださいました。」
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#4A90E2] rounded-full flex items-center justify-center text-white font-bold">
                  K
                </div>
                <div>
                  <p className="font-bold">K.T様</p>
                  <p className="text-sm text-gray-600">広陵町・30代</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FFD700] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                「水回りのリフォームをお願いしました。自社職人さんの丁寧な仕事ぶりに感動！価格も良心的でした。」
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF6B00] rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <p className="font-bold">M.S様</p>
                  <p className="text-sm text-gray-600">香芝市・50代</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FFD700] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                「実家の売却でお世話になりました。センチュリー21のネットワークで早期売却でき、満足です。」
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#27AE60] rounded-full flex items-center justify-center text-white font-bold">
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

      {/* フッター固定要素 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 md:hidden">
        <div className="grid grid-cols-3 divide-x">
          <a href="tel:0120-43-8639" className="py-3 text-center hover:bg-gray-50">
            <span className="text-[#FF6B00] font-bold">📞 電話</span>
          </a>
          <Link href="/contact" className="py-3 text-center hover:bg-gray-50">
            <span className="text-[#4A90E2] font-bold">✉️ お問い合わせ</span>
          </Link>
          <Link href="/properties" className="py-3 text-center hover:bg-gray-50">
            <span className="text-[#27AE60] font-bold">🏠 物件検索</span>
          </Link>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">センチュリー21 ホームマート</h3>
              <p className="text-sm text-gray-400">
                〒635-0821<br />
                奈良県北葛城郡広陵町笠287-1<br />
                TEL: 0120-43-8639<br />
                営業時間: 9:00〜22:00
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">サービス</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/properties" className="hover:text-white">物件検索</Link></li>
                <li><Link href="/sell" className="hover:text-white">売却査定</Link></li>
                <li><Link href="/reform" className="hover:text-white">リフォーム</Link></li>
                <li><Link href="/urico" className="hover:text-white">買取再販（URICO）</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">会社情報</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">会社概要</Link></li>
                <li><Link href="/staff" className="hover:text-white">スタッフ紹介</Link></li>
                <li><Link href="/voice" className="hover:text-white">お客様の声</Link></li>
                <li><Link href="/news" className="hover:text-white">新着情報</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">お問い合わせ</h3>
              <Link href="/contact" className="bg-[#FF6B00] text-white px-6 py-3 rounded-full font-bold hover:bg-[#FF7B10] transition inline-block mb-4">
                お問い合わせフォーム
              </Link>
              <p className="text-sm text-gray-400">
                お電話でのお問い合わせ<br />
                <a href="tel:0120-43-8639" className="text-xl text-[#FF6B00] hover:text-[#FF8C00]">
                  0120-43-8639
                </a>
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 CENTURY 21 HomeMart. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
