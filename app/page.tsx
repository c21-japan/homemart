'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AreaSearch from '@/components/AreaSearch'

interface Property {
  id: number
  name: string
  price: number
  address: string
  description: string
  image_url: string
  featured: boolean
  phone: string
  status: string
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  async function fetchProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('featured', { ascending: false })

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">株式会社ホームマート</h1>
            <div className="flex gap-4 items-center">
              <Link 
                href="/admin" 
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                管理画面
              </Link>
              <a 
                href="tel:0120438639" 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                📞 0120-43-8639
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* メインビジュアル */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">
          奈良・大阪の不動産ならお任せください
        </h2>
        <p className="text-xl mb-8">センチュリー21加盟店</p>
        <div className="flex justify-center gap-4">
          <a 
            href="#properties" 
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            物件を探す
          </a>
          <a 
            href="tel:0120438639" 
            className="bg-green-500 px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
          >
            今すぐ相談
          </a>
        </div>
      </div>

      {/* エリア検索セクション - ここに追加！ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AreaSearch />
      </div>

      {/* 物件一覧 */}
      <div id="properties" className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">物件情報</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4">読み込み中...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {properties?.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {property.featured && (
                  <div className="bg-red-600 text-white text-center py-1 font-bold">
                    おすすめ
                  </div>
                )}
                <Link href={`/properties/${property.id}`}>
                  <div className="cursor-pointer">
                    <div className="relative overflow-hidden">
                      <img 
                        src={property.image_url || 'https://via.placeholder.com/400x300'} 
                        alt={property.name}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-xl mb-2 hover:text-blue-600 transition-colors">
                        {property.name}
                      </h3>
                      <p className="text-2xl text-red-600 font-bold mb-2">
                        {(property.price / 10000).toLocaleString()}万円
                      </p>
                      <p className="text-gray-600 mb-2">{property.address}</p>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {property.description}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4 flex gap-2">
                  <Link 
                    href={`/properties/${property.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    詳細を見る
                  </Link>
                  <a 
                    href={`tel:${property.phone || '0120438639'}`}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    📞
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (!properties || properties.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">現在、公開中の物件はありません</p>
            <Link 
              href="/admin" 
              className="text-blue-600 hover:underline"
            >
              管理画面から物件を登録
            </Link>
          </div>
        )}
      </div>

      {/* 会社情報 */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">サービス</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 不動産売買仲介</li>
                <li>• 買取再販（URICO制度）</li>
                <li>• リフォーム・リノベーション</li>
                <li>• 無料査定</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">営業時間</h3>
              <ul className="space-y-2 text-gray-600">
                <li>平日：9:00〜18:00</li>
                <li>土日祝：10:00〜17:00</li>
                <li>定休日：水曜日</li>
                <li>フリーダイヤル：0120-43-8639</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">アクセス</h3>
              <p className="text-gray-600">
                〒635-0821<br />
                奈良県北葛城郡広陵町笠287-1<br />
                <span className="text-sm mt-2 inline-block">
                  ※2025年3月センチュリー21広陵店オープン予定
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-bold mb-2">株式会社ホームマート</p>
          <p className="text-sm">センチュリー21加盟店</p>
          <p className="text-sm mt-4">© 2024 Homemart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
