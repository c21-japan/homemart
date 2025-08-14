'use client'

import { useState, useEffect } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface SearchFilters {
  area: string
  types: string[]
  priceMin: string
  priceMax: string
  landAreaMin: string
  landAreaMax: string
  buildingAreaMin: string
  buildingAreaMax: string
  nearStation: string
}

interface PropertySearchProps {
  onSearch: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
}

export default function PropertySearch({ onSearch, initialFilters }: PropertySearchProps) {
  const [isDetailedSearch, setIsDetailedSearch] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>(
    initialFilters || {
      area: '',
      types: [],
      priceMin: '',
      priceMax: '',
      landAreaMin: '',
      landAreaMax: '',
      buildingAreaMin: '',
      buildingAreaMax: '',
      nearStation: ''
    }
  )

  // 初期値が変更された場合の更新
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters)
      // 詳細検索項目が設定されている場合は詳細検索を開く
      if (
        initialFilters.priceMin || 
        initialFilters.priceMax || 
        initialFilters.landAreaMin ||
        initialFilters.landAreaMax ||
        initialFilters.buildingAreaMin ||
        initialFilters.buildingAreaMax ||
        initialFilters.nearStation
      ) {
        setIsDetailedSearch(true)
      }
    }
  }, [initialFilters])

  // エリアリスト
  const areas = [
    '広陵町', '香芝市', '大和高田市', '橿原市', '田原本町',
    '上牧町', '王寺町', '河合町', '三郷町', '斑鳩町'
  ]

  // 物件種別リスト
  const propertyTypes = [
    '新築戸建', '中古戸建', '土地', 'マンション', '収益物件'
  ]

  // 価格オプション
  const priceOptions = [
    { value: '', label: '下限なし' },
    { value: '5000000', label: '500万円' },
    { value: '10000000', label: '1,000万円' },
    { value: '15000000', label: '1,500万円' },
    { value: '20000000', label: '2,000万円' },
    { value: '25000000', label: '2,500万円' },
    { value: '30000000', label: '3,000万円' },
    { value: '35000000', label: '3,500万円' },
    { value: '40000000', label: '4,000万円' },
    { value: '50000000', label: '5,000万円' }
  ]

  // 面積オプション
  const areaOptions = [
    { value: '', label: '下限なし' },
    { value: '30', label: '30㎡' },
    { value: '50', label: '50㎡' },
    { value: '80', label: '80㎡' },
    { value: '100', label: '100㎡' },
    { value: '120', label: '120㎡' },
    { value: '150', label: '150㎡' },
    { value: '200', label: '200㎡' },
    { value: '250', label: '250㎡' },
    { value: '300', label: '300㎡' }
  ]

  // フィルター変更ハンドラ
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // 物件種別の選択/解除
  const togglePropertyType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }))
  }

  // 検索実行
  const handleSearch = () => {
    onSearch(filters)
  }

  // リセット
  const handleReset = () => {
    const resetFilters: SearchFilters = {
      area: '',
      types: [],
      priceMin: '',
      priceMax: '',
      landAreaMin: '',
      landAreaMax: '',
      buildingAreaMin: '',
      buildingAreaMax: '',
      nearStation: ''
    }
    setFilters(resetFilters)
    onSearch(resetFilters)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* かんたん検索 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">物件を検索</h2>
        
        {/* エリア選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            エリア
          </label>
          <select
            value={filters.area}
            onChange={(e) => handleFilterChange('area', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">すべてのエリア</option>
            {areas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {/* 物件種別 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            物件種別
          </label>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map(type => (
              <button
                key={type}
                onClick={() => togglePropertyType(type)}
                className={`px-4 py-2 rounded-md border transition-colors ${
                  filters.types.includes(type)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 詳細検索トグル */}
        <button
          onClick={() => setIsDetailedSearch(!isDetailedSearch)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          {isDetailedSearch ? (
            <>
              <ChevronUpIcon className="w-5 h-5" />
              詳細検索を閉じる
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-5 h-5" />
              詳細検索を開く
            </>
          )}
        </button>

        {/* 詳細検索 */}
        {isDetailedSearch && (
          <div className="space-y-4 pt-4 border-t">
            {/* 価格 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                価格
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">上限なし</option>
                  {priceOptions.slice(1).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 土地面積 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                土地面積
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.landAreaMin}
                  onChange={(e) => handleFilterChange('landAreaMin', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {areaOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.landAreaMax}
                  onChange={(e) => handleFilterChange('landAreaMax', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">上限なし</option>
                  {areaOptions.slice(1).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 建物面積 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                建物面積
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.buildingAreaMin}
                  onChange={(e) => handleFilterChange('buildingAreaMin', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {areaOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.buildingAreaMax}
                  onChange={(e) => handleFilterChange('buildingAreaMax', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">上限なし</option>
                  {areaOptions.slice(1).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 最寄り駅 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最寄り駅
              </label>
              <input
                type="text"
                value={filters.nearStation}
                onChange={(e) => handleFilterChange('nearStation', e.target.value)}
                placeholder="駅名を入力"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* 検索ボタン */}
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            検索する
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  )
}
