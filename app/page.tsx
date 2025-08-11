'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import PropertyCard from '@/components/PropertyCard'

interface Property {
  id: string
  name: string
  price: number
  prefecture: string
  city: string
  address: string
  station?: string
  walking_time?: number
  property_type: string
  land_area?: number
  building_area?: number
  layout?: string
  building_age?: number
  image_url?: string
  images?: string[]
  is_new?: boolean
  staff_comment?: string
  created_at: string
}

export default function Home() {
  const [newProperties, setNewProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  async function fetchProperties() {
    try {
      const { data: newData } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6)

      setNewProperties(newData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* プロフェッショナルヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              {/* ロゴエリア */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <span className="text-3xl md:text-4xl font-bold text-[#C8A400]">C</span>
                    <span className="text-2xl md:text-3xl font-bold text-gray-800">21</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">センチュリー21</p>
                    <p className="text-xs text-gray-600">ホームマート</p>
                  </div>
                </Link>
              </div>

              {/* デスクトップナビゲーション */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/properties" className="text-gray-700 hover:text-[#C8A400] font-medium transition">
                  物件を探す
                </Link>
                <Link href="/sell" className="text-gray-700 hover:text-[#C8A400] font-medium transition">
                  売却査定
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-[#C8A400] font-medium transition">
                  会社案内
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-[#C8A400] font-medium transition">
                  お問い合わせ
                </Link>
              </nav>

              {/* CTA */}
              <div className="flex items-center space-x-4">
                <div className="hidden lg:block text-right">
                  <p className="text-xs text-gray-500">お電話でのお問い合わせ</p>
                  <a href="tel:0120438639" className="text-xl font-bold text-[#C8A400] hover:text-[#B39400]">
                    0120-43-8639
                  </a>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b">
            <div className="px-4 py-2 space-y-1">
              <Link href="/properties" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">
                物件を探す
              </Link>
              <Link href="/sell" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">
                売却査定
              </Link>
              <Link href="/about" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">
                会社案内
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">
                お問い合わせ
              </Link>
              <a href="tel:0120438639" className="block px-3 py-2 text-[#C8A400] font-bold hover:bg-gray-50 rounded">
                📞 0120-43-8639
              </a>
            </div>
          </div>
        )}
      </header>

      {/* メインビジュアル - プロフェッショナル */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#C8A400] bg-opacity-10 mb-6">
                <span className="text-sm font-medium text-[#C8A400]">創業10年の実績と信頼</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                奈良・大阪の不動産なら<br />
                <span className="text-[#C8A400]">センチュリー21</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                全国964店舗のネットワークと地域密着のサービスで、<br className="hidden md:block" />
                お客様の理想の住まい探しをサポートします。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/properties"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#C8A400] text-white font-medium rounded-lg hover:bg-[#B39400] transition"
                >
                  物件を探す
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border-2 border-gray-200 hover:border-gray-300 transition"
                >
                  無料査定を申し込む
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#C8A400] to-[#B39400] rounded-2xl transform rotate-3"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-xl">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#C8A400]">10年</div>
                      <p className="text-sm text-gray-600 mt-1">創業実績</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#C8A400]">25,000件</div>
                      <p className="text-sm text-gray-600 mt-1">年間取引</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#C8A400]">964店舗</div>
                      <p className="text-sm text-gray-600 mt-1">全国展開</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#C8A400]">No.1</div>
                      <p className="text-sm text-gray-600 mt-1">店舗数</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* サービス紹介 - アイコン&説明 */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              サービス
            </h2>
            <p className="text-lg text-gray-600">
              不動産に関するあらゆるニーズにお応えします
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group hover:shadow-lg transition-shadow rounded-xl p-8 bg-gray-50">
              <div className="w-16 h-16 bg-[#C8A400] bg-opacity-10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-opacity-20 transition">
                <svg className="w-8 h-8 text-[#C8A400]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">不動産売買</h3>
              <p className="text-gray-600">
                新築・中古戸建、マンション、土地まで幅広く取り扱い。お客様のライフスタイルに合った最適な物件をご提案します。
              </p>
            </div>
            <div className="group hover:shadow-lg transition-shadow rounded-xl p-8 bg-gray-50">
              <div className="w-16 h-16 bg-[#C8A400] bg-opacity-10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-opacity-20 transition">
                <svg className="w-8 h-8 text-[#C8A400]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">売却・買取</h3>
              <p className="text-gray-600">
                スピード査定で適正価格をご提示。買取保証制度もあり、確実な売却をサポートします。
              </p>
            </div>
            <div className="group hover:shadow-lg transition-shadow rounded-xl p-8 bg-gray-50">
              <div className="w-16 h-16 bg-[#C8A400] bg-opacity-10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-opacity-20 transition">
                <svg className="w-8 h-8 text-[#C8A400]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">リフォーム</h3>
              <p className="text-gray-600">
                自社職人による高品質施工。水回りから全面リフォームまで、適正価格でご提供します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 物件情報 */}
      {!loading && newProperties.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  おすすめ物件
                </h2>
                <p className="text-gray-600">厳選した物件をご紹介します</p>
              </div>
              <Link
                href="/properties"
                className="hidden md:inline-flex items-center text-[#C8A400] hover:text-[#B39400] font-medium"
              >
                すべての物件を見る
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {newProperties.slice(0, 3).map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Link
                href="/properties"
                className="inline-flex items-center text-[#C8A400] hover:text-[#B39400] font-medium"
              >
                すべての物件を見る
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 選ばれる理由 */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              選ばれる理由
            </h2>
            <p className="text-lg text-gray-600">
              センチュリー21ホームマートが選ばれる3つの理由
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#C8A400] to-[#B39400] text-white rounded-full mb-6">
                <span className="text-2xl font-bold">01</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">全国No.1のネットワーク</h3>
              <p className="text-gray-600">
                全国964店舗、世界68の国と地域に広がるネットワークで、豊富な物件情報と実績をご提供
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#C8A400] to-[#B39400] text-white rounded-full mb-6">
                <span className="text-2xl font-bold">02</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">地域密着のサービス</h3>
              <p className="text-gray-600">
                奈良・大阪で10年以上の実績。地域の特性を熟知したスタッフが最適なご提案をいたします
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#C8A400] to-[#B39400] text-white rounded-full mb-6">
                <span className="text-2xl font-bold">03</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">ワンストップサービス</h3>
              <p className="text-gray-600">
                売買・リフォーム・資金計画まで、不動産に関するすべてを一貫してサポートします
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#C8A400] to-[#B39400]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            まずは無料相談から
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            不動産のプロが親身になってご相談に応じます
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:0120438639"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#C8A400] font-bold rounded-lg hover:bg-gray-50 transition text-lg"
            >
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              0120-43-8639
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-bold rounded-lg border-2 border-white hover:bg-white hover:text-[#C8A400] transition text-lg"
            >
              メールで問い合わせ
            </Link>
          </div>
          <p className="text-white mt-6 opacity-75">
            営業時間：9:00〜18:00（水曜定休）
          </p>
        </div>
      </section>

      {/* アクセス */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">アクセス</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">本店</h3>
                  <p className="text-gray-600">
                    〒635-0821<br />
                    奈良県北葛城郡広陵町笠287-1<br />
                    <span className="text-[#C8A400] font-medium">2025年3月グランドオープン</span>
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">営業時間</h3>
                  <p className="text-gray-600">
                    平日：9:00〜18:00<br />
                    土日祝：10:00〜17:00<br />
                    定休日：水曜日
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">お問い合わせ</h3>
                  <p className="text-gray-600">
                    TEL：<a href="tel:0120438639" className="text-[#C8A400] font-medium">0120-43-8639</a><br />
                    FAX：050-3183-9576
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-500">地図を表示</p>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <span className="text-3xl font-bold text-[#C8A400]">C</span>
                <span className="text-2xl font-bold">21</span>
              </div>
              <p className="text-sm text-gray-400">
                センチュリー21ホームマート<br />
                奈良・大阪の不動産
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">サービス</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/properties" className="hover:text-white">物件を探す</Link></li>
                <li><Link href="/sell" className="hover:text-white">売却査定</Link></li>
                <li><Link href="/reform" className="hover:text-white">リフォーム</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">会社情報</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">会社概要</Link></li>
                <li><Link href="/staff" className="hover:text-white">スタッフ紹介</Link></li>
                <li><Link href="/access" className="hover:text-white">アクセス</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">お問い合わせ</h3>
              <p className="text-sm text-gray-400 mb-2">
                お電話でのお問い合わせ
              </p>
              <a href="tel:0120438639" className="text-xl font-bold text-[#C8A400] hover:text-[#B39400]">
                0120-43-8639
              </a>
              <p className="text-xs text-gray-400 mt-2">
                営業時間：9:00〜18:00（水曜定休）
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 CENTURY21 HOMEMART. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
