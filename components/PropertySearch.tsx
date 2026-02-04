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

  // 完全なエリアリスト（奈良県・大阪府）
  const areas = [
    // 奈良県北部
    '広陵町', '香芝市', '大和高田市', '橿原市', '田原本町',
    '上牧町', '王寺町', '河合町', '三郷町', '斑鳩町',
    '安堵町', '川西町', '三宅町', '平群町',
    // 奈良県中部
    '奈良市', '大和郡山市', '天理市', '生駒市',
    // 奈良県南部
    '桜井市', '五條市', '御所市', '葛城市',
    // 大阪府東部
    '東大阪市', '八尾市', '柏原市', '藤井寺市', '羽曳野市',
    '松原市', '大阪狭山市', '富田林市', '河内長野市',
    // 大阪府北部
    '大阪市', '堺市', '豊中市', '吹田市', '高槻市',
    '枚方市', '茨木市', '箕面市', '池田市'
  ].sort() // アルファベット順にソート

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
    { value: '50000000', label: '5,000万円' },
    { value: '60000000', label: '6,000万円' },
    { value: '70000000', label: '7,000万円' },
    { value: '80000000', label: '8,000万円' },
    { value: '90000000', label: '9,000万円' },
    { value: '100000000', label: '1億円' }
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
    { value: '300', label: '300㎡' },
    { value: '400', label: '400㎡' },
    { value: '500', label: '500㎡' }
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
    console.log('検索実行:', filters) // デバッグ用
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

  // エリアグループ化
  const groupedAreas = {
    '奈良県北部': areas.filter(a => 
      ['広陵町', '香芝市', '大和高田市', '橿原市', '田原本町', '上牧町', '王寺町', '河合町', '三郷町', '斑鳩町', '安堵町', '川西町', '三宅町', '平群町'].includes(a)
    ),
    '奈良県中部': areas.filter(a => 
      ['奈良市', '大和郡山市', '天理市', '生駒市'].includes(a)
    ),
    '奈良県南部': areas.filter(a => 
      ['桜井市', '五條市', '御所市', '葛城市'].includes(a)
    ),
    '大阪府東部': areas.filter(a => 
      ['東大阪市', '八尾市', '柏原市', '藤井寺市', '羽曳野市', '松原市', '大阪狭山市', '富田林市', '河内長野市'].includes(a)
    ),
    '大阪府北部': areas.filter(a => 
      ['大阪市', '堺市', '豊中市', '吹田市', '高槻市', '枚方市', '茨木市', '箕面市', '池田市'].includes(a)
    )
  }

  return (
    <div className="rounded-3xl border border-[#EAD8A6] bg-white p-6 shadow-[0_18px_40px_rgba(21,19,13,0.08)]">
      <div className="space-y-5">
        <h2 className="text-xl font-display text-[#15130D]">物件を検索</h2>
        
        {/* エリア選択（グループ化） */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8C7A4C]">
            エリア
          </label>
          <select
            value={filters.area}
            onChange={(e) => handleFilterChange('area', e.target.value)}
            className="w-full rounded-2xl border border-[#EAD8A6] bg-[#FFF6DE]/40 px-4 py-3 text-sm text-[#3B3323] focus:outline-none focus:ring-2 focus:ring-[#F4C84B]"
          >
            <option value="">すべてのエリア</option>
            {Object.entries(groupedAreas).map(([group, groupAreas]) => (
              <optgroup key={group} label={group}>
                {groupAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* 物件種別 */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8C7A4C]">
            物件種別
          </label>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => togglePropertyType(type)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  filters.types.includes(type)
                    ? 'bg-[#15130D] text-[#F4C84B]'
                    : 'bg-[#FFF6DE] text-[#6E5B2E] hover:bg-[#F4C84B] hover:text-[#15130D]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 詳細検索トグル */}
        <button
          type="button"
          onClick={() => setIsDetailedSearch(!isDetailedSearch)}
          className="flex items-center gap-2 text-sm font-semibold text-[#8C7A4C] hover:text-[#15130D]"
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
          <div className="space-y-4 border-t border-[#EAD8A6] pt-4">
            {/* 価格 */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8C7A4C]">
                価格
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="rounded-2xl border border-[#EAD8A6] bg-[#FFF6DE]/40 px-4 py-3 text-sm text-[#3B3323] focus:outline-none focus:ring-2 focus:ring-[#F4C84B]"
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
                  className="rounded-2xl border border-[#EAD8A6] bg-[#FFF6DE]/40 px-4 py-3 text-sm text-[#3B3323] focus:outline-none focus:ring-2 focus:ring-[#F4C84B]"
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
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8C7A4C]">
                土地面積
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.landAreaMin}
                  onChange={(e) => handleFilterChange('landAreaMin', e.target.value)}
                  className="rounded-2xl border border-[#EAD8A6] bg-[#FFF6DE]/40 px-4 py-3 text-sm text-[#3B3323] focus:outline-none focus:ring-2 focus:ring-[#F4C84B]"
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
                  className="rounded-2xl border border-[#EAD8A6] bg-[#FFF6DE]/40 px-4 py-3 text-sm text-[#3B3323] focus:outline-none focus:ring-2 focus:ring-[#F4C84B]"
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
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8C7A4C]">
                建物面積
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.buildingAreaMin}
                  onChange={(e) => handleFilterChange('buildingAreaMin', e.target.value)}
                  className="rounded-2xl border border-[#EAD8A6] bg-[#FFF6DE]/40 px-4 py-3 text-sm text-[#3B3323] focus:outline-none focus:ring-2 focus:ring-[#F4C84B]"
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
                  className="rounded-2xl border border-[#EAD8A6] bg-[#FFF6DE]/40 px-4 py-3 text-sm text-[#3B3323] focus:outline-none focus:ring-2 focus:ring-[#F4C84B]"
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
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8C7A4C]">
                最寄り駅
              </label>
              <input
                type="text"
                value={filters.nearStation}
                onChange={(e) => handleFilterChange('nearStation', e.target.value)}
                placeholder="駅名を入力"
                className="w-full rounded-2xl border border-[#EAD8A6] bg-[#FFF6DE]/40 px-4 py-3 text-sm text-[#3B3323] focus:outline-none focus:ring-2 focus:ring-[#F4C84B]"
              />
            </div>
          </div>
        )}

        {/* 検索ボタン */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleSearch}
            className="flex-1 rounded-2xl bg-[#15130D] px-6 py-3 text-sm font-semibold text-[#F4C84B] transition hover:bg-[#2A2418]"
          >
            検索する
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-2xl border border-[#EAD8A6] bg-[#FFF6DE] px-6 py-3 text-sm font-semibold text-[#6E5B2E] transition hover:bg-[#F4C84B] hover:text-[#15130D]"
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  )
}
