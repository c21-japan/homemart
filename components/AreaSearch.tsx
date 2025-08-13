'use client'

import { useState, useEffect } from 'react'
import PropertySearch from './PropertySearch'
import { getPropertyCountsByArea } from '@/lib/supabase/properties'
import { supabase } from '@/lib/supabase'

// 路線と駅のデータ（管理画面と同じ）
const routeStations: { [key: string]: string[] } = {
  'JR大和路線': ['王寺', '法隆寺', '大和小泉', '郡山', '奈良', '平城山', '木津', '加茂'],
  'JR和歌山線': ['王寺', '畠田', '志都美', '香芝', '高田', '大和新庄', '御所', '玉手', '掖上', '吉野口', '北宇智', '五条'],
  'JR桜井線': ['奈良', '京終', '帯解', '櫟本', '天理', '長柄', '柳本', '巻向', '三輪', '桜井', '香久山', '畝傍', '金橋', '高田'],
  '近鉄奈良線': ['大和西大寺', '新大宮', '近鉄奈良', '学園前', '富雄', '東生駒', '生駒', '石切', '額田', '枚岡', '瓢箪山', '東花園', '河内花園', '若江岩田', '八戸ノ里', '河内小阪', '河内永和', '俊徳道', '長瀬', '弥刀', '久宝寺口'],
  '近鉄大阪線': ['大和八木', '耳成', '大福', '桜井', '大和朝倉', '長谷寺', '榛原', '室生口大野', '三本松', '赤目口', '名張', '桔梗が丘', '美旗', '伊賀神戸'],
  '近鉄橿原線': ['大和西大寺', '尼ヶ辻', '西ノ京', '九条', '近鉄郡山', '筒井', '平端', 'ファミリー公園前', '結崎', '石見', '田原本', '笠縫', '新ノ口', '大和八木', '八木西口', '畝傍御陵前', '橿原神宮前'],
  '近鉄京都線': ['大和西大寺', '平城', '高の原', '山田川', '木津川台', '新祝園', '狛田', '新田辺', '興戸', '三山木', '近鉄宮津', '小倉', '伊勢田', '大久保', '久津川', '寺田', '富野荘', '向島'],
  '近鉄南大阪線': ['大阪阿部野橋', '河堀口', '北田辺', '今川', '針中野', '矢田', '河内天美', '布忍', '高見ノ里', '河内松原', '恵我ノ荘', '高鷲', '藤井寺', '土師ノ里', '道明寺', '古市', '駒ヶ谷', '上ノ太子', '二上山', '二上神社口', '当麻寺', '磐城', '尺土', '高田市', '浮孔', '坊城', '橿原神宮西口', '橿原神宮前'],
  '近鉄生駒線': ['王寺', '信貴山下', '勢野北口', '竜田川', '平群', '元山上口', '東山', '萩の台', '生駒'],
  '近鉄田原本線': ['西田原本', '黒田', '但馬', '池部', '佐味田川', '大輪田', '新王寺'],
  '近鉄御所線': ['尺土', '近鉄新庄', '忍海', '近鉄御所'],
  '近鉄吉野線': ['橿原神宮前', '岡寺', '飛鳥', '壺阪山', '市尾', '葛', '吉野口', '薬水', '大阿太', '福神', '下市口', '越部', '六田', '大和上市', '吉野神宮', '吉野'],
  '近鉄けいはんな線': ['生駒', '白庭台', '学研北生駒', '学研奈良登美ヶ丘'],
  '大阪メトロ御堂筋線': ['江坂', '東三国', '新大阪', '西中島南方', '中津', '梅田', '淀屋橋', '本町', '心斎橋', 'なんば', '大国町', '動物園前', '天王寺', '昭和町', '西田辺', '長居', 'あびこ', '北花田', '新金岡', 'なかもず'],
  '大阪メトロ谷町線': ['大日', '守口', '太子橋今市', '千林大宮', '関目高殿', '野江内代', '都島', '天神橋筋六丁目', '中崎町', '東梅田', '南森町', '天満橋', '谷町四丁目', '谷町六丁目', '谷町九丁目', '四天王寺前夕陽ヶ丘', '天王寺', '阿倍野', '文の里', '田辺', '駒川中野', '平野', '喜連瓜破', '出戸', '長原', '八尾南'],
  '大阪メトロ四つ橋線': ['西梅田', '肥後橋', '本町', '四ツ橋', 'なんば', '大国町', '花園町', '岸里', '玉出', '北加賀屋', '住之江公園'],
  '大阪メトロ中央線': ['コスモスクエア', '大阪港', '朝潮橋', '弁天町', '九条', '阿波座', '本町', '堺筋本町', '谷町四丁目', '森ノ宮', '緑橋', '深江橋', '高井田', '長田'],
  '大阪メトロ千日前線': ['野田阪神', '玉川', '阿波座', '西長堀', '桜川', 'なんば', '日本橋', '谷町九丁目', '鶴橋', '今里', '新深江', '小路', '北巽', '南巽'],
  '大阪メトロ堺筋線': ['天神橋筋六丁目', '扇町', '南森町', '北浜', '堺筋本町', '長堀橋', '日本橋', '恵美須町', '動物園前', '天下茶屋'],
  '南海本線': ['難波', '新今宮', '天下茶屋', '岸里玉出', '粉浜', '住吉大社', '住ノ江', '七道', '堺', '湊', '石津川', '諏訪ノ森', '浜寺公園', '羽衣', '高石', '北助松', '松ノ浜', '泉大津', '忠岡', '春木', '和泉大宮', '岸和田', '蛸地蔵', '貝塚', '二色浜', '鶴原', '井原里', '泉佐野', '羽倉崎', '吉見ノ里', '岡田浦', '樽井', '尾崎', '鳥取ノ荘', '箱作', '淡輪', '深日町', '深日港', '多奈川', '孝子', '和歌山大学前', '紀ノ川', '和歌山市'],
  '南海高野線': ['難波', '今宮戎', '新今宮', '萩ノ茶屋', '天下茶屋', '岸里玉出', '帝塚山', '住吉東', '沢ノ町', '我孫子前', '浅香山', '堺東', '三国ヶ丘', '百舌鳥八幡', '中百舌鳥', '白鷺', '初芝', '萩原天神', '北野田', '狭山', '大阪狭山市', '金剛', '滝谷', '千代田', '河内長野', '三日市町', '美加の台', '千早口', '天見', '紀見峠', '林間田園都市', '御幸辻', '橋本', '紀伊清水', '学文路', '九度山', '高野下', '下古沢', '上古沢', '紀伊細川', '紀伊神谷', '極楽橋']
}

