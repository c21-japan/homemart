'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'
import PropertySearch from '@/components/PropertySearch'

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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [selectedArea, setSelectedArea] = useState('奈良県')
  
  // 簡易検索の状態
  const [simpleSearch, setSimpleSearch] = useState({
    area: '奈良県',
    propertyType: '',
    keyword: ''
  })

  // エリアの選択肢
  const areaOptions = ['奈良県', '大阪府', '京都府', '兵庫県']

  // 種別の選択肢
  const propertyTypeOptions = ['', '新築戸建', '中古戸建', '中古マンション', '土地']

  // プロパティデータを取得
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching properties:', error)
        } else {
          setProperties(data || [])
          setFilteredProperties(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // 簡易検索の実行
  const handleSimpleSearch = () => {
    console.log('簡易検索実行:', simpleSearch) // デバッグ用
    let filtered = properties

    // エリアで絞り込み
    if (simpleSearch.area && simpleSearch.area !== '奈良県') {
      filtered = filtered.filter(property => 
        property.prefecture === simpleSearch.area || 
        property.city.includes(simpleSearch.area) ||
        property.address.includes(simpleSearch.area)
      )
    }

    // 種別で絞り込み
    if (simpleSearch.propertyType) {
      filtered = filtered.filter(property => 
        property.property_type === simpleSearch.propertyType
      )
    }

    // キーワードで絞り込み
    if (simpleSearch.keyword.trim()) {
      const keyword = simpleSearch.keyword.toLowerCase().trim()
      filtered = filtered.filter(property => 
        property.name.toLowerCase().includes(keyword) ||
        property.address.toLowerCase().includes(keyword) ||
        property.station?.toLowerCase().includes(keyword) ||
        property.staff_comment?.toLowerCase().includes(keyword)
      )
    }

    console.log('絞り込み前:', properties.length, '件')
    console.log('絞り込み後:', filtered.length, '件')
    setFilteredProperties(filtered)
  }

  // 検索条件をクリア
  const handleClearSearch = () => {
    setSimpleSearch({
      area: '奈良県',
      propertyType: '',
      keyword: ''
    })
    setFilteredProperties(properties)
  }

  // 詳細検索の結果を受け取る
  useEffect(() => {
    const handlePropertySearch = (event: CustomEvent) => {
      console.log('詳細検索イベント受信:', event.detail) // デバッグ用
      const searchParams = event.detail
      let filtered = [...properties] // 配列のコピーを作成

      console.log('詳細検索開始 - 元の物件数:', filtered.length)

      // エリアで絞り込み
      if (searchParams.area) {
        filtered = filtered.filter(property => 
          property.prefecture === searchParams.area || 
          property.city.includes(searchParams.area) ||
          property.address.includes(searchParams.area)
        )
        console.log('エリア絞り込み後:', filtered.length, '件')
      }

      // 種別で絞り込み
      if (searchParams.types && searchParams.types.length > 0) {
        filtered = filtered.filter(property => 
          searchParams.types.includes(property.property_type)
        )
        console.log('種別絞り込み後:', filtered.length, '件 (選択種別:', searchParams.types, ')')
      }

      // 間取りで絞り込み
      if (searchParams.layouts && searchParams.layouts.length > 0) {
        filtered = filtered.filter(property => 
          property.layout && searchParams.layouts.includes(property.layout)
        )
        console.log('間取り絞り込み後:', filtered.length, '件')
      }

      // 価格で絞り込み
      if (searchParams.priceMin) {
        filtered = filtered.filter(property => 
          property.price >= parseInt(searchParams.priceMin)
        )
        console.log('価格下限絞り込み後:', filtered.length, '件')
      }
      if (searchParams.priceMax) {
        filtered = filtered.filter(property => 
          property.price <= parseInt(searchParams.priceMax)
        )
        console.log('価格上限絞り込み後:', filtered.length, '件')
      }

      // 築年数で絞り込み
      if (searchParams.ageMin) {
        filtered = filtered.filter(property => 
          property.building_age && property.building_age >= parseInt(searchParams.ageMin)
        )
        console.log('築年数下限絞り込み後:', filtered.length, '件')
      }
      if (searchParams.ageMax) {
        filtered = filtered.filter(property => 
          property.building_age && property.building_age <= parseInt(searchParams.ageMax)
        )
        console.log('築年数上限絞り込み後:', filtered.length, '件')
      }

      // 土地面積で絞り込み
      if (searchParams.landAreaMin) {
        filtered = filtered.filter(property => 
          property.land_area && property.land_area >= parseInt(searchParams.landAreaMin)
        )
        console.log('土地面積下限絞り込み後:', filtered.length, '件')
      }
      if (searchParams.landAreaMax) {
        filtered = filtered.filter(property => 
          property.land_area && property.land_area <= parseInt(searchParams.landAreaMax)
        )
        console.log('土地面積上限絞り込み後:', filtered.length, '件')
      }

      // 建物面積で絞り込み
      if (searchParams.buildingAreaMin) {
        filtered = filtered.filter(property => 
          property.building_area && property.building_area >= parseInt(searchParams.buildingAreaMin)
        )
        console.log('建物面積下限絞り込み後:', filtered.length, '件')
      }
      if (searchParams.buildingAreaMax) {
        filtered = filtered.filter(property => 
          property.building_area && property.building_area <= parseInt(searchParams.buildingAreaMax)
        )
        console.log('建物面積上限絞り込み後:', filtered.length, '件')
      }

      // 徒歩時間で絞り込み
      if (searchParams.walkingTime) {
        filtered = filtered.filter(property => 
          property.walking_time && property.walking_time <= parseInt(searchParams.walkingTime)
        )
        console.log('徒歩時間絞り込み後:', filtered.length, '件')
      }

      console.log('詳細検索絞り込み前:', properties.length, '件')
      console.log('詳細検索絞り込み後:', filtered.length, '件')
      console.log('最終絞り込み結果:', filtered.map(p => ({ id: p.id, name: p.name, type: p.property_type })))
      
      setFilteredProperties(filtered)
    }

    // イベントリスナーを追加
    window.addEventListener('propertySearch', handlePropertySearch as EventListener)

    // クリーンアップ
    return () => {
      window.removeEventListener('propertySearch', handlePropertySearch as EventListener)
    }
  }, [properties])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">物件一覧</h1>
          <p className="text-gray-600 mb-6">お客様に最適な物件をご紹介します</p>
          
          {/* 簡易検索 */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">簡易検索</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* エリア選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">エリア</label>
                <select
                  value={simpleSearch.area}
                  onChange={(e) => setSimpleSearch(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                >
                  {areaOptions.map(area => (
                    <option key={area} value={area} className="text-base">{area}</option>
                  ))}
                </select>
              </div>

              {/* 種別選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">種別</label>
                <select
                  value={simpleSearch.propertyType}
                  onChange={(e) => setSimpleSearch(prev => ({ ...prev, propertyType: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                >
                  {propertyTypeOptions.map(type => (
                    <option key={type} value={type} className="text-base">{type || 'すべて'}</option>
                  ))}
                </select>
              </div>

              {/* キーワード検索 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">キーワード</label>
                <input
                  type="text"
                  placeholder="駅名・エリア名・条件など"
                  value={simpleSearch.keyword}
                  onChange={(e) => setSimpleSearch(prev => ({ ...prev, keyword: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* 検索ボタン */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('検索ボタンクリック:', simpleSearch)
                    handleSimpleSearch()
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                >
                  検索
                </button>
                <button
                  onClick={() => {
                    console.log('クリアボタンクリック')
                    handleClearSearch()
                  }}
                  className="px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-bold transition-colors"
                >
                  クリア
                </button>
              </div>
            </div>
          </div>

          {/* 詳細検索ボタン */}
          <button
            onClick={() => setShowSearch(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-md"
          >
            🔍 詳細検索
          </button>
        </div>
      </div>

      {/* 物件一覧 */}
      <div className="container mx-auto px-4 py-8">
        {filteredProperties && filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property: Property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">物件が見つかりません</h3>
            <p className="text-gray-500">
              {properties.length > 0 ? '検索条件に合う物件がありません' : '現在、表示可能な物件がありません'}
            </p>
          </div>
        )}
      </div>

      {/* 検索モーダル */}
      {showSearch && (
        <PropertySearch
          selectedArea={selectedArea}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  )
}
