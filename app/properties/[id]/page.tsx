// app/properties/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function PropertyDetailPage() {
  const params = useParams()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchProperty()
  }, [params.id])

  const fetchProperty = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>物件が見つかりませんでした</p>
      </div>
    )
  }

  const images = property.images || [property.image_url].filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/properties" className="text-blue-600 hover:underline">
            ← 物件一覧に戻る
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 画像ギャラリー */}
          {images.length > 0 && (
            <div className="relative">
              <img
                src={images[currentImageIndex]}
                alt={`${property.name} - ${currentImageIndex + 1}`}
                className="w-full h-96 object-cover"
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    →
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* サムネイル */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`サムネイル ${index + 1}`}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-20 h-20 object-cover cursor-pointer rounded ${
                    index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                  }`}
                />
              ))}
            </div>
          )}

          {/* 基本情報 */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
                <p className="text-gray-600">{property.property_type}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-red-600">
                  {property.price.toLocaleString()}万円
                </p>
                {property.price_per_tsubo && (
                  <p className="text-sm text-gray-600">
                    坪単価: {property.price_per_tsubo.toLocaleString()}万円
                  </p>
                )}
              </div>
            </div>

            {/* スタッフコメント */}
            {property.staff_comment && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-red-500 text-white rounded-full p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">スタッフからのおすすめポイント</h3>
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {property.staff_comment}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 物件詳細テーブル */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 左側 */}
              <div>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">物件概要</h2>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 text-gray-600">所在地</th>
                      <td className="py-2">{property.prefecture}{property.city}{property.town}</td>
                    </tr>
                    {property.station && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">交通</th>
                        <td className="py-2">
                          {property.route && `${property.route} `}
                          {property.station} 徒歩{property.walking_time}分
                        </td>
                      </tr>
                    )}
                    {property.layout && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">間取り</th>
                        <td className="py-2">{property.layout}</td>
                      </tr>
                    )}
                    {property.land_area && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">土地面積</th>
                        <td className="py-2">{property.land_area}㎡</td>
                      </tr>
                    )}
                    {property.building_area && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">建物面積</th>
                        <td className="py-2">{property.building_area}㎡</td>
                      </tr>
                    )}
                    {property.building_age !== null && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">築年数</th>
                        <td className="py-2">
                          {property.building_age}年
                          {property.build_year && property.build_month && 
                            ` (${property.build_year}年${property.build_month}月築)`}
                        </td>
                      </tr>
                    )}
                    {property.structure && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">構造</th>
                        <td className="py-2">{property.structure}</td>
                      </tr>
                    )}
                    {property.floors && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">階数</th>
                        <td className="py-2">{property.floors}階建</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 右側 */}
              <div>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">詳細情報</h2>
                <table className="w-full">
                  <tbody>
                    {property.parking && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">駐車場</th>
                        <td className="py-2">{property.parking}台</td>
                      </tr>
                    )}
                    {property.land_rights && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">土地権利</th>
                        <td className="py-2">{property.land_rights}</td>
                      </tr>
                    )}
                    {property.use_district && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">用途地域</th>
                        <td className="py-2">{property.use_district}</td>
                      </tr>
                    )}
                    {property.building_coverage && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">建ぺい率</th>
                        <td className="py-2">{property.building_coverage}%</td>
                      </tr>
                    )}
                    {property.floor_area_ratio && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">容積率</th>
                        <td className="py-2">{property.floor_area_ratio}%</td>
                      </tr>
                    )}
                    {property.current_status && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">現況</th>
                        <td className="py-2">{property.current_status}</td>
                      </tr>
                    )}
                    {property.delivery_time && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">引渡時期</th>
                        <td className="py-2">{property.delivery_time}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 物件の特徴 */}
            {property.features && Object.values(property.features).some(v => v) && (
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">物件の特徴</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(property.features).map(([key, value]) => {
                    if (!value) return null
                    const labels: any = {
                      long_term_excellent: '長期優良住宅',
                      performance_evaluation: '住宅性能評価書取得',
                      flat35s: 'フラット35S対応',
                      energy_standard: '省エネ基準適合',
                      earthquake_grade3: '耐震等級3',
                      insulation_grade4: '断熱等性能等級4',
                      system_kitchen: 'システムキッチン',
                      dishwasher: '食器洗い乾燥機',
                      ih_cooktop: 'IHクッキングヒーター',
                      bathroom_dryer: '浴室乾燥機',
                      washlet: '温水洗浄便座',
                      floor_heating: '床暖房',
                      air_conditioner: 'エアコン',
                      tv_intercom: 'TVモニタ付インターホン',
                      sunny: '陽当り良好',
                      well_ventilated: '通風良好',
                      corner_lot: '角地',
                      quiet_area: '閑静な住宅地',
                      station_10min: '駅徒歩10分以内',
                      shopping_nearby: '商業施設近い',
                      school_nearby: '学校近い',
                      park_nearby: '公園近い',
                      parking_2cars: '駐車2台可',
                      all_room_storage: '全居室収納',
                      walk_in_closet: 'ウォークインクローゼット',
                      under_floor_storage: '床下収納',
                      attic_storage: '小屋裏収納',
                      south_balcony: '南面バルコニー',
                      private_garden: '専用庭',
                      pet_allowed: 'ペット可'
                    }
                    return (
                      <div key={key} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm">{labels[key]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* お問い合わせボタン */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
              <p className="text-lg mb-4">この物件についてお問い合わせ</p>
              <div className="flex gap-4 justify-center">
                <a
                  href="tel:0120-43-8639"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700"
                >
                  📞 0120-43-8639
                </a>
                <a
                  href="https://line.me/R/ti/p/%40homemart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-600"
                >
                  LINE で問い合わせ
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}