export default function AreaSearch() {
  const [selectedPrefecture, setSelectedPrefecture] = useState<'nara' | 'osaka'>('nara')
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<string>('')
  const [availableStations, setAvailableStations] = useState<string[]>([])
  const [selectedStation, setSelectedStation] = useState<string>('')
  const [propertyCounts, setPropertyCounts] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)
  const [showRouteSelection, setShowRouteSelection] = useState(false)
  
  // かんたん検索用の状態
  const [simpleSearchArea, setSimpleSearchArea] = useState<string>('')
  const [simpleSearchType, setSimpleSearchType] = useState<string>('')
  const [simpleSearchKeyword, setSimpleSearchKeyword] = useState<string>('')
  const [simpleSearchRoute, setSimpleSearchRoute] = useState<string>('')
  const [simpleSearchStation, setSimpleSearchStation] = useState<string>('')
  const [simpleSearchAvailableStations, setSimpleSearchAvailableStations] = useState<string[]>([])

  // エリアデータの定義（物件数は動的に更新される）
  const areaData: {
    nara: Array<{ name: string; prefecture: string }>;
    osaka: Array<{ name: string; prefecture: string }>;
  } = {
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

  // かんたん検索用のエリアデータ（カテゴリー付き）
  const simpleSearchAreaData: Array<{ name: string; prefecture: string; disabled?: boolean; isCategory?: boolean }> = [
    // 奈良県カテゴリー
    { name: '奈良県', prefecture: '奈良県', disabled: true, isCategory: true },
    ...areaData.nara,
    // 大阪府カテゴリー
    { name: '大阪府', prefecture: '大阪府', disabled: true, isCategory: true },
    ...areaData.osaka
  ]

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

  // 路線が変更されたときに駅リストを更新
  useEffect(() => {
    if (selectedRoute && routeStations[selectedRoute]) {
      setAvailableStations(routeStations[selectedRoute])
    } else {
      setAvailableStations([])
    }
    setSelectedStation('')
  }, [selectedRoute])

  // かんたん検索用の路線変更時の駅リスト更新
  useEffect(() => {
    if (simpleSearchRoute && routeStations[simpleSearchRoute]) {
      setSimpleSearchAvailableStations(routeStations[simpleSearchRoute])
    } else {
      setSimpleSearchAvailableStations([])
    }
    setSimpleSearchStation('')
  }, [simpleSearchRoute])

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
    // エリア選択後、路線選択画面を表示
    setSelectedArea(area.name)
    setShowRouteSelection(true)
  }

  // 検索画面を閉じる関数
  const handleCloseSearch = () => {
    setSelectedArea(null)
    setShowRouteSelection(false)
    setSelectedRoute('')
    setSelectedStation('')
  }

  // 路線選択をスキップして検索に進む
  const handleSkipRouteSelection = () => {
    setShowRouteSelection(false)
  }

  // 路線と駅の選択を完了して検索に進む
  const handleCompleteRouteSelection = () => {
    setShowRouteSelection(false)
  }

  // かんたん検索の実行
  const handleSimpleSearch = () => {
    console.log('かんたん検索:', {
      area: simpleSearchArea,
      type: simpleSearchType,
      keyword: simpleSearchKeyword,
      route: simpleSearchRoute,
      station: simpleSearchStation
    })
    // ここで検索処理を実行
  }

  // かんたん検索のクリア
  const handleSimpleSearchClear = () => {
    setSimpleSearchArea('')
    setSimpleSearchType('')
    setSimpleSearchKeyword('')
    setSimpleSearchRoute('')
    setSimpleSearchStation('')
  }

  return (
    <>
      {/* かんたん検索セクション */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">かんたん検索</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">エリア</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
              value={simpleSearchArea}
              onChange={(e) => setSimpleSearchArea(e.target.value)}
            >
              <option value="">エリアを選択</option>
              {simpleSearchAreaData.map((area) => (
                <option 
                  key={area.name} 
                  value={area.name}
                  disabled={area.disabled}
                  className="text-base"
                >
                  {area.isCategory ? `【${area.name}】` : area.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">種別</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
              value={simpleSearchType}
              onChange={(e) => setSimpleSearchType(e.target.value)}
            >
              <option value="" className="text-base">すべて</option>
              <option value="新築戸建" className="text-base">新築戸建</option>
              <option value="中古戸建" className="text-base">中古戸建</option>
              <option value="中古マンション" className="text-base">中古マンション</option>
              <option value="土地" className="text-base">土地</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">キーワード</label>
            <input 
              placeholder="駅名・エリア名・条件など" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
              type="text" 
              value={simpleSearchKeyword}
              onChange={(e) => setSimpleSearchKeyword(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-bold transition-colors"
              onClick={handleSimpleSearch}
            >
              検索
            </button>
            <button 
              className="px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-bold transition-colors"
              onClick={handleSimpleSearchClear}
            >
              クリア
            </button>
          </div>
        </div>

        {/* 路線・駅選択（かんたん検索用） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">路線</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
              value={simpleSearchRoute}
              onChange={(e) => setSimpleSearchRoute(e.target.value)}
            >
              <option value="">路線を選択</option>
              {Object.keys(routeStations).map(route => (
                <option key={route} value={route} className="text-base">{route}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">最寄り駅</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
              value={simpleSearchStation}
              onChange={(e) => setSimpleSearchStation(e.target.value)}
              disabled={!simpleSearchRoute}
            >
              <option value="">
                {simpleSearchRoute ? '駅を選択してください' : '先に路線を選択してください'}
              </option>
              {simpleSearchAvailableStations.map(station => (
                <option key={station} value={station} className="text-base">{station}駅</option>
              ))}
            </select>
          </div>
        </div>
      </div>

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
          {areaData[selectedPrefecture].map((area) => {
            const count = getAreaCount(area.prefecture, area.name)
            return (
              <button
                key={area.name}
                onClick={() => handleAreaClick(area)}
                disabled={count === 0}
                className={`p-3 rounded-lg border-2 transition-all ${
                  count > 0
                    ? 'border-gray-200 hover:border-orange-500 hover:bg-orange-500 hover:shadow-md cursor-pointer'
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

        {/* 路線・駅選択セクション（エリア選択の下に追加） */}
        <div className="border-t pt-6">
          <h3 className="font-bold mb-3">路線・駅で絞り込み</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">路線</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
              >
                <option value="">路線を選択</option>
                {Object.keys(routeStations).map(route => (
                  <option key={route} value={route} className="text-base">{route}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最寄り駅</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                disabled={!selectedRoute}
              >
                <option value="">
                  {selectedRoute ? '駅を選択してください' : '先に路線を選択してください'}
                </option>
                {availableStations.map(station => (
                  <option key={station} value={station} className="text-base">{station}駅</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* 路線・駅選択後のアクションボタン */}
          {(selectedRoute || selectedStation) && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  // 選択された条件で検索を実行
                  console.log('路線・駅検索:', { route: selectedRoute, station: selectedStation })
                  // ここで検索処理を実行
                }}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                この条件で検索
              </button>
              <button
                onClick={() => {
                  setSelectedRoute('')
                  setSelectedStation('')
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                クリア
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 路線・駅選択画面 */}
      {showRouteSelection && selectedArea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">路線・駅を選択</h3>
              <button
                onClick={handleCloseSearch}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                選択したエリア: <span className="font-medium">{selectedArea}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">路線</label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                >
                  <option value="">選択してください</option>
                  {Object.keys(routeStations).map(route => (
                    <option key={route} value={route} className="text-base">{route}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">最寄り駅</label>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                  disabled={!selectedRoute}
                >
                  <option value="">
                    {selectedRoute ? '駅を選択してください' : '先に路線を選択してください'}
                  </option>
                  {availableStations.map(station => (
                    <option key={station} value={station} className="text-base">{station}駅</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSkipRouteSelection}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                スキップ
              </button>
              <button
                onClick={handleCompleteRouteSelection}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                検索に進む
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 既存の検索画面モーダルを使用 */}
      {selectedArea && !showRouteSelection && (
        <PropertySearch 
          selectedArea={selectedArea} 
          selectedRoute={selectedRoute}
          selectedStation={selectedStation}
          onClose={handleCloseSearch}
          areaOptions={[
            // 奈良県
            '奈良市', '天理市', '香芝市', '大和高田市', '橿原市', '葛城市', '大和郡山市', '桜井市', '生駒市',
            '生駒郡三郷町', '生駒郡安堵町', '生駒郡平群町', '生駒郡斑鳩町', '磯城郡田原本町', '磯城郡三宅町', '磯城郡川西町',
            '北葛城郡広陵町', '北葛城郡王寺町', '北葛城郡河合町', '北葛城郡上牧町',
            // 大阪府
            '堺市堺区', '堺市中区', '堺市東区', '堺市西区', '堺市南区', '堺市北区', '堺市美原区',
            '岸和田市', '吹田市', '貝塚市', '茨木市', '富田林市', '松原市', '箕面市', '門真市',
            '藤井寺市', '四條畷市', '泉大津市', '守口市', '八尾市', '寝屋川市', '大東市', '柏原市',
            '摂津市', '交野市', '池田市', '高槻市', '枚方市', '泉佐野市', '河内長野市', '和泉市',
            '羽曳野市', '高石市', '泉南市', '大阪狭山市'
          ]}
          onReturnToSearch={() => {
            // エリア選択画面に戻る
            setSelectedArea(null)
            setSelectedRoute('')
            setSelectedStation('')
          }}
        />
      )}
    </>
  )
}
