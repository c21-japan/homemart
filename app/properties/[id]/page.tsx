'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase, testSupabaseConnection } from '@/lib/supabase'
import Link from 'next/link'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { getRelatedProperties } from '@/lib/supabase/related-properties'

interface Property {
  id: string
  title: string
  price: number
  price_text?: string
  prefecture?: string
  city?: string
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
  source_url?: string
  
  // マンション専用
  total_units?: number
  management_fee?: number
  repair_fund?: number
  balcony_area?: number
  elevator?: boolean
  auto_lock?: boolean
  delivery_box?: boolean
  bicycle_parking?: number
}

export default function PropertyDetail() {
  const params = useParams()
  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed()
  const [property, setProperty] = useState<Property | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedProperties, setRelatedProperties] = useState<unknown[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  useEffect(() => {
    if (params?.id) {
      console.log('PropertyDetail: コンポーネントがマウントされました')
      console.log('PropertyDetail: パラメータID:', params.id)
      console.log('PropertyDetail: Supabase設定:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })
      if (typeof params.id === 'string' && params.id.startsWith('suumo-')) {
        fetchSuumoProperty(params.id)
        return
      }
      fetchProperty(params.id as string)
    }
  }, [params?.id])

  const fetchSuumoProperty = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/suumo/properties.json', { cache: 'no-store' })
      if (!response.ok) {
        setError('物件情報の取得に失敗しました')
        return
      }

      const data = await response.json()
      const items = Array.isArray(data?.items) ? data.items : []
      const suumoId = id.replace('suumo-', '')
      const item = items.find((entry: any) => entry.id === suumoId)

      if (!item) {
        setError('指定された物件が見つかりませんでした')
        return
      }

      const priceText = typeof item.price === 'string' ? item.price.trim() : ''
      const numericMatch = priceText.replace(/,/g, '').match(/\d+(\.\d+)?/)
      const priceValue = numericMatch ? Number(numericMatch[0]) : 0

      const normalized: Property = {
        id,
        title: item.title || '物件',
        price: Number.isFinite(priceValue) ? priceValue : 0,
        price_text: priceText || undefined,
        address: item.address || '',
        property_type: item.property_type || '物件',
        created_at: item.fetched_at || new Date().toISOString(),
        updated_at: item.fetched_at || new Date().toISOString(),
        image_url: item.image_url || '',
        images: item.image_url ? [item.image_url] : [],
        staff_comment: item.description || '',
        source_url: item.source_url || ''
      }

      setProperty(normalized)
      addRecentlyViewed({
        id: normalized.id,
        title: normalized.title,
        price: normalized.price,
        property_type: normalized.property_type,
        address: normalized.address,
        image_url: normalized.image_url,
        images: normalized.images
      })
    } catch (err) {
      console.error('Error fetching SUUMO property:', err)
      setError('物件情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchProperty = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching property with ID:', id)
      
      // Supabase接続をテスト
      const isConnected = await testSupabaseConnection()
      if (!isConnected) {
        setError('データベース接続に失敗しました。しばらく待ってから再試行してください。')
        return
      }
      
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      console.log('Supabase response:', { data, error: fetchError })

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        
        // エラーの種類に応じて適切なメッセージを表示
        let errorMessage = '物件情報の取得に失敗しました'
        
        if (fetchError.code === 'PGRST116') {
          errorMessage = '指定された物件が見つかりませんでした'
        } else if (fetchError.code === 'PGRST301') {
          errorMessage = 'データベース接続エラーが発生しました'
        } else if (fetchError.message) {
          errorMessage += `: ${fetchError.message}`
        }
        
        setError(errorMessage)
        return
      }

      if (data) {
        console.log('Property data received:', data)
        setProperty(data)
        // 最近見た物件に追加
        addRecentlyViewed({
          id: data.id,
          title: data.title,
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
      
      let errorMessage = 'エラーが発生しました'
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
        } else if (err.message.includes('timeout')) {
          errorMessage = 'リクエストがタイムアウトしました。しばらく待ってから再試行してください。'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProperties = async (currentProperty: Property) => {
    try {
      setLoadingRelated(true)
      
      // 必要なフィールドが存在するかチェック
      if (currentProperty.prefecture && currentProperty.city) {
        const related = await getRelatedProperties(currentProperty as any, 10)
        setRelatedProperties(related)
      } else {
        console.log('関連物件の取得に必要なフィールドが不足しています:', {
          prefecture: currentProperty.prefecture,
          city: currentProperty.city
        })
        setRelatedProperties([])
      }
    } catch (error) {
      console.error('Error fetching related properties:', error)
      setRelatedProperties([])
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
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {error ? 'エラーが発生しました' : '物件が見つかりません'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || '指定された物件は存在しないか、削除された可能性があります。'}
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-left">
                <p className="text-sm text-red-700 font-medium">エラー詳細:</p>
                <p className="text-sm text-red-600 break-words">{error}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                ページを再読み込み
              </button>
              
              <Link 
                href="/properties" 
                className="block w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-center"
              >
                物件一覧に戻る
              </Link>
              
              <Link 
                href="/" 
                className="block w-full text-gray-600 hover:text-gray-800 transition-colors text-center"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
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
                      alt={property.title}
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
                            alt={`${property.title} ${index + 1}`}
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
              <h1 className="text-2xl font-bold mb-4">{property.title}</h1>
              <div className="text-3xl font-bold text-red-600 mb-4">
                {property.price_text ?? `${property.price.toLocaleString()}万円`}
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
            <div
              className="bg-white rounded-lg shadow-lg p-6 sticky"
              style={{ top: 'calc(var(--public-header-height) + 1rem)' }}
            >
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
                  href={`/contact?property=${property.title}`}
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

        {/* 最近見た物件の表示（関連物件は一時的に無効化） */}
        {recentlyViewed.length > 0 && (
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
                            alt={recentProperty.title}
                            className="w-full h-full object-contain object-center"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-4xl text-gray-400">🏠</span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-sm mb-1 line-clamp-2">{recentProperty.title}</h3>
                        <p className="text-lg font-bold text-red-600 mb-1">
                          {recentProperty.price.toLocaleString()}万円
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-1">{recentProperty.address}</p>
                        <p className="text-xs text-blue-500 font-medium">最近見た物件</p>
                      </div>
                    </div>
                  </Link>
                ))}
                

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
