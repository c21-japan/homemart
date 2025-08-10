'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PropertySearchProps {
  selectedArea: string
}

export default function PropertySearch({ selectedArea }: PropertySearchProps) {
  const router = useRouter()
  
  // 各検索条件の状態管理
  const [searchConditions, setSearchConditions] = useState({
    propertyTypes: [] as string[],
    layouts: [] as string[],
    priceMin: '',
    priceMax: '',
    ageMin: '',
    ageMax: '',
    landAreaMin: '',
    landAreaMax: '',
    buildingAreaMin: '',
    buildingAreaMax: '',
    walkingTime: ''
  })

  // 種別の選択肢
  const propertyTypes = ['新築戸建', '中古戸建', '中古マンション', '土地']
  
  // 間取りの選択肢
  const layouts = ['1DK/LDK', '2DK/LDK', '3DK/LDK', '4DK/LDK', '5DK/LDK〜']
  
  // 価格の選択肢
  const priceOptions = {
    min: [
      { value: '', label: '下限なし' },
      { value: '10000000', label: '1,000万円〜' },
      { value: '12500000', label: '1,250万円〜' },
      { value: '15000000', label: '1,500万円〜' },
      { value: '17500000', label: '1,750万円〜' },
      { value: '20000000', label: '2,000万円〜' },
      { value: '22500000', label: '2,250万円〜' },
      { value: '25000000', label: '2,500万円〜' },
      { value: '27500000', label: '2,750万円〜' },
      { value: '30000000', label: '3,000万円〜' },
      { value: '32500000', label: '3,250万円〜' },
      { value: '35000000', label: '3,500万円〜' },
      { value: '37500000', label: '3,750万円〜' },
      { value: '40000000', label: '4,000万円〜' },
      { value: '45000000', label: '4,500万円〜' },
      { value: '50000000', label: '5,000万円〜' }
    ],
    max: [
      { value: '10000000', label: '〜1,000万円' },
      { value: '12500000', label: '〜1,250万円' },
      { value: '15000000', label: '〜1,500万円' },
      { value: '17500000', label: '〜1,750万円' },
      { value: '20000000', label: '〜2,000万円' },
      { value: '22500000', label: '〜2,250万円' },
      { value: '25000000', label: '〜2,500万円' },
      { value: '27500000', label: '〜2,750万円' },
      { value: '30000000', label: '〜3,000万円' },
      { value: '32500000', label: '〜3,250万円' },
      { value: '35000000', label: '〜3,500万円' },
      { value: '37500000', label: '〜3,750万円' },
      { value: '40000000', label: '〜4,000万円' },
      { value: '45000000', label: '〜4,500万円' },
      { value: '50000000', label: '〜5,000万円' },
      { value: '', label: '上限なし' }
    ]
  }

  // 築年数の選択肢
  const ageOptions = {
    min: [
      { value: '', label: '下限なし' },
      { value: '5', label: '5年以上〜' },
      { value: '10', label: '10年以上〜' },
      { value: '15', label: '15年以上〜' },
      { value: '20', label: '20年以上〜' }
    ],
    max: [
      { value: '5', label: '〜5年以内' },
      { value: '10', label: '〜10年以内' },
      { value: '15', label: '〜15年以内' },
      { value: '20', label: '〜20年以内' },
      { value: '', label: '上限なし' }
    ]
  }

  // 土地面積の選択肢
  const landAreaOptions = {
    min: [
      { value: '', label: '下限なし' },
      { value: '50', label: '50m²〜' },
      { value: '60', label: '60m²〜' },
      { value: '70', label: '70m²〜' },
      { value: '80', label: '80m²〜' },
      { value: '90', label: '90m²〜' },
      { value: '100', label: '100m²〜' },
      { value: '110', label: '110m²〜' },
      { value: '120', label: '120m²〜' },
      { value: '150', label: '150m²〜' },
      { value: '200', label: '200m²〜' }
    ],
    max: [
      { value: '50', label: '〜50m²' },
      { value: '60', label: '〜60m²' },
      { value: '70', label: '〜70m²' },
      { value: '80', label: '〜80m²' },
      { value: '90', label: '〜90m²' },
      { value: '100', label: '〜100m²' },
      { value: '110', label: '〜110m²' },
      { value: '120', label: '〜120m²' },
      { value: '150', label: '〜150m²' },
      { value: '200', label: '〜200m²' },
      { value: '', label: '上限なし' }
    ]
  }

  // 建物面積の選択肢
  const buildingAreaOptions = {
    min: [
      { value: '', label: '下限なし' },
      { value: '30', label: '30m²〜' },
      { value: '40', label: '40m²〜' },
      { value: '50', label: '50m²〜' },
      { value: '60', label: '60m²〜' },
      { value: '70', label: '70m²〜' },
      { value: '80', label: '80m²〜' },
      { value: '90', label: '90m²〜' },
      { value: '100', label: '100m²〜' },
      { value: '110', label: '110m²〜' },
      { value: '120', label: '120m²〜' }
    ],
    max: [
      { value: '30', label: '〜30m²' },
      { value: '40', label: '〜40m²' },
      { value: '50', label: '〜50m²' },
      { value: '60', label: '〜60m²' },
      { value: '70', label: '〜70m²' },
      { value: '80', label: '〜80m²' },
      { value: '90', label: '〜90m²' },
      { value: '100', label: '〜100m²' },
      { value: '110', label: '〜110m²' },
      { value: '120', label: '〜120m²' },
      { value: '', label: '上限なし' }
    ]
  }

  // 徒歩時間の選択肢
  const walkingTimeOptions = [
    { value: '', label: '条件なし' },
    { value: '5', label: '〜徒歩5分' },
    { value: '10', label: '〜徒歩10分' },
    { value: '15', label: '〜徒歩15分' }
  ]

  // 種別の選択/解除
  const togglePropertyType = (type: string) => {
    setSearchConditions(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }))
  }

  // 間取りの選択/解除
  const toggleLayout = (layout: string) => {
    setSearchConditions(prev => ({
      ...prev,
      layouts: prev.layouts.includes(layout)
        ? prev.layouts.filter(l => l !== layout)
        : [...prev.layouts, layout]
    }))
  }

  // 検索実行
  const handleSearch = () => {
    const params = new URLSearchParams()
    params.append('area', selectedArea)
    
    if (searchConditions.propertyTypes.length > 0) {
      params.append('types', searchConditions.propertyTypes.join(','))
    }
    if (searchConditions.layouts.length > 0) {
      params.append('layouts', searchConditions.layouts.join(','))
    }
    if (searchConditions.priceMin) params.append('priceMin', searchConditions.priceMin)
    if (searchConditions.priceMax) params.append('priceMax', searchConditions.priceMax)
    if (searchConditions.ageMin) params.append('ageMin', searchConditions.ageMin)
    if (searchConditions.ageMax) params.append('ageMax', searchConditions.ageMax)
    if (searchConditions.landAreaMin) params.append('landAreaMin', searchConditions.landAreaMin)
    if (searchConditions.landAreaMax) params.append('landAreaMax', searchConditions.landAreaMax)
    if (searchConditions.buildingAreaMin) params.append('buildingAreaMin', searchConditions.buildingAreaMin)
    if (searchConditions.buildingAreaMax) params.append('buildingAreaMax', searchConditions.buildingAreaMax)
    if (searchConditions.walkingTime) params.append('walkingTime', searchConditions.walkingTime)

    router.push(`/properties/search?${params.toString()}`)
  }

  // 条件クリア
  const handleClear = () => {
    setSearchConditions({
      propertyTypes: [],
      layouts: [],
      priceMin: '',
      priceMax: '',
      ageMin: '',
      ageMax: '',
      landAreaMin: '',
      landAreaMax: '',
      buildingAreaMin: '',
      buildingAreaMax: '',
      walkingTime: ''
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
          {/* ヘッダー */}
          <div className="bg-orange-500 text-white p-6 rounded-t-lg">
            <h2 className="text-2xl font-bold">物件検索</h2>
            <p className="mt-2">エリア：{selectedArea}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* 種別 */}
            <div>
              <h3 className="font-bold mb-3">種別（複数選択可）</h3>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => togglePropertyType(type)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      searchConditions.propertyTypes.includes(type)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 間取り */}
            <div>
              <h3 className="font-bold mb-3">間取り（複数選択可）</h3>
              <div className="flex flex-wrap gap-2">
                {layouts.map(layout => (
                  <button
                    key={layout}
                    onClick={() => toggleLayout(layout)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      searchConditions.layouts.includes(layout)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    {layout}
                  </button>
                ))}
              </div>
            </div>

            {/* 物件価格 */}
            <div>
              <h3 className="font-bold mb-3">物件価格</h3>
              <div className="flex gap-2 items-center">
                <select
                  value={searchConditions.priceMin}
                  onChange={(e) => setSearchConditions(prev => ({ ...prev, priceMin: e.target.value }))}
                  className="flex-1 p-2 border rounded-lg"
                >
                  {priceOptions.min.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <span>〜</span>
                <select
                  value={searchConditions.priceMax}
                  onChange={(e) => setSearchConditions(prev => ({ ...prev, priceMax: e.target.value }))}
                  className="flex-1 p-2 border rounded-lg"
                >
                  {priceOptions.max.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 築年月 */}
            <div>
              <h3 className="font-bold mb-3">築年月</h3>
              <div className="flex gap-2 items-center">
                <select
                  value={searchConditions.ageMin}
                  onChange={(e) => setSearchConditions(prev => ({ ...prev, ageMin: e.target.value }))}
                  className="flex-1 p-2 border rounded-lg"
                >
                  {ageOptions.min.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <span>〜</span>
                <select
                  value={searchConditions.ageMax}
                  onChange={(e) => setSearchConditions(prev => ({ ...prev, ageMax: e.target.value }))}
                  className="flex-1 p-2 border rounded-lg"
                >
                  {ageOptions.max.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 土地面積 */}
            <div>
              <h3 className="font-bold mb-3">土地面積</h3>
              <div className="flex gap-2 items-center">
                <select
                  value={searchConditions.landAreaMin}
                  onChange={(e) => setSearchConditions(prev => ({ ...prev, landAreaMin: e.target.value }))}
                  className="flex-1 p-2 border rounded-lg"
                >
                  {landAreaOptions.min.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <span>〜</span>
                <select
                  value={searchConditions.landAreaMax}
                  onChange={(e) => setSearchConditions(prev => ({ ...prev, landAreaMax: e.target.value }))}
                  className="flex-1 p-2 border rounded-lg"
                >
                  {landAreaOptions.max.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 建物面積 */}
            <div>
              <h3 className="font-bold mb-3">建物面積</h3>
              <div className="flex gap-2 items-center">
                <select
                  value={searchConditions.buildingAreaMin}
                  onChange={(e) => setSearchConditions(prev => ({ ...prev, buildingAreaMin: e.target.value }))}
                  className="flex-1 p-2 border rounded-lg"
                >
                  {buildingAreaOptions.min.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <span>〜</span>
                <select
                  value={searchConditions.buildingAreaMax}
                  onChange={(e) => setSearchConditions(prev => ({ ...prev, buildingAreaMax: e.target.value }))}
                  className="flex-1 p-2 border rounded-lg"
                >
                  {buildingAreaOptions.max.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 駅までの徒歩 */}
            <div>
              <h3 className="font-bold mb-3">駅までの徒歩</h3>
              <select
                value={searchConditions.walkingTime}
                onChange={(e) => setSearchConditions(prev => ({ ...prev, walkingTime: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                {walkingTimeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* ボタン */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSearch}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors"
              >
                この条件で検索
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-colors"
              >
                条件をクリア
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
