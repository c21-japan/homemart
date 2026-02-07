'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import PropertySearch from '@/components/PropertySearch'
import PropertyCard from '@/components/PropertyCard'
import { supabase } from '@/lib/supabase'

interface Property {
  id: string
  name: string
  price: number
  price_text?: string
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
  source_url?: string
}

// URLパラメータを処理するコンポーネント
function PropertiesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 検索条件の状態管理
  const [searchFilters, setSearchFilters] = useState({
    area: '',
    types: [] as string[],
    priceMin: '',
    priceMax: '',
    landAreaMin: '',
    landAreaMax: '',
    buildingAreaMin: '',
    buildingAreaMax: '',
    nearStation: ''
  })

  // URLパラメータから初期値を設定
  useEffect(() => {
    const area = searchParams?.get('area') || ''
    const types = searchParams?.get('types') || ''
    
    // 日本語パラメータのデコード処理
    const decodedArea = decodeURIComponent(area)
    const decodedTypes = types ? decodeURIComponent(types).split(',') : []
    
    setSearchFilters(prev => ({
      ...prev,
      area: decodedArea,
      types: decodedTypes
    }))
  }, [searchParams])

  // 物件データの取得
  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (supabaseError) throw supabaseError
      
      if (data && data.length > 0) {
        setProperties(data)
        setFilteredProperties(data)
        return
      }

      const suumoResponse = await fetch('/suumo/properties.json', { cache: 'no-store' })
      if (!suumoResponse.ok) {
        setProperties([])
        setFilteredProperties([])
        return
      }

      const suumoData = await suumoResponse.json()
      const suumoItems = Array.isArray(suumoData?.items) ? suumoData.items : []

      const normalized = suumoItems.map((item: any) => {
        const priceText = typeof item.price === 'string' ? item.price.trim() : ''
        const numericMatch = priceText.replace(/,/g, '').match(/\d+(\.\d+)?/)
        const priceValue = numericMatch ? Number(numericMatch[0]) : 0

        return {
          id: `suumo-${item.id}`,
          name: item.title || '物件',
          price: Number.isFinite(priceValue) ? priceValue : 0,
          price_text: priceText || undefined,
          prefecture: '',
          city: '',
          address: item.address || '',
          property_type: item.property_type || '物件',
          image_url: item.image_url || '',
          created_at: item.fetched_at || new Date().toISOString(),
          source_url: item.source_url || ''
        } as Property
      })

      setProperties(normalized)
      setFilteredProperties(normalized)
    } catch (err) {
      console.error('物件データの取得エラー:', err)
      setError('物件データの取得に失敗しました')
      setProperties([])
      setFilteredProperties([])
    } finally {
      setLoading(false)
    }
  }

  // フィルタリング処理
  useEffect(() => {
    filterProperties()
  }, [searchFilters, properties])

  const filterProperties = () => {
    let filtered = [...properties]

    // エリアフィルタ
    if (searchFilters.area) {
      filtered = filtered.filter(property => 
        property.city === searchFilters.area || 
        property.address.includes(searchFilters.area)
      )
    }

    // 物件種別フィルタ
    if (searchFilters.types.length > 0) {
      filtered = filtered.filter(property => 
        searchFilters.types.includes(property.property_type)
      )
    }

    // 価格フィルタ
    if (searchFilters.priceMin) {
      const minPrice = parseInt(searchFilters.priceMin)
      filtered = filtered.filter(property => property.price >= minPrice)
    }
    if (searchFilters.priceMax) {
      const maxPrice = parseInt(searchFilters.priceMax)
      filtered = filtered.filter(property => property.price <= maxPrice)
    }

    // 土地面積フィルタ
    if (searchFilters.landAreaMin) {
      const minArea = parseFloat(searchFilters.landAreaMin)
      filtered = filtered.filter(property => 
        property.land_area && property.land_area >= minArea
      )
    }
    if (searchFilters.landAreaMax) {
      const maxArea = parseFloat(searchFilters.landAreaMax)
      filtered = filtered.filter(property => 
        property.land_area && property.land_area <= maxArea
      )
    }

    // 建物面積フィルタ
    if (searchFilters.buildingAreaMin) {
      const minArea = parseFloat(searchFilters.buildingAreaMin)
      filtered = filtered.filter(property => 
        property.building_area && property.building_area >= minArea
      )
    }
    if (searchFilters.buildingAreaMax) {
      const maxArea = parseFloat(searchFilters.buildingAreaMax)
      filtered = filtered.filter(property => 
        property.building_area && property.building_area <= maxArea
      )
    }

    // 最寄り駅フィルタ
    if (searchFilters.nearStation) {
      filtered = filtered.filter(property => 
        property.station && 
        property.station.includes(searchFilters.nearStation)
      )
    }

    setFilteredProperties(filtered)
  }

  // 検索実行ハンドラ
  const handleSearch = (filters: typeof searchFilters) => {
    setSearchFilters(filters)
    
    // URLパラメータを更新
    const params = new URLSearchParams()
    if (filters.area) params.set('area', filters.area)
    if (filters.types.length > 0) params.set('types', filters.types.join(','))
    
    router.push(`/properties?${params.toString()}`)
  }

  // リトライボタン
  const handleRetry = () => {
    fetchProperties()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          再試行
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">物件一覧</h1>
      
      {/* 検索コンポーネント */}
      <PropertySearch 
        onSearch={handleSearch}
        initialFilters={searchFilters}
      />
      
      {/* 検索結果表示 */}
      <div className="mt-8">
        <p className="text-gray-600 mb-4">
          検索結果: {filteredProperties.length}件
        </p>
        
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">該当する物件が見つかりませんでした</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                showFavoriteButton={!property.id.startsWith('suumo-')}
                linkTo={property.source_url || undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// メインコンポーネント（Suspense対応）
export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  )
}
