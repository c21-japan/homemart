'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { getRelatedProperties } from '@/lib/supabase/related-properties'

interface Property {
  id: string
  name: string
  price: number
  prefecture: string
  city: string
  town?: string
  address: string
  station?: string
  route?: string
  walking_time?: number
  property_type: string
  land_area?: number
  land_area_tsubo?: number
  building_area?: number
  layout?: string
  building_age?: number
  build_year?: string
  build_month?: string
  floors?: number
  structure?: string
  parking?: number
  direction?: string
  land_rights?: string
  use_district?: string
  building_coverage?: number
  floor_area_ratio?: number
  road_situation?: string
  current_status?: string
  delivery_time?: string
  features?: Record<string, boolean> | string[]
  staff_comment?: string
  sales_point?: string
  reform_history?: string
  school_district?: string
  shopping_facilities?: string
  public_facilities?: string
  transportation?: string
  image_url?: string
  images?: string[]
  is_new?: boolean
  created_at: string
  updated_at: string
  
  // マンション専用
  total_units?: number
  management_fee?: number
  repair_fund?: number
  balcony_area?: number
  elevator?: boolean
  auto_lock?: boolean
  delivery_box?: boolean
  bicycle_parking?: boolean
}

export default function PropertyDetail() {
  const params = useParams()
  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed()
  const [property, setProperty] = useState<Property | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedProperties, setRelatedProperties] = useState<any[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  useEffect(() => {
    if (params?.id) {
      fetchProperty(params.id as string)
    }
  }, [params?.id])

  const fetchProperty = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        setError('物件情報の取得に失敗しました')
        return
      }

      if (data) {
        setProperty(data)
        // 最近見た物件に追加
        addRecentlyViewed({
          id: data.id,
          name: data.name,
          price: data.price,
          property_type: data.property_type,
          address: data.address,
          image_url: data.image_url,
          images: data.images
        })
        
        // 関連物件を取得
        fetchRelatedProperties(data)
      } else {
        setError('物件が見つかりませんでした')
      }
    } catch (err) {
      console.error('Error fetching property:', err)
      setError('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProperties = async (currentProperty: Property) => {
    try {
      setLoadingRelated(true)
      const related = await getRelatedProperties(currentProperty, 10)
      setRelatedProperties(related)
    } catch (error) {
      console.error('Error fetching related properties:', error)
    } finally {
      setLoadingRelated(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '物件が見つかりませんでした'}</p>
          <Link href="/properties" className="text-blue-600 hover:underline">
            物件一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  const allImages = property.images || (property.image_url ? [property.image_url] : [])

  // 物件の特徴を配列として取得
  const getFeatures = (): string[] => {
    const features: string[] = []
    if (property.features) {
      if (typeof property.features === 'object' && !Array.isArray(property.features)) {
        // オブジェクト形式の場合
        Object.entries(property.features).forEach(([key, value]) => {
          if (value === true) {
            const featureLabels: { [key: string]: string } = {
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
            if (featureLabels[key]) {
              features.push(featureLabels[key])
            }
          }
        })
      } else if (Array.isArray(property.features)) {
        // 配列形式の場合
        return property.features as string[]
      }
    }
    return features
  }

  const features = getFeatures()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/properties" className="text-blue-600 hover:underline">
            ← 物件一覧に戻る
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：画像と基本情報 */}
          <div className="lg:col-span-2">
            {/* 画像ギャラリー */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              {allImages.length > 0 ? (
                <div>
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={allImages[selectedImage]}
                      alt={property.name}
                      className="w-full h-[400px] object-contain bg-gray-100 rounded"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const fallback = target.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                    {/* フォールバック用の絵文字 */}
                    <div className="w-full h-[400px] bg-gray-100 rounded flex items-center justify-center text-8xl text-gray-400" style={{ display: 'none' }}>
                      🏠
                    </div>
                  </div>
                  {allImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {allImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative overflow-hidden rounded ${
                            selectedImage === index ? 'ring-2 ring-red-600' : ''
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${property.name} ${index + 1}`}
                            className="w-full h-20 object-cover object-center"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const fallback = target.nextElementSibling as HTMLElement
                              if (fallback) fallback.style.display = 'flex'
                            }}
                          />
                          {/* フォールバック用の絵文字 */}
                          <div className="absolute inset-0 flex items-center justify-center text-2xl text-gray-400 bg-gray-100" style={{ display: 'none' }}>
                            🏠
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-[400px] bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400">画像なし</span>
                </div>
              )}
            </div>

            {/* 物件名と価格 */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4">{property.name}</h1>
              <div className="text-3xl font-bold text-red-600 mb-4">
                {property.price.toLocaleString()}万円
              </div>
              
              {/* スタッフコメント */}
              {property.staff_comment && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">スタッフより</span>
                    <p className="text-gray-800 flex-1">{property.staff_comment}</p>
                  </div>
                </div>
              )}

              {/* セールスポイント */}
              {property.sales_point && (
                <div className="mb-4">
                  <h3 className="font-bold mb-2">セールスポイント</h3>
                  <p className="whitespace-pre-wrap">{property.sales_point}</p>
                </div>
              )}
            </div>

            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">基本情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">物件種別</span>
                  <p className="font-medium">{property.property_type}</p>
                </div>
                <div>
                  <span className="text-gray-600">所在地</span>
                  <p className="font-medium">{property.address}</p>
                </div>
                {property.station && (
                  <div>
                    <span className="text-gray-600">最寄り駅</span>
                    <p className="font-medium">
                      {property.route && `${property.route} `}
                      {property.station}
                      {property.walking_time && ` 徒歩${property.walking_time}分`}
                    </p>
                  </div>
                )}
                {property.layout && (
                  <div>
                    <span className="text-gray-600">間取り</span>
                    <p className="font-medium">{property.layout}</p>
                  </div>
                )}
                {property.building_age !== undefined && (
                  <div>
                    <span className="text-gray-600">築年数</span>
                    <p className="font-medium">築{property.building_age}年</p>
                  </div>
                )}
              </div>
            </div>

            {/* 土地・建物情報 */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">土地・建物情報</h2>
              <div className="grid grid-cols-2 gap-4">
                {property.land_area && (
                  <div>
                    <span className="text-gray-600">土地面積</span>
                    <p className="font-medium">
                      {property.land_area}㎡
                      {property.land_area_tsubo && ` (${property.land_area_tsubo}坪)`}
                    </p>
                  </div>
                )}
                {property.building_area && (
                  <div>
                    <span className="text-gray-600">建物面積</span>
                    <p className="font-medium">{property.building_area}㎡</p>
                  </div>
                )}
                {property.structure && (
                  <div>
                    <span className="text-gray-600">構造</span>
                    <p className="font-medium">{property.structure}</p>
                  </div>
                )}
                {property.floors && (
                  <div>
                    <span className="text-gray-600">階数</span>
                    <p className="font-medium">{property.floors}階建</p>
                  </div>
                )}
                {property.parking && (
                  <div>
                    <span className="text-gray-600">駐車場</span>
                    <p className="font-medium">{property.parking}台</p>
                  </div>
                )}
                {property.direction && (
                  <div>
                    <span className="text-gray-600">向き</span>
                    <p className="font-medium">{property.direction}</p>
                  </div>
                )}
                {property.building_coverage && (
                  <div>
                    <span className="text-gray-600">建ぺい率</span>
                    <p className="font-medium">{property.building_coverage}%</p>
                  </div>
                )}
                {property.floor_area_ratio && (
                  <div>
                    <span className="text-gray-600">容積率</span>
                    <p className="font-medium">{property.floor_area_ratio}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* 物件の特徴 */}
            {features.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">物件の特徴</h2>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* その他の情報 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">その他の情報</h2>
              <div className="grid grid-cols-2 gap-4">
                {property.current_status && (
                  <div>
                    <span className="text-gray-600">現況</span>
                    <p className="font-medium">{property.current_status}</p>
                  </div>
                )}
                {property.delivery_time && (
                  <div>
                    <span className="text-gray-600">引渡し時期</span>
                    <p className="font-medium">{property.delivery_time}</p>
                  </div>
                )}
                {property.land_rights && (
                  <div>
                    <span className="text-gray-600">土地権利</span>
                    <p className="font-medium">{property.land_rights}</p>
                  </div>
                )}
                {property.use_district && (
                  <div>
                    <span className="text-gray-600">用途地域</span>
                    <p className="font-medium">{property.use_district}</p>
                  </div>
                )}
                {property.road_situation && (
                  <div>
                    <span className="text-gray-600">接道状況</span>
                    <p className="font-medium">{property.road_situation}</p>
                  </div>
                )}
              </div>

              {/* マンション専用情報 */}
              {property.property_type === '中古マンション' && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-bold mb-2">マンション情報</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {property.total_units && (
                      <div>
                        <span className="text-gray-600">総戸数</span>
                        <p className="font-medium">{property.total_units}戸</p>
                      </div>
                    )}
                    {property.management_fee && (
                      <div>
                        <span className="text-gray-600">管理費</span>
                        <p className="font-medium">{property.management_fee.toLocaleString()}円/月</p>
                      </div>
                    )}
                    {property.repair_fund && (
                      <div>
                        <span className="text-gray-600">修繕積立金</span>
                        <p className="font-medium">{property.repair_fund.toLocaleString()}円/月</p>
                      </div>
                    )}
                    {property.balcony_area && (
                      <div>
                        <span className="text-gray-600">バルコニー面積</span>
                        <p className="font-medium">{property.balcony_area}㎡</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {property.elevator && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        エレベーター
                      </span>
                    )}
                    {property.auto_lock && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        オートロック
                      </span>
                    )}
                    {property.delivery_box && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        宅配ボックス
                      </span>
                    )}
                    {property.bicycle_parking && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        駐輪場
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* リフォーム履歴 */}
              {property.reform_history && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-bold mb-2">リフォーム履歴</h3>
                  <p className="whitespace-pre-wrap">{property.reform_history}</p>
                </div>
              )}
            </div>
          </div>

          {/* 右側：お問い合わせ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">お問い合わせ</h2>
              <div className="space-y-4">
                <a
                  href="tel:0120-43-8639"
                  className="block w-full bg-red-600 text-white text-center py-3 rounded-lg hover:bg-red-700 font-bold"
                >
                  <span className="text-sm">お電話でのお問い合わせ</span>
                  <br />
                  0120-43-8639
                </a>
                <Link
                  href={`/contact?property=${property.name}`}
                  className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 font-bold"
                >
                  メールで問い合わせる
                </Link>
                <Link
                  href="/contact"
                  className="block w-full border border-gray-300 text-center py-3 rounded-lg hover:bg-gray-50"
                >
                  見学予約する
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  営業時間：9:00〜18:00<br />
                  定休日：水曜日・祝日
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 最近見た物件と関連物件の統合表示 */}
        {(recentlyViewed.length > 0 || relatedProperties.length > 0) && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-[#36454F]">おすすめ物件</h2>
            
            {/* スマホ用の案内 */}
            <div className="md:hidden mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                <span className="text-sm font-medium">← 左にスワイプして他の物件も見る</span>
              </div>
              <p className="text-xs text-blue-600">指で画面を左右にスワイプすると、他の物件も表示されます</p>
            </div>
            
            {loadingRelated ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD700] mx-auto"></div>
                <p className="mt-2 text-gray-600">おすすめ物件を検索中...</p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-5 md:grid-rows-2 md:gap-6 md:overflow-x-visible">
                {/* 最近見た物件を先に表示 */}
                {recentlyViewed.map((recentProperty) => (
                  <Link key={`recent-${recentProperty.id}`} href={`/properties/${recentProperty.id}`} className="group">
                    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden min-w-[200px] md:min-w-0">
                      <div className="h-32 md:h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden relative">
                        {recentProperty.image_url || (recentProperty.images && recentProperty.images[0]) ? (
                          <img
                            src={recentProperty.image_url || recentProperty.images![0]}
                            alt={recentProperty.name}
                            className="w-full h-full object-contain object-center"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-4xl text-gray-400">🏠</span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-sm mb-1 line-clamp-2">{recentProperty.name}</h3>
                        <p className="text-lg font-bold text-red-600 mb-1">
                          {recentProperty.price.toLocaleString()}万円
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-1">{recentProperty.address}</p>
                        <p className="text-xs text-blue-500 font-medium">最近見た物件</p>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {/* 最近見た物件が6物件未満の場合、関連物件で残りのスロットを埋める */}
                {Array.from({ length: Math.max(0, 10 - recentlyViewed.length) }).map((_, index) => {
                  const relatedProperty = relatedProperties[index];
                  if (!relatedProperty) return null;
                  
                  return (
                    <Link key={`related-${relatedProperty.id}`} href={`/properties/${relatedProperty.id}`} className="group">
                      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden min-w-[200px] md:min-w-0">
                        <div className="h-32 md:h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden relative">
                          {relatedProperty.image_url || (relatedProperty.images && relatedProperty.images[0]) ? (
                            <img
                              src={relatedProperty.image_url || relatedProperty.images[0]}
                              alt={relatedProperty.name}
                              className="w-full h-full object-contain object-center"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-4xl text-gray-400">🏠</span>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-bold text-sm mb-1 line-clamp-2">{relatedProperty.name}</h3>
                          <p className="text-lg font-bold text-red-600 mb-1">
                            {relatedProperty.price.toLocaleString()}万円
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-1">{relatedProperty.address}</p>
                          <p className="text-xs text-green-500 font-medium">関連物件</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
