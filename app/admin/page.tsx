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
  
  export const INITIAL_FORM_DATA = {
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
    
    // 共通特徴
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
  }
  
  // ========== types/property.ts ==========
  export type PropertyType = typeof PROPERTY_TYPES[keyof typeof PROPERTY_TYPES]
  export type Prefecture = keyof typeof AREA_DATA
  export type FormData = typeof INITIAL_FORM_DATA
  
  // ========== components/property/BasicInfoSection.tsx ==========
  'use client'
  
  import { FormData, Prefecture } from '@/types/property'
  import { AREA_DATA } from '@/constants/property'
  
  interface BasicInfoSectionProps {
    formData: FormData
    selectedPrefecture: Prefecture
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  }
  
  export function BasicInfoSection({ formData, selectedPrefecture, onChange }: BasicInfoSectionProps) {
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
            <input
              type="text"
              name="route"
              value={formData.route}
              onChange={onChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="例：近鉄大阪線"
            />
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
                <input
                  type="text"
                  name="layout"
                  value={formData.layout}
                  onChange={onChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="例：3LDK"
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
                  築年数
                </label>
                <input
                  type="number"
                  name="building_age"
                  value={formData.building_age}
                  onChange={onChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </>
          )}
        </div>
      </div>
    )
  }
  
  // ========== components/property/ImageUploadSection.tsx ==========
  'use client'
  
  import { useState } from 'react'
  import { ImageSlot } from './ImageSlot'
  import { BulkImageUpload } from './BulkImageUpload'
  
  interface ImageUploadSectionProps {
    images: string[]
    onImagesChange: (images: string[]) => void
  }
  
  export function ImageUploadSection({ images, onImagesChange }: ImageUploadSectionProps) {
    const [showMoreImages, setShowMoreImages] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    
    const displaySlots = showMoreImages ? 20 : 12
  
    const handleImageSelect = (index: number, imageUrl: string) => {
      const newImages = [...images]
      if (images.length <= index) {
        while (newImages.length < index) {
          newImages.push('')
        }
        newImages.push(imageUrl)
      } else {
        newImages[index] = imageUrl
      }
      onImagesChange(newImages.filter(img => img !== ''))
    }
  
    const removeImage = (index: number) => {
      const newImages = [...images]
      newImages.splice(index, 1)
      onImagesChange(newImages)
    }
  
    const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedIndex(index)
      e.dataTransfer.effectAllowed = 'move'
    }
  
    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault()
      if (draggedIndex === null || draggedIndex === dropIndex) return
  
      const draggedImage = images[draggedIndex]
      const newImages = [...images]
      
      newImages.splice(draggedIndex, 1)
      const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
      newImages.splice(adjustedDropIndex, 0, draggedImage)
      
      onImagesChange(newImages)
      setDraggedIndex(null)
    }
  
    return (
      <div className="border-t pt-6">
        <h2 className="text-lg font-bold mb-4">
          物件画像（最大20枚）
        </h2>
        
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: displaySlots }, (_, index) => (
            <ImageSlot
              key={index}
              index={index}
              imageUrl={images[index]}
              onImageSelect={(url) => handleImageSelect(index, url)}
              onRemove={() => removeImage(index)}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          ))}
        </div>
  
        {!showMoreImages && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowMoreImages(true)}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              もっと画像登録を増やす（13〜20枚目）
            </button>
          </div>
        )}
  
        <BulkImageUpload 
          currentImages={images}
          onImagesAdd={(newImages) => onImagesChange([...images, ...newImages].slice(0, 20))}
        />
  
        <div className="mt-4 text-sm text-gray-600">
          選択済み: {images.length} / 20 枚
        </div>
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
        setFormData(prev => ({ ...prev, city: '' }))
      }
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
          address: `${formData.prefecture}${formData.city}${formData.town}`
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
      setImages
    }
  }
  
  // ========== app/admin/properties/new/page.tsx ==========
  'use client'
  
  import Link from 'next/link'
  import { usePropertyForm } from '@/hooks/usePropertyForm'
  import { BasicInfoSection } from '@/components/property/BasicInfoSection'
  import { PropertyTypeSection } from '@/components/property/PropertyTypeSection'
  import { HouseDetailSection } from '@/components/property/HouseDetailSection'
  import { MansionDetailSection } from '@/components/property/MansionDetailSection'
  import { LandDetailSection } from '@/components/property/LandDetailSection'
  import { FeaturesSection } from '@/components/property/FeaturesSection'
  import { StaffCommentSection } from '@/components/property/StaffCommentSection'
  import { ImageUploadSection } from '@/components/property/ImageUploadSection'
  import { PROPERTY_TYPES } from '@/constants/property'
  
  export default function NewProperty() {
    const {
      formData,
      images,
      selectedPrefecture,
      isSubmitting,
      handleChange,
      handleSubmit,
      setImages
    } = usePropertyForm()
  
    const today = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">新規物件登録</h1>
              <div className="text-sm text-gray-600">
                登録日：{today}
              </div>
            </div>
  
            <form onSubmit={handleSubmit} className="space-y-6">
              <PropertyTypeSection 
                formData={formData} 
                onChange={handleChange} 
              />
              
              <BasicInfoSection 
                formData={formData} 
                selectedPrefecture={selectedPrefecture}
                onChange={handleChange} 
              />
  
              {(formData.property_type === PROPERTY_TYPES.NEW_HOUSE || 
                formData.property_type === PROPERTY_TYPES.USED_HOUSE) && (
                <HouseDetailSection 
                  formData={formData} 
                  onChange={handleChange} 
                />
              )}
  
              {formData.property_type === PROPERTY_TYPES.USED_MANSION && (
                <MansionDetailSection 
                  formData={formData} 
                  onChange={handleChange} 
                />
              )}
  
              {formData.property_type === PROPERTY_TYPES.LAND && (
                <LandDetailSection 
                  formData={formData} 
                  onChange={handleChange} 
                />
              )}
  
              <FeaturesSection 
                features={formData.features} 
                onChange={handleChange} 
              />
              
              <StaffCommentSection 
                value={formData.staff_comment} 
                onChange={handleChange} 
              />
              
              <ImageUploadSection 
                images={images} 
                onImagesChange={setImages} 
              />
  
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? '登録中...' : '物件を登録'}
                </button>
                <Link
                  href="/admin/properties"
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded font-bold text-center hover:bg-gray-400 transition-colors"
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
  