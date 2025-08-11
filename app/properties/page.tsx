'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import PropertyCard from '@/components/PropertyCard'

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

const PREFECTURES = ['奈良県', '大阪府']
const CITIES: { [key: string]: string[] } = {
  '奈良県': [
    '奈良市', '天理市', '香芝市', '生駒郡斑鳩町', '磯城郡三宅町',
    '北葛城郡王寺町', '北葛城郡上牧町', '大和高田市', '橿原市', '葛城市',
    '生駒郡安堵町', '生駒郡平群町', '磯城郡川西町', '北葛城郡河合町',
    '大和郡山市', '桜井市', '生駒市', '生駒郡三郷町', '磯城郡田原本町', '北葛城郡広陵町'
  ],
  '大阪府': [
    '堺市堺区', '堺市中区', '堺市東区', '堺市西区', '堺市南区', '堺市北区', '堺市美原区',
    '岸和田市', '吹田市', '貝塚市', '茨木市', '富田林市', '松原市', '箕面市',
    '門真市', '藤井寺市', '四條畷市', '泉大津市', '守口市', '八尾市',
    '寝屋川市', '大東市', '柏原市', '摂津市', '交野市', '池田市',
    '高槻市', '枚方市', '泉佐野市', '河内長野市', '和泉市', '羽曳野市',
    '高石市', '泉南市', '大阪狭山市'
  ]
}

const PROPERTY_TYPES = ['すべて', '新築戸建', '中古戸建', '中古マンション', '土地']
const PRICE_RANGES = [
  { label: 'すべて', min: 0, max: 999999 },
  { label: '〜1000万円', min: 0, max: 1000 },
  { label: '1000万円〜2000万円', min: 1000, max: 2000 },
  { label: '2000万円〜3000万円', min: 2000, max: 3000 },
  { label: '3000万円〜4000万円', min: 3000, max: 4000 },
  { label: '4000万円〜5000万円', min: 4000, max: 5000 },
  { label: '5000万円〜', min: 5000, max: 999999 }
]

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchExecuted, setSearchExecuted] = useState(false)
  
  // 検索条件
  const [selectedPrefecture, setSelectedPrefecture] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedType, setSelectedType] = useState('すべて')
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0])
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (data) {
        console.log('Fetched properties:', data)
        setProperties(data)
        setFilteredProperties(data)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
      // エラーが発生しても空配列をセット
      setProperties([])
      setFilteredProperties([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearchExecuted(true)
    let filtered = [...properties]

    // 都道府県で絞り込み
    if (selectedPrefecture) {
      filtered = filtered.filter(p => p.prefecture === selectedPrefecture)
    }

    // 市区町村で絞り込み
    if (selectedCity) {
      filtered = filtered.filter(p => p.city === selectedCity)
    }

    // 物件種別で絞り込み
    if (selectedType !== 'すべて') {
      filtered = filtered.filter(p => p.property_type === selectedType)
    }

    // 価格帯で絞り込み
    filtered = filtered.filter(p => 
      p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max
    )

    // キーワード検索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(keyword) ||
        p.address?.toLowerCase().includes(keyword) ||
        (p.station && p.station.toLowerCase().includes(keyword))
      )
    }

    setFilteredProperties(filtered)
  }

  const resetSearch = () => {
    setSelectedPrefecture('')
    setSelectedCity('')
    setSelectedType('すべて')
    setSelectedPriceRange(PRICE_RANGES[0])
    setSearchKeyword('')
    setFilteredProperties(properties)
    setSearchExecuted(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:underline">
            ← トップページに戻る
          </Link>
        </div>
      </div>

      {/* 検索フォーム */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">物件を探す</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* 都道府県 */}
            <div>
              <label className="block text-sm font-medium mb-2">都道府県</label>
              <select
                value={selectedPrefecture}
                onChange={(e) => {
                  setSelectedPrefecture(e.target.value)
                  setSelectedCity('')
                }}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                {PREFECTURES.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>

            {/* 市区町村 */}
            <div>
              <label className="block text-sm font-medium mb-2">市区町村</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                disabled={!selectedPrefecture}
              >
                <option value="">すべて</option>
                {selectedPrefecture && CITIES[selectedPrefecture]?.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* 物件種別 */}
            <div>
              <label className="block text-sm font-medium mb-2">物件種別</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* 価格帯 */}
            <div>
              <label className="block text-sm font-medium mb-2">価格帯</label>
              <select
                value={selectedPriceRange.label}
                onChange={(e) => {
                  const range = PRICE_RANGES.find(r => r.label === e.target.value)
                  if (range) setSelectedPriceRange(range)
                }}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                {PRICE_RANGES.map(range => (
                  <option key={range.label} value={range.label}>{range.label}</option>
                ))}
              </select>
            </div>

            {/* キーワード検索 */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-2">キーワード</label>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="物件名、住所、駅名で検索"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
            </div>
          </div>

          {/* 検索ボタン */}
          <div className="flex gap-4">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              この条件で検索
            </button>
            <button
              onClick={resetSearch}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              条件をクリア
            </button>
          </div>
        </div>
      </div>

      {/* 検索結果 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            {searchExecuted ? 
              `検索結果: ${filteredProperties.length}件` : 
              `全物件: ${properties.length}件`
            }
          </p>
          {filteredProperties.length > 0 && (
            <div className="text-sm text-gray-500">
              ※価格は万円単位で表示
            </div>
          )}
        </div>

        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-600 mb-2">
              {searchExecuted ? 
                '条件に合う物件が見つかりませんでした。' : 
                '現在、表示できる物件がありません。'
              }
            </p>
            {searchExecuted && (
              <button
                onClick={resetSearch}
                className="mt-4 text-blue-600 hover:underline"
              >
                検索条件をクリアして全物件を表示
              </button>
            )}
          </div>
        )}
      </div>

      {/* 管理者向けリンク */}
      {properties.length === 0 && !searchExecuted && (
        <div className="text-center pb-8">
          <Link 
            href="/admin" 
            className="text-blue-600 hover:underline text-sm"
          >
            管理画面から物件を登録する →
          </Link>
        </div>
      )}
    </div>
  )
}
