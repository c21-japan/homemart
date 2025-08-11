'use client'

import { useState, useEffect } from 'react'
import PropertySearch from './PropertySearch'
import { getPropertyCountsByArea } from '@/lib/supabase/properties'
import { supabase } from '@/lib/supabase'

export default function AreaSearch() {
  const [selectedPrefecture, setSelectedPrefecture] = useState<'nara' | 'osaka'>('nara')
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [propertyCounts, setPropertyCounts] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)

  // エリアデータの定義（物件数は動的に更新される）
  const areaData = {
    nara: [
      { name: '奈良市', prefecture: '奈良県' },
      { name: '天理市', prefecture: '奈良県' },
      { name: '香芝市', prefecture: '奈良県' },
      { name: '生駒郡斑鳩町', prefecture: '奈良県' },
      { name: '磯城郡三宅町', prefecture: '奈良県' },
      { name: '北葛城郡王寺町', prefecture: '奈良県' },
      { name: '北葛城郡上牧町', prefecture: '奈良県' },
      { name: '大和高田市', prefecture: '奈良県' },
      { name: '橿原市', prefecture: '奈良県' },
      { name: '葛城市', prefecture: '奈良県' },
      { name: '生駒郡安堵町', prefecture: '奈良県' },
      { name: '生駒郡平群町', prefecture: '奈良県' },
      { name: '磯城郡川西町', prefecture: '奈良県' },
      { name: '北葛城郡河合町', prefecture: '奈良県' },
      { name: '大和郡山市', prefecture: '奈良県' },
      { name: '桜井市', prefecture: '奈良県' },
      { name: '生駒市', prefecture: '奈良県' },
      { name: '生駒郡三郷町', prefecture: '奈良県' },
      { name: '磯城郡田原本町', prefecture: '奈良県' },
      { name: '北葛城郡広陵町', prefecture: '奈良県' }
    ],
    osaka: [
      { name: '堺市堺区', prefecture: '大阪府' },
      { name: '堺市中区', prefecture: '大阪府' },
      { name: '堺市東区', prefecture: '大阪府' },
      { name: '堺市西区', prefecture: '大阪府' },
      { name: '堺市南区', prefecture: '大阪府' },
      { name: '堺市北区', prefecture: '大阪府' },
      { name: '堺市美原区', prefecture: '大阪府' },
      { name: '岸和田市', prefecture: '大阪府' },
      { name: '吹田市', prefecture: '大阪府' },
      { name: '貝塚市', prefecture: '大阪府' },
      { name: '茨木市', prefecture: '大阪府' },
      { name: '富田林市', prefecture: '大阪府' },
      { name: '松原市', prefecture: '大阪府' },
      { name: '箕面市', prefecture: '大阪府' },
      { name: '門真市', prefecture: '大阪府' },
      { name: '藤井寺市', prefecture: '大阪府' },
      { name: '四條畷市', prefecture: '大阪府' },
      { name: '泉大津市', prefecture: '大阪府' },
      { name: '守口市', prefecture: '大阪府' },
      { name: '八尾市', prefecture: '大阪府' },
      { name: '寝屋川市', prefecture: '大阪府' },
      { name: '大東市', prefecture: '大阪府' },
      { name: '柏原市', prefecture: '大阪府' },
      { name: '摂津市', prefecture: '大阪府' },
      { name: '交野市', prefecture: '大阪府' },
      { name: '池田市', prefecture: '大阪府' },
      { name: '高槻市', prefecture: '大阪府' },
      { name: '枚方市', prefecture: '大阪府' },
      { name: '泉佐野市', prefecture: '大阪府' },
      { name: '河内長野市', prefecture: '大阪府' },
      { name: '和泉市', prefecture: '大阪府' },
      { name: '羽曳野市', prefecture: '大阪府' },
      { name: '高石市', prefecture: '大阪府' },
      { name: '泉南市', prefecture: '大阪府' },
      { name: '大阪狭山市', prefecture: '大阪府' }
    ]
  }

  // 物件数を取得する関数
  async function fetchPropertyCounts() {
    setLoading(true)
    try {
      const counts = await getPropertyCountsByArea()
      setPropertyCounts(counts)
    } catch (error) {
      console.error('Error fetching property counts:', error)
    } finally {
      setLoading(false)
    }
  }

  // コンポーネントマウント時に物件数を取得 + リアルタイム更新の設定
  useEffect(() => {
    // 初回読み込み
    fetchPropertyCounts()

    // リアルタイム更新の設定
    const channel = supabase
      .channel('properties-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE すべてを監視
          schema: 'public',
          table: 'properties'
        },
        (payload) => {
          console.log('物件データが更新されました:', payload)
          // データが変更されたら自動的に件数を再取得
          fetchPropertyCounts()
        }
      )
      .subscribe()

    // クリーンアップ（コンポーネントがアンマウントされるときに購読解除）
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // ページがフォーカスされたときも更新（念のため）
  useEffect(() => {
    const handleFocus = () => {
      fetchPropertyCounts()
    }

    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // エリアごとの物件数を取得
  const getAreaCount = (prefecture: string, city: string) => {
    const key = `${prefecture}_${city}`
    return propertyCounts[key] || 0
  }

  const handleAreaClick = (area: { name: string, prefecture: string }) => {
    const count = getAreaCount(area.prefecture, area.name)
    if (count === 0) {
      return // 物件数が0の場合は何もしない
    }
    // 既存のPropertySearchコンポーネントに渡す形式に合わせる
    setSelectedArea(area.name)
  }

  // 検索画面を閉じる関数
  const handleCloseSearch = () => {
    setSelectedArea(null)
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
          {loading && (
            <span className="text-sm text-gray-500 ml-2">（読み込み中...）</span>
          )}
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
          {areaData[selectedPrefecture].map((area) => {
            const count = getAreaCount(area.prefecture, area.name)
            return (
              <button
                key={area.name}
                onClick={() => handleAreaClick(area)}
                disabled={count === 0}
                className={`p-3 rounded-lg border-2 transition-all ${
                  count > 0
                    ? 'border-gray-200 hover:border-orange-500 hover:bg-orange-50 hover:shadow-md cursor-pointer'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="text-sm font-medium text-gray-700">{area.name}</div>
                <div className={`text-xs mt-1 font-bold ${
                  count > 0 ? 'text-orange-500' : 'text-gray-400'
                }`}>
                  {loading ? '...' : `${count}件`}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 既存の検索画面モーダルを使用 */}
      {selectedArea && (
        <PropertySearch 
          selectedArea={selectedArea} 
          onClose={handleCloseSearch}
        />
      )}
    </>
  )
}
