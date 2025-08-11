// ========== constants/property.ts ==========
export const PROPERTY_TYPES = {
    NEW_HOUSE: '新築戸建',
    USED_HOUSE: '中古戸建',
    USED_MANSION: '中古マンション',
    LAND: '土地'
  } as const
  
  export const AREA_DATA = {
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
  
  // 路線データ
  export const RAILWAY_LINES = {
    '奈良県': [
      // JR
      'JR大和路線',
      'JR桜井線',
      'JR和歌山線',
      // 近鉄
      '近鉄奈良線',
      '近鉄大阪線',
      '近鉄京都線',
      '近鉄橿原線',
      '近鉄南大阪線',
      '近鉄吉野線',
      '近鉄生駒線',
      '近鉄田原本線',
      '近鉄御所線',
      '近鉄天理線',
      '近鉄けいはんな線',
      '近鉄生駒鋼索線'
    ],
    '大阪府': [
      // JR
      'JR大阪環状線',
      'JR東海道本線',
      'JR大阪東線',
      'JR学研都市線',
      'JR大和路線',
      'JR阪和線',
      'JR関西空港線',
      // 大阪メトロ
      '大阪メトロ御堂筋線',
      '大阪メトロ谷町線',
      '大阪メトロ四つ橋線',
      '大阪メトロ中央線',
      '大阪メトロ千日前線',
      '大阪メトロ堺筋線',
      '大阪メトロ長堀鶴見緑地線',
      '大阪メトロ今里筋線',
      '大阪メトロニュートラム',
      // 私鉄
      '近鉄大阪線',
      '近鉄奈良線',
      '近鉄南大阪線',
      '南海本線',
      '南海高野線',
      '京阪本線',
      '京阪中之島線',
      '阪急京都線',
      '阪急宝塚線',
      '阪急神戸線',
      '阪神本線',
      '阪神なんば線',
      '泉北高速鉄道線'
    ]
  } as const
  
  // 間取りタイプ
  export const LAYOUT_TYPES = ['K', 'DK', 'LDK'] as const
  
  // ========== utils/dateHelpers.ts ==========
  export function calculateBuildingAge(buildYear: string, buildMonth: string): number | null {
    if (!buildYear) return null
    
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    const year = parseInt(buildYear)
    const month = parseInt(buildMonth) || 1
    
    if (isNaN(year)) return null
    
    let age = currentYear - year
    
    // 月を考慮した計算
    if (currentMonth < month) {
      age -= 1
    }
    
    return age < 0 ? 0 : age
  }
  
  export function isNewProperty(createdAt: string): boolean {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays <= 30
  }
  
  // ========== components/property/LayoutInput.tsx ==========
  'use client'
  
  import { useState, useEffect } from 'react'
  import { LAYOUT_TYPES } from '@/constants/property'
  
  interface LayoutInputProps {
    value: string
    onChange: (value: string) => void
  }
  
  export function LayoutInput({ value, onChange }: LayoutInputProps) {
    const [rooms, setRooms] = useState('')
    const [hasS, setHasS] = useState(false)
    const [layoutType, setLayoutType] = useState<typeof LAYOUT_TYPES[number]>('LDK')
  
    // valueから初期値を設定
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
    }, [])
  
    // 値が変更されたら親コンポーネントに通知
    useEffect(() => {
      if (rooms) {
        const layout = `${rooms}${hasS ? 'S' : ''}${layoutType}`
        onChange(layout)
      }
    }, [rooms, hasS, layoutType])
  
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
          +S
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
  
  // ========== components/property/BasicInfoSection.tsx ==========
  'use client'
  
  import { useEffect } from 'react'
  import { FormData, Prefecture } from '@/types/property'
  import { AREA_DATA, RAILWAY_LINES } from '@/constants/property'
  import { calculateBuildingAge } from '@/utils/dateHelpers'
  import { LayoutInput } from './LayoutInput'
  
  interface BasicInfoSectionProps {
    formData: FormData
    selectedPrefecture: Prefecture
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
    onLayoutChange: (value: string) => void
    onBuildingAgeCalculate: (age: number | null) => void
  }
  
  export function BasicInfoSection({ 
    formData, 
    selectedPrefecture, 
    onChange,
    onLayoutChange,
    onBuildingAgeCalculate
  }: BasicInfoSectionProps) {
    
    // 築年月が変更されたら築年数を自動計算
    useEffect(() => {
      const age = calculateBuildingAge(formData.build_year, formData.build_month)
      onBuildingAgeCalculate(age)
    }, [formData.build_year, formData.build_month])
  
    return (
      <div className="border-t pt-6">
        <h2 className="text-lg font-bold mb-4">基本情報</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              物件名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium mb-2">
              価格（万円） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={onChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
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
                onChange={onChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
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
              onChange={onChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="奈良県">奈良県</option>
              <option value="大阪府">大阪府</option>
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium mb-2">
              市区町村 <span className="text-red-500">*</span>
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={onChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">選択してください</option>
              {AREA_DATA[selectedPrefecture]?.map(city => (
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
              onChange={onChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
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
              onChange={onChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
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
              onChange={onChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              <optgroup label={selectedPrefecture}>
                {RAILWAY_LINES[selectedPrefecture]?.map(line => (
                  <option key={line} value={line}>{line}</option>
                ))}
              </optgroup>
              <optgroup label="その他">
                {Object.entries(RAILWAY_LINES)
                  .filter(([pref]) => pref !== selectedPrefecture)
                  .flatMap(([_, lines]) => lines)
                  .filter((line, index, self) => self.indexOf(line) === index)
                  .map(line => (
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
              onChange={onChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
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
                  onChange={onLayoutChange}
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
                    onChange={onChange}
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="2024"
                  />
                  <span className="self-center">年</span>
                  <input
                    type="number"
                    name="build_month"
                    value={formData.build_month}
                    onChange={onChange}
                    className="w-20 p-2 border rounded focus:ring-2 focus:ring-blue-500"
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
                  {formData.building_age !== null && formData.building_age !== '' 
                    ? `${formData.building_age}年` 
                    : '築年月を入力すると自動計算されます'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }
  
  // ========== components/property/StaffCommentSection.tsx ==========
  'use client'
  
  interface StaffCommentSectionProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  }
  
  export function StaffCommentSection({ value, onChange }: StaffCommentSectionProps) {
    return (
      <div className="border-t pt-6">
        <h2 className="text-lg font-bold mb-4">スタッフコメント</h2>
        
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
          value={value}
          onChange={onChange}
          rows={4}
          className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="物件の魅力やおすすめポイントを記入してください。&#10;例：駅近で買い物便利！リフォーム済みですぐに住めます。"
        />
        
        {value && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">プレビュー（物件詳細での表示）：</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">スタッフより</span>
                <p className="text-gray-800 flex-1">{value}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // ========== hooks/usePropertyForm.ts ==========
  import { useState, useCallback } from 'react'
  import { useRouter } from 'next/navigation'
  import { supabase } from '@/lib/supabase'
  import { INITIAL_FORM_DATA } from '@/constants/property'
  import { Prefecture } from '@/types/property'
  
  export function usePropertyForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const [selectedPrefecture, setSelectedPrefecture] = useState<Prefecture>('奈良県')
    const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target
      
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
  
      if (name === 'prefecture') {
        setSelectedPrefecture(value as Prefecture)
        setFormData(prev => ({ ...prev, city: '', route: '' })) // 路線もリセット
      }
    }, [])
  
    const handleLayoutChange = useCallback((value: string) => {
      setFormData(prev => ({
        ...prev,
        layout: value
      }))
    }, [])
  
    const handleBuildingAgeCalculate = useCallback((age: number | null) => {
      setFormData(prev => ({
        ...prev,
        building_age: age !== null ? age.toString() : ''
      }))
    }, [])
  
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
    
      try {
        const submitData = {
          ...formData,
          price: parseInt(formData.price) || 0,
          walking_time: parseInt(formData.walking_time) || null,
          land_area: parseFloat(formData.land_area) || null,
          building_area: parseFloat(formData.building_area) || null,
          building_age: parseInt(formData.building_age) || null,
          floors: parseInt(formData.floors) || null,
          parking: parseInt(formData.parking) || null,
          building_coverage: parseFloat(formData.building_coverage) || null,
          floor_area_ratio: parseFloat(formData.floor_area_ratio) || null,
          total_units: parseInt(formData.total_units) || null,
          management_fee: parseInt(formData.management_fee) || null,
          repair_fund: parseInt(formData.repair_fund) || null,
          balcony_area: parseFloat(formData.balcony_area) || null,
          price_per_tsubo: parseFloat(formData.price_per_tsubo) || null,
          image_url: images[0] || '',
          images: images,
          address: `${formData.prefecture}${formData.city}${formData.town}`,
          // 新着物件の期限（30日後）を設定
          new_property_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
    
        const { error } = await supabase
          .from('properties')
          .insert(submitData)
          .select()
    
        if (error) {
          alert(`登録に失敗しました。\nエラー: ${error.message}`)
          throw error
        }
    
        alert('物件を登録しました')
        router.push('/admin/properties')
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsSubmitting(false)
      }
    }, [formData, images, router])
  
    return {
      formData,
      images,
      selectedPrefecture,
      isSubmitting,
      handleChange,
      handleSubmit,
      handleLayoutChange,
      handleBuildingAgeCalculate,
      setImages
    }
  }
  
  // ========== components/PropertyCard.tsx（物件一覧用） ==========
  'use client'
  
  import { isNewProperty } from '@/utils/dateHelpers'
  
  interface PropertyCardProps {
    property: {
      id: string
      name: string
      price: number
      image_url: string
      staff_comment: string
      created_at: string
      new_property_expires_at?: string
      // ... その他のプロパティ
    }
  }
  
  export function PropertyCard({ property }: PropertyCardProps) {
    const isNew = property.new_property_expires_at 
      ? new Date(property.new_property_expires_at) > new Date()
      : isNewProperty(property.created_at)
  
    return (
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
        <div className="relative">
          <img 
            src={property.image_url} 
            alt={property.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          
          {/* バッジ表示 */}
          <div className="absolute top-2 left-2 flex gap-2">
            {isNew && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                NEW
              </span>
            )}
            {property.staff_comment && (
              <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold animate-pulse">
                スタッフおすすめ！
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{property.name}</h3>
          <p className="text-2xl font-bold text-red-600">
            {property.price.toLocaleString()}万円
          </p>
          
          {/* スタッフコメントがある場合は表示 */}
          {property.staff_comment && (
            <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400">
              <p className="text-sm text-gray-700 line-clamp-2">
                {property.staff_comment}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // ========== components/PropertyDetail.tsx（物件詳細ページ用） ==========
  'use client'
  
  interface PropertyDetailProps {
    property: {
      staff_comment?: string
      images?: string[]
      // ... その他のプロパティ
    }
  }
  
  export function PropertyDetail({ property }: PropertyDetailProps) {
    return (
      <div>
        {/* 画像表示部分 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {property.images?.map((image, index) => (
            <img 
              key={index}
              src={image} 
              alt={`物件画像${index + 1}`}
              className="w-full h-64 object-cover rounded"
            />
          ))}
        </div>
        
        {/* スタッフコメント */}
        {property.staff_comment && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-red-500 text-white rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">スタッフからのおすすめポイント</h3>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {property.staff_comment}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* その他の物件情報 */}
      </div>
    )
  }
  