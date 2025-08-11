'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Property {
  id: string
  name: string
  price: number
  image_url?: string
  images?: string[]
  property_type: string
  prefecture: string
  city: string
  town?: string
  station?: string
  route?: string
  walking_time?: number
  layout?: string
  land_area?: number
  land_area_tsubo?: number
  building_area?: number
  building_age?: number
  build_year?: string
  build_month?: string
  price_per_tsubo?: number
  staff_comment?: string
  sales_point?: string
  structure?: string
  floors?: number
  direction?: string
  parking?: number
  land_rights?: string
  use_district?: string
  building_coverage?: number
  floor_area_ratio?: number
  road_situation?: string
  current_status?: string
  delivery_time?: string
  reform_history?: string
  elevator?: boolean
  auto_lock?: boolean
  delivery_box?: boolean
  bicycle_parking?: boolean
  features?: string[]
}

export default function PropertyDetailPage() {
  const params = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchProperty()
    }
  }, [params.id])

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setProperty(data as Property)
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

  const images: string[] = []
  if (property.images && property.images.length > 0) {
    images.push(...property.images)
  } else if (property.image_url) {
    images.push(property.image_url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/properties" className="text-blue-600 hover:underline">
            ← 物件一覧に戻る
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {images.length > 0 && (
            <div className="relative">
              <div className="relative h-[500px] bg-gray-100">
                <img
                  src={images[currentImageIndex]}
                  alt={`${property.name} - ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          )}

          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50">
              {images.map((img: string, index: number) => (
                <img
                  key={index}
                  src={img}
                  alt={`サムネイル ${index + 1}`}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-20 h-20 object-cover cursor-pointer rounded transition-all ${
                    index === currentImageIndex ? 'ring-2 ring-blue-500 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
                <p className="text-gray-600">{property.property_type}</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-600">価格</span>
                  <span className="text-4xl font-bold text-red-600">
                    {property.price.toLocaleString()}
                  </span>
                  <span className="text-2xl text-red-600">万円</span>
                </div>
                {property.price_per_tsubo && property.price_per_tsubo > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    坪単価: {property.price_per_tsubo.toLocaleString()}万円
                  </p>
                )}
              </div>
            </div>

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

            {property.sales_point && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold mb-2">物件の特徴</h3>
                <p className="whitespace-pre-wrap">{property.sales_point}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">物件概要</h2>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 text-gray-600">所在地</th>
                      <td className="py-2">{property.prefecture}{property.city}{property.town || ''}</td>
                    </tr>
                    {property.station && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">交通</th>
                        <td className="py-2">
                          {property.route && `${property.route} `}
                          {property.station} {property.walking_time && `徒歩${property.walking_time}分`}
                        </td>
                      </tr>
                    )}
                    {property.layout && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">間取り</th>
                        <td className="py-2">{property.layout}</td>
                      </tr>
                    )}
                    {property.land_area && property.land_area > 0 && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">土地面積</th>
                        <td className="py-2">
                          {property.land_area}㎡
                          {property.land_area_tsubo && property.land_area_tsubo > 0 && ` (${property.land_area_tsubo}坪)`}
                        </td>
                      </tr>
                    )}
                    {property.building_area && property.building_area > 0 && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">建物面積</th>
                        <td className="py-2">{property.building_area}㎡</td>
                      </tr>
                    )}
                    {property.building_age !== undefined && property.building_age !== null && property.building_age >= 0 && (
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
                    {property.floors && property.floors > 0 && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">階数</th>
                        <td className="py-2">{property.floors}階建</td>
                      </tr>
                    )}
                    {property.direction && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">向き</th>
                        <td className="py-2">{property.direction}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">詳細情報</h2>
                <table className="w-full">
                  <tbody>
                    {property.parking && property.parking > 0 && (
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
                    {property.building_coverage && property.building_coverage > 0 && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">建ぺい率</th>
                        <td className="py-2">{property.building_coverage}%</td>
                      </tr>
                    )}
                    {property.floor_area_ratio && property.floor_area_ratio > 0 && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">容積率</th>
                        <td className="py-2">{property.floor_area_ratio}%</td>
                      </tr>
                    )}
                    {property.road_situation && (
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-600">接道状況</th>
                        <td className="py-2">{property.road_situation}</td>
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

            {property.reform_history && (
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">リフォーム履歴</h2>
                <p className="whitespace-pre-wrap">{property.reform_history}</p>
              </div>
            )}

            {property.property_type === '中古マンション' && (
              property.elevator || property.auto_lock || property.delivery_box || property.bicycle_parking
            ) && (
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">共用施設</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {property.elevator && (
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>エレベーター</span>
                    </div>
                  )}
                  {property.auto_lock && (
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>オートロック</span>
                    </div>
                  )}
                  {property.delivery_box && (
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>宅配ボックス</span>
                    </div>
                  )}
                  {property.bicycle_parking && (
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>駐輪場</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {property.features && Array.isArray(property.features) && property.features.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">物件の特徴</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {property.features.map((feature, index) => (
                    feature && feature.trim() && (
                      <div key={index} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm">{feature}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

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
