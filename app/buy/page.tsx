'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Property {
  id: number
  name: string
  price: number
  address: string
  description: string
  image_url: string
  property_type: string
  status: string
}

export default function BuyPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    if (selectedType === 'all') {
      setFilteredProperties(properties)
    } else {
      setFilteredProperties(properties.filter(p => p.property_type === selectedType))
    }
  }, [selectedType, properties])

  async function fetchProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProperties(data || [])
      setFilteredProperties(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <span className="text-3xl font-bold text-[#FFD700]">C21</span>
              <h1 className="text-xl font-bold">センチュリー21ホームマート</h1>
            </Link>
            <a href="tel:0120438639" className="text-xl font-bold text-[#FF0000]">
              📞 0120-43-8639
            </a>
          </div>
        </div>
      </header>

      {/* メインビジュアル */}
      <div className="bg-gradient-to-r from-[#FF69B4] to-[#FFB6C1] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">家を買う</h1>
          <p className="text-xl">理想の住まいを見つけましょう</p>
        </div>
      </div>

      {/* 物件カテゴリ選択 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6 text-[#36454F]">物件種別で探す</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setSelectedType('all')}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedType === 'all' 
                  ? 'bg-[#FFD700] border-[#FFD700] text-black' 
                  : 'bg-white border-gray-300 hover:border-[#FFD700]'
              }`}
            >
              <span className="text-2xl block mb-2">🏠</span>
              <p className="font-bold">すべて</p>
            </button>

            <button
              onClick={() => setSelectedType('新築戸建')}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedType === '新築戸建' 
                  ? 'bg-[#F5DEB3] border-[#F5DEB3]' 
                  : 'bg-white border-gray-300 hover:border-[#F5DEB3]'
              }`}
            >
              <span className="text-2xl block mb-2">🏡</span>
              <p className="font-bold">新築戸建</p>
            </button>

            <button
              onClick={() => setSelectedType('中古戸建')}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedType === '中古戸建' 
                  ? 'bg-[#8B4513] border-[#8B4513] text-white' 
                  : 'bg-white border-gray-300 hover:border-[#8B4513]'
              }`}
            >
              <span className="text-2xl block mb-2">🏘️</span>
              <p className="font-bold">中古戸建</p>
            </button>

            <button
              onClick={() => setSelectedType('中古マンション')}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedType === '中古マンション' 
                  ? 'bg-[#2F4F4F] border-[#2F4F4F] text-white' 
                  : 'bg-white border-gray-300 hover:border-[#2F4F4F]'
              }`}
            >
              <span className="text-2xl block mb-2">🏢</span>
              <p className="font-bold">中古マンション</p>
            </button>

            <button
              onClick={() => setSelectedType('土地')}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedType === '土地' 
                  ? 'bg-[#808000] border-[#808000] text-white' 
                  : 'bg-white border-gray-300 hover:border-[#808000]'
              }`}
            >
              <span className="text-2xl block mb-2">🌍</span>
              <p className="font-bold">土地</p>
            </button>
          </div>
        </div>
      </div>

      {/* 賃貸vs持ち家比較 */}
      <div className="bg-[#36454F] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="md:flex gap-8 items-center">
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-4">賃貸と持ち家、どちらが最適？</h2>
              <p className="text-xl mb-4">あなたの理想の住まい選び</p>
              <p className="text-gray-300 leading-relaxed">
                家を購入するか賃貸で住み続けるか、多くの方が悩む選択です。
                それぞれにメリット・デメリットがあり、ライフスタイルに合った選択が重要です。
                持ち家の魅力と賃貸との違いについて分かりやすくご説明します。
              </p>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-10 rounded p-4">
                  <h3 className="font-bold mb-2">持ち家のメリット</h3>
                  <ul className="text-sm space-y-1">
                    <li>• 資産として残る</li>
                    <li>• 自由にリフォーム可能</li>
                    <li>• 老後の安心</li>
                  </ul>
                </div>
                <div className="bg-white bg-opacity-10 rounded p-4">
                  <h3 className="font-bold mb-2">賃貸のメリット</h3>
                  <ul className="text-sm space-y-1">
                    <li>• 初期費用が少ない</li>
                    <li>• 引っ越しが容易</li>
                    <li>• 維持費の心配なし</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="md:w-1/3 mt-8 md:mt-0">
              <div className="bg-[#FFD700] text-black rounded-lg p-6 text-center">
                <span className="text-4xl block mb-4">🏠</span>
                <p className="font-bold text-lg mb-4">無料相談実施中！</p>
                <a 
                  href="tel:0120438639" 
                  className="bg-[#FF0000] text-white px-6 py-3 rounded-lg inline-block hover:bg-red-700 transition-colors font-bold"
                >
                  今すぐ相談する
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 物件一覧 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-[#36454F]">
          {selectedType === 'all' ? '全物件' : selectedType}一覧
          <span className="text-lg ml-4 text-gray-600">（{filteredProperties.length}件）</span>
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto"></div>
            <p className="mt-4">読み込み中...</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <Link href={`/properties/${property.id}`}>
                  <div className="cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={property.image_url || 'https://via.placeholder.com/400x300'} 
                        alt={property.name}
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                      {/* フォールバック用の絵文字 */}
                      <div className="absolute inset-0 flex items-center justify-center text-6xl text-gray-400 bg-gray-200" style={{ display: 'none' }}>
                        🏠
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-xl">{property.name}</h3>
                        <span className="bg-[#FFD700] text-xs px-2 py-1 rounded">
                          {property.property_type}
                        </span>
                      </div>
                      <p className="text-2xl text-[#FF0000] font-bold mb-2">
                        {(property.price / 10000).toLocaleString()}万円
                      </p>
                      <p className="text-gray-600 text-sm">{property.address}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">該当する物件がありません</p>
          </div>
        )}
      </div>

      {/* フッター */}
      <footer className="bg-[#36454F] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Link href="/" className="text-[#FFD700] hover:underline">
            トップページに戻る
          </Link>
          <p className="mt-4 text-sm">© 2024 CENTURY21 HOMEMART. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}