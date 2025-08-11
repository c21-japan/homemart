'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 都道府県と市区町村のデータ
const areaData = {
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
}

export default function NewProperty() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [selectedPrefecture, setSelectedPrefecture] = useState('奈良県')
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    address: '',
    description: '',
    phone: '',
    status: 'published',
    is_new: true,
    property_type: '新築戸建',
    prefecture: '奈良県',
    city: '',
    town: '',
    station: '',
    walking_time: '',
    land_area: '',
    building_area: '',
    layout: '',
    building_age: '',
    structure: '木造',
    floors: '',
    parking: '',
    building_coverage: '',
    floor_area_ratio: '',
    land_rights: '所有権',
    use_district: '',
    road_situation: '',
    current_status: '空家',
    reform_history: '',
    equipment: '',
    features: '',
    staff_comment: '',
    // マンション用
    total_units: '',
    management_fee: '',
    repair_fund: '',
    management_company: '',
    balcony_area: '',
    // 土地用
    price_per_tsubo: '',
    land_shape: '整形',
    building_conditions: '無'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // 都道府県が変更されたら市区町村をリセット
    if (name === 'prefecture') {
      setSelectedPrefecture(value)
      setFormData(prev => ({ ...prev, city: '' }))
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images]
    if (direction === 'up' && index > 0) {
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]]
    } else if (direction === 'down' && index < images.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
    }
    setImages(newImages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('properties')
        .insert({
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
        })

      if (error) throw error

      alert('物件を登録しました')
      router.push('/admin/properties')
    } catch (error) {
      console.error('Error:', error)
      alert('登録に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 今日の日付を取得
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
                  新着物件
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
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
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
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
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
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">選択してください</option>
                    {areaData[selectedPrefecture as keyof typeof areaData]?.map(city => (
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

                <div>
                  <label className="block text-sm font-medium mb-2">
                    間取り
                  </label>
                  <input
                    type="text"
                    name="layout"
                    value={formData.layout}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="例：3LDK"
                  />
                </div>
              </div>
            </div>

            {/* 物件種別に応じた詳細情報 */}
            {(formData.property_type === '新築戸建' || formData.property_type === '中古戸建') && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-bold mb-4">戸建詳細情報</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">土地面積（㎡）</label>
                    <input
                      type="number"
                      name="land_area"
                      value={formData.land_area}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
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
                    <label className="block text-sm font-medium mb-2">築年数</label>
                    <input
                      type="number"
                      name="building_age"
                      value={formData.building_age}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
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
                    <label className="block text-sm font-medium mb-2">駐車場（台）</label>
                    <input
                      type="number"
                      name="parking"
                      value={formData.parking}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.property_type === '中古マンション' && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-bold mb-4">マンション詳細情報</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">専有面積（㎡）</label>
                    <input
                      type="number"
                      name="building_area"
                      value={formData.building_area}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">バルコニー面積（㎡）</label>
                    <input
                      type="number"
                      name="balcony_area"
                      value={formData.balcony_area}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">管理費（月額）</label>
                    <input
                      type="number"
                      name="management_fee"
                      value={formData.management_fee}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">修繕積立金（月額）</label>
                    <input
                      type="number"
                      name="repair_fund"
                      value={formData.repair_fund}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.property_type === '土地' && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-bold mb-4">土地詳細情報</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">土地面積（㎡）</label>
                    <input
                      type="number"
                      name="land_area"
                      value={formData.land_area}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">坪単価（万円）</label>
                    <input
                      type="number"
                      name="price_per_tsubo"
                      value={formData.price_per_tsubo}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">土地形状</label>
                    <select
                      name="land_shape"
                      value={formData.land_shape}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="整形">整形</option>
                      <option value="不整形">不整形</option>
                      <option value="角地">角地</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">建築条件</label>
                    <select
                      name="building_conditions"
                      value={formData.building_conditions}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="無">無</option>
                      <option value="有">有</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* スタッフコメント */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold mb-4">スタッフコメント</h2>
              <textarea
                name="staff_comment"
                value={formData.staff_comment}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border rounded"
                placeholder="物件の魅力やおすすめポイントを記入してください"
              />
            </div>

            {/* 画像アップロード */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold mb-4">
                物件画像（最大20枚）
              </h2>
              
              {/* 20枚分のスロット */}
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 20 }, (_, index) => {
                  const imageUrl = images[index]
                  const label = index === 0 ? '外観' : index === 1 ? '間取り図' : `その他${index - 1}`
                  
                  return (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
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
                              className="w-full h-full object-cover"
                            />
                            {/* 削除・移動ボタン */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 'up')}
                                  className="bg-white text-black px-2 py-1 rounded text-xs"
                                >
                                  ←
                                </button>
                              )}
                              {index < images.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 'down')}
                                  className="bg-white text-black px-2 py-1 rounded text-xs"
                                >
                                  →
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                              >
                                削除
                              </button>
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
                              const reader = new FileReader()
                              reader.onload = (event) => {
                                const newImages = [...images]
                                if (images.length <= index) {
                                  // 新規追加
                                  while (newImages.length < index) {
                                    newImages.push('')
                                  }
                                  newImages.push(event.target?.result as string)
                                } else {
                                  // 既存を置き換え
                                  newImages[index] = event.target?.result as string
                                }
                                setImages(newImages.filter(img => img !== ''))
                              }
                              reader.readAsDataURL(file)
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

              {/* ドラッグ&ドロップ対応の一括アップロード */}
              <div 
                className="mt-6 p-8 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 text-center"
                onDrop={(e) => {
                  e.preventDefault()
                  const files = Array.from(e.dataTransfer.files)
                  const newImages = [...images]
                  
                  files.forEach((file) => {
                    if (file.type.startsWith('image/') && newImages.length < 20) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        if (newImages.length < 20) {
                          newImages.push(event.target?.result as string)
                          setImages([...newImages])
                        }
                      }
                      reader.readAsDataURL(file)
                    }
                  })
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <svg className="mx-auto h-12 w-12 text-blue-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 mb-2">画像をドラッグ&ドロップ</p>
                <p className="text-xs text-gray-500 mb-3">または</p>
                <label
                  htmlFor="bulk-upload"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
                >
                  ファイルを選択
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  id="bulk-upload"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    const newImages = [...images]
                    
                    files.forEach((file) => {
                      if (newImages.length < 20) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          if (newImages.length < 20) {
                            newImages.push(event.target?.result as string)
                            setImages([...newImages])
                          }
                        }
                        reader.readAsDataURL(file)
                      }
                    })
                  }}
                />
              </div>

              {/* 選択済み画像数の表示 */}
              <div className="mt-4 text-sm text-gray-600">
                選択済み: {images.length} / 20 枚
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
                href="/admin/properties"
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
