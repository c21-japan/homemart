'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ========== 定数定義 ==========
const AREA_DATA = {
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
} as const

// 路線と駅のデータ
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
  '近鉄田原本線': ['西田原本', '黒田', '但馬', '箸尾', '池部', '佐味田川', '大輪田', '新王寺'],
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

const LAYOUT_TYPES = ['K', 'DK', 'LDK'] as const

// ========== ユーティリティ関数 ==========
function calculateBuildingAge(buildYear: string, buildMonth: string): number | null {
  if (!buildYear) return null
  
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  
  const year = parseInt(buildYear)
  const month = parseInt(buildMonth) || 1
  
  if (isNaN(year)) return null
  
  let age = currentYear - year
  
  if (currentMonth < month) {
    age -= 1
  }
  
  return age < 0 ? 0 : age
}

// 5日ごとに更新される登録日を計算
function getUpdatedRegistrationDate(originalDate: Date): string {
  const now = new Date()
  const diff = Math.floor((now.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysToAdd = Math.floor(diff / 5) * 5
  
  const updatedDate = new Date(originalDate)
  updatedDate.setDate(updatedDate.getDate() + daysToAdd)
  
  return updatedDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// ========== 間取り入力コンポーネント ==========
function LayoutInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [rooms, setRooms] = useState('')
  const [hasS, setHasS] = useState(false)
  const [layoutType, setLayoutType] = useState<typeof LAYOUT_TYPES[number]>('LDK')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (value && !initialized) {
      const match = value.match(/^(\d+)(S?)(.*)$/)
      if (match) {
        setRooms(match[1])
        setHasS(match[2] === 'S')
        if (LAYOUT_TYPES.includes(match[3] as typeof LAYOUT_TYPES[number])) {
          setLayoutType(match[3] as typeof LAYOUT_TYPES[number])
        }
      }
      setInitialized(true)
    }
  }, [value, initialized])

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={rooms}
        onChange={(e) => {
          setRooms(e.target.value)
          if (e.target.value) {
            const layout = `${e.target.value}${hasS ? 'S' : ''}${layoutType}`
            onChange(layout)
          }
        }}
        className="w-20 p-2 border rounded focus:ring-2 focus:ring-blue-500"
        placeholder="3"
        min="1"
        max="10"
      />
      
      <button
        type="button"
        onClick={() => {
          const newHasS = !hasS
          setHasS(newHasS)
          if (rooms) {
            const layout = `${rooms}${newHasS ? 'S' : ''}${layoutType}`
            onChange(layout)
          }
        }}
        className={`px-3 py-2 rounded transition-colors ${
          hasS 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        S
      </button>
      
      <select
        value={layoutType}
        onChange={(e) => {
          const newType = e.target.value as typeof LAYOUT_TYPES[number]
          setLayoutType(newType)
          if (rooms) {
            const layout = `${rooms}${hasS ? 'S' : ''}${newType}`
            onChange(layout)
          }
        }}
        className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
      >
        {LAYOUT_TYPES.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>
  )
}

// ========== メインコンポーネント ==========
export default function NewProperty() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [selectedPrefecture, setSelectedPrefecture] = useState('奈良県')
  const [selectedRoute, setSelectedRoute] = useState('')
  const [availableStations, setAvailableStations] = useState<string[]>([])
  const [showMoreImages, setShowMoreImages] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [registrationDate] = useState(new Date())
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  
  const [formData, setFormData] = useState({
    // 基本情報
    name: '',
    price: '',
    price_per_tsubo: '',
    prefecture: '奈良県',
    city: '',
    town: '',
    station: '',
    route: '',
    walking_time: '',
    land_area: '',
    land_area_tsubo: '',
    building_area: '',
    layout: '',
    building_age: '',
    build_year: '',
    build_month: '',
    structure: '木造',
    floors: '',
    direction: '南向き',
    
    // 詳細情報
    parking: '',
    building_coverage: '',
    floor_area_ratio: '',
    land_rights: '所有権',
    use_district: '',
    road_situation: '',
    road_type: '公道',
    road_width: '',
    current_status: '空家',
    delivery_time: '',
    
    // マンション専用
    mansion_name: '',
    floor_number: '',
    total_floors: '',
    total_units: '',
    management_fee: '',
    repair_fund: '',
    management_company: '',
    management_type: '全部委託',
    balcony_area: '',
    private_garden_area: '',
    parking_fee: '',
    parking_status: '',
    elevator: false,
    auto_lock: false,
    delivery_box: false,
    bicycle_parking: false,
    common_facilities: '',
    long_term_repair_plan: '',
    repair_history: '',
    
    // 土地専用
    land_shape: '整形',
    building_conditions: '無',
    terrain: '平坦',
    water_supply: '公営',
    sewage: '公共下水',
    gas: '都市ガス',
    electricity: '引込済',
    height_limit: '',
    fire_zone: '',
    other_restrictions: '',
    
    // 法的事項
    building_confirmation: '',
    inspection_certificate: false,
    insurance: false,
    performance_evaluation: false,
    long_term_excellent: false,
    flat35s: false,
    energy_standard: false,
    earthquake_resistance: '',
    insulation_grade: '',
    
    // リフォーム・設備
    reform_history: '',
    equipment_status: '',
    
    // 周辺環境
    school_district: '',
    shopping_facilities: '',
    public_facilities: '',
    transportation: '',
    
    // 営業情報
    staff_comment: '',
    sales_point: '',
    
    // 共通特徴（チェックボックス）
    features: {
      // 住宅性能・品質
      long_term_excellent: false,
      performance_evaluation: false,
      flat35s: false,
      energy_standard: false,
      earthquake_grade3: false,
      insulation_grade4: false,
      
      // 設備・仕様
      system_kitchen: false,
      dishwasher: false,
      ih_cooktop: false,
      bathroom_dryer: false,
      washlet: false,
      floor_heating: false,
      air_conditioner: false,
      tv_intercom: false,
      
      // 立地・環境
      sunny: false,
      well_ventilated: false,
      corner_lot: false,
      quiet_area: false,
      station_10min: false,
      shopping_nearby: false,
      school_nearby: false,
      park_nearby: false,
      
      // その他
      parking_2cars: false,
      all_room_storage: false,
      walk_in_closet: false,
      under_floor_storage: false,
      attic_storage: false,
      south_balcony: false,
      private_garden: false,
      pet_allowed: false
    },
    
    // システム情報
    status: 'published',
    is_new: true,
    property_type: '新築戸建'
  })

  // 路線が変更されたときに駅リストを更新
  useEffect(() => {
    if (selectedRoute && routeStations[selectedRoute]) {
      setAvailableStations(routeStations[selectedRoute])
    } else {
      setAvailableStations([])
    }
    setFormData(prev => ({ ...prev, station: '' }))
  }, [selectedRoute])

  // 土地面積から坪数を自動計算
  useEffect(() => {
    if (formData.land_area) {
      const tsubo = (parseFloat(formData.land_area) / 3.305785).toFixed(2)
      setFormData(prev => ({ ...prev, land_area_tsubo: tsubo }))
    }
  }, [formData.land_area])

  // 坪単価を自動計算（土地の場合のみ）
  useEffect(() => {
    if (formData.property_type === '土地' && formData.price && formData.land_area_tsubo) {
      const pricePerTsubo = (parseFloat(formData.price) / parseFloat(formData.land_area_tsubo)).toFixed(2)
      setFormData(prev => ({ ...prev, price_per_tsubo: pricePerTsubo }))
    }
  }, [formData.price, formData.land_area_tsubo, formData.property_type])

  // 築年月が変更されたら築年数を自動計算
  useEffect(() => {
    const age = calculateBuildingAge(formData.build_year, formData.build_month)
    if (age !== null) {
      setFormData(prev => ({
        ...prev,
        building_age: age.toString()
      }))
    }
  }, [formData.build_year, formData.build_month])

  // 画像アップロード処理
  const handleImageUpload = async (files: FileList) => {
    const uploadedImages: string[] = []
    
    for (let i = 0; i < files.length && images.length + uploadedImages.length < 20; i++) {
      const file = files[i]
      const reader = new FileReader()
      
      await new Promise((resolve) => {
        reader.onloadend = () => {
          uploadedImages.push(reader.result as string)
          resolve(null)
        }
        reader.readAsDataURL(file)
      })
    }
    
    setImages(prev => [...prev, ...uploadedImages].slice(0, 20))
  }

  // ドラッグ&ドロップ処理
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageUpload(files)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleImageUpload(files)
    }
  }

  // 個別画像アップロード
  const handleSingleImageUpload = async (index: number, file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const newImages = [...images]
      if (images.length <= index) {
        while (newImages.length < index) {
          newImages.push('')
        }
        newImages.push(reader.result as string)
      } else {
        newImages[index] = reader.result as string
      }
      setImages(newImages.filter(img => img !== ''))
    }
    reader.readAsDataURL(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      if (name.startsWith('features.')) {
        const featureName = name.split('.')[1]
        setFormData(prev => ({
          ...prev,
          features: {
            ...prev.features,
            [featureName]: checkbox.checked
          }
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checkbox.checked
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    // 都道府県が変更されたら市区町村と路線をリセット
    if (name === 'prefecture') {
      setSelectedPrefecture(value)
      setFormData(prev => ({ ...prev, city: '', route: '' }))
      setSelectedRoute('')
    }
    
    // 路線が変更されたら
    if (name === 'route') {
      setSelectedRoute(value)
    }
  }

  const handleLayoutChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      layout: value
    }))
  }, [])

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  // 画像のドラッグ&ドロップ並び替え
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const draggedImage = images[draggedIndex]
    const newImages = [...images]
    
    newImages.splice(draggedIndex, 1)
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newImages.splice(adjustedDropIndex, 0, draggedImage)
    
    setImages(newImages)
    setDraggedIndex(null)
  }

  // バリデーション
  const validateForm = () => {
    const newErrors: Record<string, boolean> = {}
    
    // 必須項目のチェック
    if (!formData.name) newErrors.name = true
    if (!formData.price) newErrors.price = true
    if (!formData.city) newErrors.city = true
    
    setErrors(newErrors)
    
    // エラーがある場合、最初のエラー箇所までスクロール
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = document.querySelector(`[name="${Object.keys(newErrors)[0]}"]`)
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // バリデーション
    if (!validateForm()) {
      alert('必須項目を入力してください')
      return
    }
    
    setIsSubmitting(true)
  
    try {
      // Supabaseのテーブルに存在するカラムのみを送信
      const submitData: Record<string, unknown> = {
        // 基本情報
        name: formData.name,
        price: parseInt(formData.price) || 0,
        prefecture: formData.prefecture,
        city: formData.city,
        town: formData.town || null,
        station: formData.station || null,
        route: selectedRoute || null,
        walking_time: formData.walking_time ? parseInt(formData.walking_time) : null,
        
        // 土地・建物情報
        land_area: formData.land_area ? parseFloat(formData.land_area) : null,
        land_area_tsubo: formData.land_area_tsubo ? parseFloat(formData.land_area_tsubo) : null,
        building_area: formData.building_area ? parseFloat(formData.building_area) : null,
        layout: formData.layout || null,
        building_age: formData.building_age ? parseInt(formData.building_age) : null,
        build_year: formData.build_year || null,
        build_month: formData.build_month || null,
        structure: formData.structure || null,
        floors: formData.floors ? parseInt(formData.floors) : null,
        direction: formData.direction || null,
        
        // 詳細情報
        parking: formData.parking ? parseInt(formData.parking) : null,
        building_coverage: formData.building_coverage ? parseFloat(formData.building_coverage) : null,
        floor_area_ratio: formData.floor_area_ratio ? parseFloat(formData.floor_area_ratio) : null,
        land_rights: formData.land_rights || null,
        use_district: formData.use_district || null,
        road_situation: formData.road_situation || null,
        current_status: formData.current_status || null,
        delivery_time: formData.delivery_time || null,
        
        // マンション情報
        total_units: formData.total_units ? parseInt(formData.total_units) : null,
        management_fee: formData.management_fee ? parseInt(formData.management_fee) : null,
        repair_fund: formData.repair_fund ? parseInt(formData.repair_fund) : null,
        balcony_area: formData.balcony_area ? parseFloat(formData.balcony_area) : null,
        
        // 価格関連
        price_per_tsubo: formData.price_per_tsubo ? parseFloat(formData.price_per_tsubo) : null,
        
        // 画像
        image_url: images[0] || null,
        images: images.length > 0 ? images : null,
        
        // その他
        address: `${formData.prefecture}${formData.city}${formData.town || ''}`,
        property_type: formData.property_type,
        status: formData.status || 'published',
        is_new: formData.is_new,
        staff_comment: formData.staff_comment || null,
        sales_point: formData.sales_point || null,
        reform_history: formData.reform_history || null,
        elevator: formData.elevator || false,
        auto_lock: formData.auto_lock || false,
        delivery_box: formData.delivery_box || false,
        bicycle_parking: formData.bicycle_parking || false,
        features: formData.features || {}
      }

      console.log('送信データ:', submitData)

      const { error } = await supabase
        .from('properties')
        .insert(submitData)
        .select()

      if (error) {
        console.error('Supabaseエラー詳細:', {
          message: error.message,
          code: error.code,
          details: error.details
        })
        alert(`登録に失敗しました。\nエラー: ${error.message}`)
        throw error
      }

      alert('物件を登録しました')
      router.push('/admin')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 5日ごとに更新される登録日
  const displayDate = getUpdatedRegistrationDate(registrationDate)

  // 表示する画像スロット数
  const displaySlots = showMoreImages ? 20 : 12

  // エラーがある場合の入力フィールドのクラス
  const getInputClassName = (fieldName: string, baseClass: string = "w-full p-2 border rounded") => {
    return errors[fieldName] 
      ? `${baseClass} bg-red-50 border-red-500` 
      : baseClass
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ paddingTop: 'var(--header-height, 0px)' }}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">新規物件登録</h1>
            <div className="text-sm text-gray-600">
              登録日：{displayDate}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 物件種別 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  物件種別 <span className="text-red-500">*</span>
                </label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="新築戸建">新築戸建</option>
                  <option value="中古戸建">中古戸建</option>
                  <option value="中古マンション">中古マンション</option>
                  <option value="土地">土地</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  新着物件（30日間表示）
                </label>
                <select
                  name="is_new"
                  value={formData.is_new.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_new: e.target.value === 'true' }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="true">新着として表示</option>
                  <option value="false">通常表示</option>
                </select>
              </div>
            </div>

            {/* 基本情報 */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold mb-4">基本情報</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    物件名 <span className="text-red-500">*</span>
                    {errors.name && <span className="text-red-500 text-xs ml-2">必須項目です</span>}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={getInputClassName('name')}
                    required
                  />
                </div>

                {formData.property_type === '中古マンション' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      マンション名
                    </label>
                    <input
                      type="text"
                      name="mansion_name"
                      value={formData.mansion_name}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="例：ライオンズマンション大和高田"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    価格（万円） <span className="text-red-500">*</span>
                    {errors.price && <span className="text-red-500 text-xs ml-2">必須項目です</span>}
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={getInputClassName('price')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    都道府県 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="prefecture"
                    value={formData.prefecture}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="奈良県">奈良県</option>
                    <option value="大阪府">大阪府</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    市区町村 <span className="text-red-500">*</span>
                    {errors.city && <span className="text-red-500 text-xs ml-2">必須項目です</span>}
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={getInputClassName('city')}
                    required
                  >
                    <option value="">選択してください</option>
                    {AREA_DATA[selectedPrefecture as keyof typeof AREA_DATA]?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    町名・番地
                  </label>
                  <input
                    type="text"
                    name="town"
                    value={formData.town}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="例：笠287-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">路線</label>
                  <select
                    name="route"
                    value={selectedRoute}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">選択してください</option>
                    {Object.keys(routeStations).map(route => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">最寄り駅</label>
                  <select
                    name="station"
                    value={formData.station}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    disabled={!selectedRoute}
                  >
                    <option value="">
                      {selectedRoute ? '駅を選択' : '先に路線を選択してください'}
                    </option>
                    {availableStations.map(station => (
                      <option key={station} value={`${station}駅`}>{station}駅</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    駅徒歩（分）
                  </label>
                  <input
                    type="number"
                    name="walking_time"
                    value={formData.walking_time}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>

            {/* 土地・建物情報 */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold mb-4">土地・建物情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">土地面積（㎡）</label>
                  <input
                    type="number"
                    step="0.01"
                    name="land_area"
                    value={formData.land_area}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">土地面積（坪）</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.land_area_tsubo}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                    placeholder="自動計算"
                  />
                </div>

                {formData.property_type === '土地' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">坪単価（万円/坪）</label>
                    <input
                      type="number"
                      value={formData.price_per_tsubo}
                      readOnly
                      className="w-full p-2 border rounded bg-gray-100"
                      placeholder="自動計算"
                    />
                  </div>
                )}

                {formData.property_type !== '土地' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">建物面積（㎡）</label>
                      <input
                        type="number"
                        name="building_area"
                        value={formData.building_area}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">間取り</label>
                      <LayoutInput
                        value={formData.layout}
                        onChange={handleLayoutChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">築年月</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          name="build_year"
                          value={formData.build_year}
                          onChange={handleChange}
                          className="flex-1 p-2 border rounded"
                          placeholder="2024"
                        />
                        <span className="self-center">年</span>
                        <input
                          type="number"
                          name="build_month"
                          value={formData.build_month}
                          onChange={handleChange}
                          className="w-20 p-2 border rounded"
                          placeholder="3"
                          min="1"
                          max="12"
                        />
                        <span className="self-center">月</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">築年数（自動計算）</label>
                      <div className="p-2 bg-gray-100 border rounded">
                        {formData.building_age ? `${formData.building_age}年` : '築年月を入力すると自動計算されます'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">構造</label>
                      <select
                        name="structure"
                        value={formData.structure}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="木造">木造</option>
                        <option value="鉄骨造">鉄骨造</option>
                        <option value="RC造">RC造</option>
                        <option value="SRC造">SRC造</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">建物階数</label>
                      <input
                        type="number"
                        name="floors"
                        value={formData.floors}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="2"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 画像アップロード（統合版） */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold mb-4">
                物件画像（最大20枚）
              </h2>
              
              {/* ドラッグ&ドロップエリア */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 bg-gray-50'
                }`}
              >
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg mb-2">画像をドラッグ&ドロップ</p>
                <p className="text-sm text-gray-500">または</p>
                <button type="button" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  ファイルを選択
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">
                  現在 {images.length} / 20 枚
                </p>
              </div>
              
              {/* 画像スロット */}
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: displaySlots }, (_, index) => {
                  const imageUrl = images[index]
                  const label = index === 0 ? '外観（メイン）' : index === 1 ? '間取り図/区画図' : `その他${index - 1}`
                  
                  return (
                    <div 
                      key={index} 
                      className="border rounded-lg p-3 bg-gray-50"
                      draggable={!!imageUrl}
                      onDragStart={(e) => imageUrl && handleImageDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleImageDrop(e, index)}
                    >
                      {/* ラベル */}
                      <div className="text-sm font-medium mb-2">
                        {index + 1}. {label}
                      </div>
                      
                      {/* プレビューエリア */}
                      <div className="relative w-full h-32 bg-white border-2 border-dashed border-gray-300 rounded mb-2 overflow-hidden">
                        {imageUrl ? (
                          <>
                            <img 
                              src={imageUrl} 
                              alt={label}
                              className="w-full h-full object-cover cursor-move"
                            />
                            {/* 削除ボタン */}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                            {/* ドラッグ表示 */}
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                              ドラッグで移動
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs">画像未選択</span>
                          </div>
                        )}
                      </div>
                      
                      {/* ファイル選択ボタン */}
                      <div className="space-y-2">
                        <input
                          type="file"
                          id={`file-${index}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleSingleImageUpload(index, file)
                            }
                          }}
                        />
                        <label
                          htmlFor={`file-${index}`}
                          className="block w-full bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 text-xs text-center"
                        >
                          画像を選択
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* もっと画像を追加ボタン */}
              {!showMoreImages && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setShowMoreImages(true)}
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                  >
                    もっと画像登録を増やす（13〜20枚目）
                  </button>
                </div>
              )}
            </div>

            {/* 共通特徴（チェックボックス） */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold mb-4">物件の特徴</h2>
              
              {/* 住宅性能・品質 */}
              <div className="mb-4">
                <h3 className="font-medium mb-2">住宅性能・品質</h3>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.long_term_excellent"
                      checked={formData.features.long_term_excellent}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    長期優良住宅
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.performance_evaluation"
                      checked={formData.features.performance_evaluation}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    住宅性能評価書取得
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.flat35s"
                      checked={formData.features.flat35s}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    フラット35S対応
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.energy_standard"
                      checked={formData.features.energy_standard}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    省エネ基準適合
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.earthquake_grade3"
                      checked={formData.features.earthquake_grade3}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    耐震等級3
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.insulation_grade4"
                      checked={formData.features.insulation_grade4}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    断熱等性能等級4
                  </label>
                </div>
              </div>

              {/* 設備・仕様 */}
              <div className="mb-4">
                <h3 className="font-medium mb-2">設備・仕様</h3>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.system_kitchen"
                      checked={formData.features.system_kitchen}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    システムキッチン
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.dishwasher"
                      checked={formData.features.dishwasher}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    食器洗い乾燥機
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.ih_cooktop"
                      checked={formData.features.ih_cooktop}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    IHクッキングヒーター
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.bathroom_dryer"
                      checked={formData.features.bathroom_dryer}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    浴室乾燥機
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.washlet"
                      checked={formData.features.washlet}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    温水洗浄便座
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.floor_heating"
                      checked={formData.features.floor_heating}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    床暖房
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.air_conditioner"
                      checked={formData.features.air_conditioner}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    エアコン
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.tv_intercom"
                      checked={formData.features.tv_intercom}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    TVモニタ付インターホン
                  </label>
                </div>
              </div>

              {/* 立地・環境 */}
              <div className="mb-4">
                <h3 className="font-medium mb-2">立地・環境</h3>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.sunny"
                      checked={formData.features.sunny}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    陽当り良好
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.well_ventilated"
                      checked={formData.features.well_ventilated}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    通風良好
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.corner_lot"
                      checked={formData.features.corner_lot}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    角地
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.quiet_area"
                      checked={formData.features.quiet_area}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    閑静な住宅地
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.station_10min"
                      checked={formData.features.station_10min}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    駅徒歩10分以内
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.shopping_nearby"
                      checked={formData.features.shopping_nearby}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    商業施設近い
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.school_nearby"
                      checked={formData.features.school_nearby}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    学校近い
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.park_nearby"
                      checked={formData.features.park_nearby}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    公園近い
                  </label>
                </div>
              </div>

              {/* その他 */}
              <div className="mb-4">
                <h3 className="font-medium mb-2">その他</h3>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.parking_2cars"
                      checked={formData.features.parking_2cars}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    駐車2台可
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.all_room_storage"
                      checked={formData.features.all_room_storage}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    全居室収納
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.walk_in_closet"
                      checked={formData.features.walk_in_closet}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    ウォークインクローゼット
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.under_floor_storage"
                      checked={formData.features.under_floor_storage}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    床下収納
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.attic_storage"
                      checked={formData.features.attic_storage}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    小屋裏収納
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.south_balcony"
                      checked={formData.features.south_balcony}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    南面バルコニー
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.private_garden"
                      checked={formData.features.private_garden}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    専用庭
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="features.pet_allowed"
                      checked={formData.features.pet_allowed}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    ペット可
                  </label>
                </div>
              </div>
            </div>

            {/* スタッフコメント */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold mb-4">営業情報</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">セールスポイント</label>
                <textarea
                  name="sales_point"
                  value={formData.sales_point}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border rounded"
                  placeholder="物件の魅力を箇条書きで記入&#10;例：・駅徒歩5分の好立地&#10;・南向きで陽当り良好&#10;・スーパー、コンビニ徒歩圏内"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">スタッフからのコメント</label>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    💡 スタッフコメントを入力すると：
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc">
                    <li>物件一覧で「スタッフおすすめ！」バッジが表示されます</li>
                    <li>物件詳細ページで目立つように表示されます</li>
                  </ul>
                </div>
                
                <textarea
                  name="staff_comment"
                  value={formData.staff_comment}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="お客様へのメッセージを記入してください。&#10;例：駅近で買い物便利！リフォーム済みですぐに住めます。人気エリアのため、お早めにご検討ください。"
                />
                
                {formData.staff_comment && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">プレビュー（物件詳細での表示）：</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">スタッフより</span>
                        <p className="text-gray-800 flex-1">{formData.staff_comment}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? '登録中...' : '物件を登録'}
              </button>
              <Link
                href="/admin"
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded font-bold text-center hover:bg-gray-400"
              >
                キャンセル
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
