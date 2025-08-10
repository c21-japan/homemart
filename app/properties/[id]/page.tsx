'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Property {
  id: number
  name: string
  price: number
  address: string
  description: string
  image_url: string
  featured: boolean
  phone: string
  created_at: string
}

export default function PropertyDetail() {
  const params = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([])

  useEffect(() => {
    fetchProperty()
    fetchRelatedProperties()
  }, [params.id])

  async function fetchProperty() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setProperty(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchRelatedProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .neq('id', params.id)
        .limit(3)

      if (error) throw error
      setRelatedProperties(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">物件が見つかりません</p>
          <Link href="/" className="text-blue-600 hover:underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              株式会社ホームマート
            </Link>
            <a 
              href={`tel:${property.phone || '0120-43-8639'}`} 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              📞 お電話で相談
            </a>
          </div>
        </div>
      </header>

      {/* パンくずリスト */}
      <div className="container mx-auto px-4 py-2">
        <nav className="text-sm">
          <Link href="/" className="text-blue-600 hover:underline">トップ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{property.name}</span>
        </nav>
      </div>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左側：画像と詳細 */}
          <div className="lg:col-span-2">
            {/* メイン画像 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {property.image_url ? (
                <img 
                  src={property.image_url} 
                  alt={property.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">画像がありません</p>
                </div>
              )}
            </div>

            {/* 物件情報 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4">{property.name}</h1>
              
              {property.featured && (
                <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm mb-4">
                  おすすめ物件
                </span>
              )}

              <div className="text-4xl font-bold text-red-600 mb-4">
                {(property.price / 10000).toLocaleString()}万円
              </div>

              <table className="w-full mb-6">
                <tbody>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 w-32 text-gray-600">所在地</th>
                    <td className="py-3">{property.address}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 text-gray-600">価格</th>
                    <td className="py-3">
                      {property.price.toLocaleString()}円
                      <span className="text-sm text-gray-500 ml-2">（税込）</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 text-gray-600">登録日</th>
                    <td className="py-3">
                      {new Date(property.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {property.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold mb-2">物件説明</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
                </div>
              )}
            </div>

            {/* アクセス情報（仮） */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">アクセス・周辺環境</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• 最寄り駅から徒歩圏内</li>
                <li>• スーパー、コンビニが近隣にあり</li>
                <li>• 静かな住環境</li>
                <li>• 日当たり良好</li>
              </ul>
            </div>
          </div>

          {/* 右側：お問い合わせ */}
          <div className="lg:col-span-1">
            {/* お問い合わせカード */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-bold mb-4">お問い合わせ</h3>
              
              <div className="space-y-4">
                <a 
                  href={`tel:${property.phone || '0120-43-8639'}`}
                  className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 font-bold"
                >
                  📞 電話で問い合わせ
                </a>

                <a 
                  href={`https://line.me/R/ti/p/@homemart?text=${encodeURIComponent(`${property.name}について問い合わせ`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-500 text-white text-center py-3 rounded-lg hover:bg-green-600 font-bold"
                >
                  📱 LINEで問い合わせ
                </a>

                <Link
                  href={`/contact?property=${encodeURIComponent(property.name)}&id=${property.id}`}
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 font-bold"
                >
                  ✉️ メールで問い合わせ
                </Link>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded">
                <p className="text-sm font-bold mb-2">株式会社ホームマート</p>
                <p className="text-xs text-gray-600">
                  営業時間：9:00〜18:00<br />
                  定休日：水曜日<br />
                  フリーダイヤル：0120-43-8639
                </p>
              </div>

              {/* センチュリー21 */}
              <div className="mt-4 p-4 bg-blue-50 rounded text-center">
                <p className="text-sm font-bold text-blue-800">
                  センチュリー21加盟店
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  安心の全国ネットワーク
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 関連物件 */}
        {relatedProperties.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">その他のおすすめ物件</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedProperties.map((item) => (
                <Link 
                  key={item.id}
                  href={`/properties/${item.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200"></div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{item.name}</h3>
                    <p className="text-xl text-red-600 font-bold">
                      {(item.price / 10000).toLocaleString()}万円
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{item.address}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">株式会社ホームマート</p>
          <p className="text-sm">〒635-0821 奈良県北葛城郡広陵町笠287-1</p>
          <p className="text-sm mt-2">© 2024 Homemart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
