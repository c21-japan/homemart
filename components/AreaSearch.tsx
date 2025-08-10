'use client'

import { useState } from 'react'
import PropertySearch from './PropertySearch'

export default function AreaSearch() {
  const [selectedPrefecture, setSelectedPrefecture] = useState<'nara' | 'osaka'>('nara')
  const [selectedArea, setSelectedArea] = useState<string | null>(null)

  // エリアごとの物件数（後でデータベースから取得するように変更可能）
  const areaData = {
    nara: [
      { name: '奈良市', count: 23 },
      { name: '天理市', count: 5 },
      { name: '香芝市', count: 12 },
      { name: '生駒郡斑鳩町', count: 3 },
      { name: '磯城郡三宅町', count: 0 },
      { name: '北葛城郡王寺町', count: 8 },
      { name: '北葛城郡上牧町', count: 2 },
      { name: '大和高田市', count: 7 },
      { name: '橿原市', count: 15 },
      { name: '葛城市', count: 4 },
      { name: '生駒郡安堵町', count: 0 },
      { name: '生駒郡平群町', count: 1 },
      { name: '磯城郡川西町', count: 0 },
      { name: '北葛城郡河合町', count: 6 },
      { name: '大和郡山市', count: 9 },
      { name: '桜井市', count: 3 },
      { name: '生駒市', count: 18 },
      { name: '生駒郡三郷町', count: 5 },
      { name: '磯城郡田原本町', count: 2 },
      { name: '北葛城郡広陵町', count: 11 }
    ],
    osaka: [
      { name: '堺市堺区', count: 8 },
      { name: '堺市中区', count: 6 },
      { name: '堺市東区', count: 4 },
      { name: '堺市西区', count: 7 },
      { name: '堺市南区', count: 3 },
      { name: '堺市北区', count: 9 },
      { name: '堺市美原区', count: 2 },
      { name: '岸和田市', count: 5 },
      { name: '吹田市', count: 12 },
      { name: '貝塚市', count: 1 },
      { name: '茨木市', count: 8 },
      { name: '富田林市', count: 4 },
      { name: '松原市', count: 6 },
      { name: '箕面市', count: 10 },
      { name: '門真市', count: 3 },
      { name: '藤井寺市', count: 7 },
      { name: '四條畷市', count: 2 },
      { name: '泉大津市', count: 5 },
      { name: '守口市', count: 4 },
      { name: '八尾市', count: 9 },
      { name: '寝屋川市', count: 11 },
      { name: '大東市', count: 6 },
      { name: '柏原市', count: 2 },
      { name: '摂津市', count: 3 },
      { name: '交野市', count: 4 },
      { name: '池田市', count: 7 },
      { name: '高槻市', count: 15 },
      { name: '枚方市', count: 13 },
      { name: '泉佐野市', count: 5 },
      { name: '河内長野市', count: 3 },
      { name: '和泉市', count: 8 },
      { name: '羽曳野市', count: 6 },
      { name: '高石市', count: 2 },
      { name: '泉南市', count: 4 },
      { name: '大阪狭山市', count: 5 }
    ]
  }

  const handleAreaClick = (areaName: string) => {
    if (areaData[selectedPrefecture].find(a => a.name === areaName)?.count === 0) {
      return // 物件数が0の場合は何もしない
    }
    setSelectedArea(areaName)
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto p-4 bg-white rounded-lg shadow-sm">
        {/* タイトル */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          エリアから物件を探す
        </h2>

        {/* 県選択タブ */}
        <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
          <button
            onClick={() => setSelectedPrefecture('nara')}
            className={`px-6 py-2 font-medium rounded-t-lg transition-colors ${
              selectedPrefecture === 'nara'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            奈良県
          </button>
          <button
            onClick={() => setSelectedPrefecture('osaka')}
            className={`px-6 py-2 font-medium rounded-t-lg transition-colors ${
              selectedPrefecture === 'osaka'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            大阪府
          </button>
        </div>

        {/* エリアボタン一覧 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {areaData[selectedPrefecture].map((area) => (
            <button
              key={area.name}
              onClick={() => handleAreaClick(area.name)}
              disabled={area.count === 0}
              className={`p-3 rounded-lg border-2 transition-all ${
                area.count > 0
                  ? 'border-gray-200 hover:border-orange-500 hover:bg-orange-50 hover:shadow-md cursor-pointer'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-sm font-medium text-gray-700">{area.name}</div>
              <div className={`text-xs mt-1 font-bold ${
                area.count > 0 ? 'text-orange-500' : 'text-gray-400'
              }`}>
                {area.count}件
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 検索画面モーダル */}
      {selectedArea && (
        <PropertySearch selectedArea={selectedArea} />
      )}
    </>
  )
}
