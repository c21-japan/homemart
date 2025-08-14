'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PropertySearch from '@/components/PropertySearch'
import PropertyCard from '@/components/PropertyCard'
import { ChevronRightIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)

  // 検索実行ハンドラ - 物件一覧ページへ遷移
  const handleSearch = (filters: any) => {
    // URLパラメータを構築
    const params = new URLSearchParams()
    
    if (filters.area) {
      params.set('area', filters.area)
    }
    if (filters.types && filters.types.length > 0) {
      params.set('types', filters.types.join(','))
    }
    if (filters.priceMin) {
      params.set('priceMin', filters.priceMin)
    }
    if (filters.priceMax) {
      params.set('priceMax', filters.priceMax)
    }
    if (filters.landAreaMin) {
      params.set('landAreaMin', filters.landAreaMin)
    }
    if (filters.landAreaMax) {
      params.set('landAreaMax', filters.landAreaMax)
    }
    if (filters.buildingAreaMin) {
      params.set('buildingAreaMin', filters.buildingAreaMin)
    }
    if (filters.buildingAreaMax) {
      params.set('buildingAreaMax', filters.buildingAreaMax)
    }
    if (filters.nearStation) {
      params.set('nearStation', filters.nearStation)
    }

    // 物件一覧ページへ遷移
    router.push(`/properties?${params.toString()}`)
  }

  // クイック検索ハンドラ
  const handleQuickSearch = (area: string) => {
    router.push(`/properties?area=${encodeURIComponent(area)}`)
  }

  const handlePropertyTypeSearch = (type: string) => {
    router.push(`/properties?types=${encodeURIComponent(type)}`)
  }

  // サンプル物件データ
  const featuredProperties = [
    {
      id: '1',
      name: '広陵町の新築戸建',
      price: 28800000,
      property_type: '新築戸建',
      address: '奈良県北葛城郡広陵町',
      city: '広陵町',
      image_url: '/images/property1.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: '香芝市の中古戸建',
      price: 22000000,
      property_type: '中古戸建',
      address: '奈良県香芝市',
      city: '香芝市',
      image_url: '/images/property2.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: '大和高田市の土地',
      price: 15000000,
      property_type: '土地',
      address: '奈良県大和高田市',
      city: '大和高田市',
      image_url: '/images/property3.jpg',
      created_at: new Date().toISOString()
    }
  ]

  // 人気エリア
  const popularAreas = [
    { name: '広陵町', count: 45 },
    { name: '香芝市', count: 38 },
    { name: '大和高田市', count: 32 },
    { name: '橿原市', count: 28 },
    { name: '田原本町', count: 24 },
    { name: '王寺町', count: 22 }
  ]

  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              奈良・大阪で理想の住まいを見つけよう
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              株式会社ホームマートは、地域密着型の不動産会社として
              お客様の理想の住まい探しをサポートします
            </p>
            <button
              onClick={() => setShowSearch(true)}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
            >
              物件を検索する
            </button>
          </div>
        </div>
      </section>

      {/* 検索モーダル */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">物件検索</h2>
                <button
                  onClick={() => setShowSearch(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <PropertySearch
                onSearch={(filters) => {
                  handleSearch(filters)
                  setShowSearch(false)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* クイック検索 */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">物件種別から探す</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['新築戸建', '中古戸建', '土地', 'マンション', '収益物件'].map((type) => (
              <button
                key={type}
                onClick={() => handlePropertyTypeSearch(type)}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center"
              >
                <div className="text-lg font-semibold">{type}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 人気エリア */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">人気のエリア</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularAreas.map((area) => (
              <button
                key={area.name}
                onClick={() => handleQuickSearch(area.name)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow transition-all"
              >
                <div className="font-semibold">{area.name}</div>
                <div className="text-sm text-gray-500">{area.count}件</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* おすすめ物件 */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">おすすめ物件</h2>
            <Link
              href="/properties"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              すべて見る
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* 会社情報 */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-blue-600 text-white rounded-lg p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">株式会社ホームマート</h2>
                <p className="mb-6">
                  センチュリー21加盟店として、豊富な物件情報と
                  確かな実績でお客様の不動産売買をサポートいたします。
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5" />
                    <span>0120-43-8639</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-5 h-5" />
                    <span>info@homemart.jp</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Link
                  href="/contact"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  お問い合わせはこちら
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}