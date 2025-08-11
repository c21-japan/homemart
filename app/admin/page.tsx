// app/admin/properties/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ========== 定数定義 ==========
const PROPERTY_TYPES = {
  NEW_HOUSE: '新築戸建',
  USED_HOUSE: '中古戸建',
  USED_MANSION: '中古マンション',
  LAND: '土地'
} as const

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

const RAILWAY_LINES = {
  '奈良県': [
    'JR大和路線', 'JR桜井線', 'JR和歌山線',
    '近鉄奈良線', '近鉄大阪線', '近鉄京都線', '近鉄橿原線',
    '近鉄南大阪線', '近鉄吉野線', '近鉄生駒線', '近鉄田原本線',
    '近鉄御所線', '近鉄天理線', '近鉄けいはんな線', '近鉄生駒鋼索線'
  ],
  '大阪府': [
    'JR大阪環状線', 'JR東海道本線', 'JR大阪東線', 'JR学研都市線',
    'JR大和路線', 'JR阪和線', 'JR関西空港線',
    '大阪メトロ御堂筋線', '大阪メトロ谷町線', '大阪メトロ四つ橋線',
    '大阪メトロ中央線', '大阪メトロ千日前線', '大阪メトロ堺筋線',
    '大阪メトロ長堀鶴見緑地線', '大阪メトロ今里筋線', '大阪メトロニュートラム',
    '近鉄大阪線', '近鉄奈良線', '近鉄南大阪線',
    '南海本線', '南海高野線', '京阪本線', '京阪中之島線',
    '阪急京都線', '阪急宝塚線', '阪急神戸線',
    '阪神本線', '阪神なんば線', '泉北高速鉄道線'
  ]
} as const

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

  useEffect(() => {
    if (value) {
      const match = value.match(/^(\d+)(S?)(.*)$/)
      if (match) {
        setRooms(match[1])
        setHasS(match[2] === 'S')
        if (LAYOUT_TYPES.includes(match[3] as any)) {
          setLayoutType(match[3] as typeof LAYOUT_TYPES[number])
        }
      }
    }
  }, [value])

  useEffect(() => {
    if (rooms) {
      const layout = `${rooms}${hasS ? 'S' : ''}${layoutType}`
      onChange(layout)
    }
  }, [rooms, hasS, layoutType, onChange])

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={rooms}
        onChange={(e) => setRooms(e.target.value)}
        className="w-20 p-2 border rounded focus:ring-2 focus:ring-blue-500"
        placeholder="3"
        min="1"
        max="10"
      />
      
      <button
        type="button"
        onClick={() => setHasS(!hasS)}
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
        onChange={(e) => setLayoutType(e.target.value as typeof LAYOUT_TYPES[number])}
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [selectedPrefecture, setSelectedPrefecture] = useState('奈良県')
  const [showMoreImages, setShowMoreImages] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [registrationDate] = useState(new Date())
  const [errors, setErrors] = useState<Record<string, boolean>>({}) // エラー管理
  
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
    }
  }

  const handleLayoutChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      layout: value
    }))
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  // ドラッグ開始
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  // ドラッグオーバー
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  // ドロップ
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
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
      const submitData: any = {
        name: formData.name,
        price: parseInt(formData.price) || 0,
        prefecture: formData.prefecture,
        city: formData.city,
        town: formData.town,
        station: formData.station,
        route: formData.route,
        walking_time: parseInt(formData.walking_time) || null,
        land_area: parseFloat(formData.land_area) || null,
        building_area: parseFloat(formData.building_area) || null,
        layout: formData.layout,
        building_age: parseInt(formData.building_age) || null,
        structure: formData.structure,
        floors: parseInt(formData.floors) || null,
        direction: formData.direction,
        parking: parseInt(formData.parking) || null,
        building_coverage: parseFloat(formData.building_coverage) || null,
        floor_area_ratio: parseFloat(formData.floor_area_ratio) || null,
        land_rights: formData.land_rights,
        use_district: formData.use_district,
        road_situation: formData.road_situation,
        current_status: formData.current_status,
        delivery_time: formData.delivery_time,
        total_units: parseInt(formData.total_units) || null,
        management_fee: parseInt(formData.management_fee) || null,
        repair_fund: parseInt(formData.repair_fund) || null,
        balcony_area: parseFloat(formData.balcony_area) || null,
        price_per_tsubo: parseFloat(formData.price_per_tsubo) || null,
        image_url: images[0] || '',
        images: images,
        address: `${formData.prefecture}${formData.city}${formData.town}`,
        property_type: formData.property_type,
        status: formData.status,
        is_new: formData.is_new,
        staff_comment: formData.staff_comment,
        sales_point: formData.sales_point,
        reform_history: formData.reform_history,
        elevator: formData.elevator,
        auto_lock: formData.auto_lock,
        delivery_box: formData.delivery_box,
        bicycle_parking: formData.bicycle_parking,
        features: formData.features,
        // 新着物件の期限（30日後）を設定
        new_property_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      // 築年月を文字列として保存（例：2024年3月）
      if (formData.build_year) {
        submitData.build_year = formData.build_year
        submitData.build_month = formData.build_month
      }
  
      console.log('送信データ:', submitData)
  
      const { data, error } = await supabase
        .from('properties')
        .insert(submitData)
        .select()
  
      if (error) {
        console.error('Supabaseエラー詳細:', error)
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
    <div className="min-h-screen bg-gray-100">
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

                {formData.property_type === '土地' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      坪単価（万円/坪）
                    </label>
                    <input
                      type="number"
                      name="price_per_tsubo"
                      value={formData.price_per_tsubo}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}

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
                  <label className="block text-sm font-medium mb-2">
                    最寄り駅
                  </label>
                  <input
                    type="text"
                    name="station"
                    value={formData.station}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="例：近鉄大和高田駅"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    路線
                  </label>
                  <select
                    name="route"
                    value={formData.route}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">選択してください</option>
                    <optgroup label={selectedPrefecture}>
                      {RAILWAY_LINES[selectedPrefecture as keyof typeof RAILWAY_LINES]?.map(line => (
                        <option key={line} value={line}>{line}</option>
                      ))}
                    </optgroup>
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

                {formData.property_type !== '土地' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        間取り
                      </label>
                      <LayoutInput
                        value={formData.layout}
                        onChange={handleLayoutChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        築年月
                      </label>
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
                      <label className="block text-sm font-medium mb-2">
                        築年数（自動計算）
                      </label>
                      <div className="p-2 bg-gray-100 border rounded">
                        {formData.building_age ? `${formData.building_age}年` : '築年月を入力すると自動計算されます'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 以降、既存のコードの残り部分（詳細情報、特徴、スタッフコメント、画像アップロード等）はそのまま使用 */}
            
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
