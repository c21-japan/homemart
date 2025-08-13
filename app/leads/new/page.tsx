'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createLeadSchema, LeadType, LeadExtra, PHOTO_CATEGORIES, PhotoCategory } from '@/types/leads'
import { createLead } from '@/app/(secure)/actions/leads'
import { createAgreement } from '@/app/(secure)/actions/agreements'
import { supabase } from '@/lib/supabase'
import { CameraIcon, PhotoIcon, XMarkIcon, MapPinIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

// フォームデータの型
type FormData = {
  type: LeadType
  source?: string
  last_name: string
  first_name: string
  last_name_kana?: string
  first_name_kana?: string
  email?: string
  phone?: string
  postal_code?: string
  prefecture?: string
  city?: string
  address1?: string
  address2?: string
  residence_structure?: string
  household?: string
  note?: string
  location?: { lat: number; lng: number }
  extra: LeadExtra
  // 購入関連フィールド
  budget?: string
  desired_area?: string
  layout?: string
  move_in_timing?: string
  loan_preapproved?: string
  // 売却関連フィールド
  property_type?: string
  building_name?: string
  room_no?: string
  land_size?: string
  floor_area?: string
  year_built?: string
  remaining_loan?: string
  expected_price?: string
  psychological_defect?: string
  parking_state?: string
  hoa_fee?: string
  reason?: string
  current_status?: string
  // リフォーム関連フィールド
  target_rooms?: string
  wish_items?: string
  rough_budget?: string
  desired_deadline?: string
  visit_request?: string
  // 契約関連フィールド
  contract_type?: string
  signed_at?: string
}

export default function NewLeadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [attachments, setAttachments] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showMorePhotos, setShowMorePhotos] = useState(false)
  const [photoSlots, setPhotoSlots] = useState<Record<number, { file: File | null; path: string; category: string }>>({})
  const [processingPhotos, setProcessingPhotos] = useState<Record<number, boolean>>({})
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<FormData>({
    resolver: zodResolver(createLeadSchema),
    mode: 'onChange'
  })

  const selectedType = watch('type')

  // オンライン状態の監視
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 位置情報の取得
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('位置情報が利用できません')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        setValue('location', { lat: latitude, lng: longitude })
        setShowLocationModal(false)
      },
      (error) => {
        console.error('位置情報の取得に失敗:', error)
        alert('位置情報の取得に失敗しました')
      }
    )
  }

  // ファイルアップロード
  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // ファイルサイズチェック（10MB制限）
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name}のサイズが大きすぎます（10MB以下にしてください）`)
          continue
        }

        // 署名付きURLを取得
        const { data: presignData, error: presignError } = await supabase.storage
          .from('lead-attachments')
          .createSignedUploadUrl(`temp/${Date.now()}-${file.name}`)

        if (presignError) {
          console.error('Presign error:', presignError)
          alert(`${file.name}のアップロード準備に失敗しました`)
          continue
        }

        // ファイルをアップロード
        const uploadResponse = await fetch(presignData.signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          }
        })

        if (uploadResponse.ok) {
          setAttachments(prev => [...prev, presignData.path])
        } else {
          alert(`${file.name}のアップロードに失敗しました`)
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('ファイルのアップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  // カメラ起動
  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }

  // ファイル選択
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // 写真スロットの変更
  const handlePhotoChange = async (slot: number, file: File) => {
    if (!file) return

    setProcessingPhotos(prev => ({ ...prev, [slot]: true }))

    try {
      const category = PHOTO_CATEGORIES[slot as keyof typeof PHOTO_CATEGORIES]
      
      // 署名付きURLを取得
      const response = await fetch('/api/photos/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: 'temp', // 一時的なID
          slot,
          category,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        })
      })

      if (!response.ok) {
        throw new Error('署名付きURLの取得に失敗しました')
      }

      const { uploadUrl, filePath } = await response.json()

      // ファイルをアップロード
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      })

      if (uploadResponse.ok) {
        // 写真スロットを更新
        setPhotoSlots(prev => ({
          ...prev,
          [slot]: { file, path: filePath, category }
        }))

        // AI処理を開始
        await processPhoto(slot, filePath, category)
      } else {
        throw new Error('ファイルのアップロードに失敗しました')
      }
    } catch (error) {
      console.error('写真アップロードエラー:', error)
      alert(`写真${slot}のアップロードに失敗しました`)
    } finally {
      setProcessingPhotos(prev => ({ ...prev, [slot]: false }))
    }
  }

  // 写真の削除
  const handlePhotoRemove = (slot: number) => {
    setPhotoSlots(prev => {
      const newSlots = { ...prev }
      delete newSlots[slot]
      return newSlots
    })
  }

  // AI画像処理
  const processPhoto = async (slot: number, filePath: string, category: string) => {
    try {
      // 自動補正
      const enhanceResponse = await fetch('/api/photos/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: 'temp',
          slot,
          category,
          originalPath: filePath,
          processType: 'enhance'
        })
      })

      if (enhanceResponse.ok) {
        console.log(`写真${slot}の自動補正完了`)
      }

      // バーチャル演出（任意）
      const stageResponse = await fetch('/api/photos/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: 'temp',
          slot,
          category,
          originalPath: filePath,
          processType: 'stage'
        })
      })

      if (stageResponse.ok) {
        console.log(`写真${slot}のバーチャル演出完了`)
      }
    } catch (error) {
      console.error('AI処理エラー:', error)
    }
  }

  // 添付ファイル削除
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  // フォーム送信
  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      // 用途別の追加項目を構築
      let extra: LeadExtra
      
      switch (data.type) {
        case 'purchase':
          extra = {
            type: 'purchase',
            budget: parseInt(watch('budget') || '0'),
            desired_area: watch('desired_area'),
            layout: watch('layout'),
            move_in_timing: watch('move_in_timing'),
            loan_preapproved: watch('loan_preapproved') === 'true'
          }
          break
        case 'sell':
          extra = {
            type: 'sell',
            property_type: watch('property_type'),
            building_name: watch('building_name'),
            room_no: watch('room_no'),
            land_size: parseFloat(watch('land_size') || '0'),
            floor_area: parseFloat(watch('floor_area') || '0'),
            year_built: watch('year_built'),
            remaining_loan: parseInt(watch('remaining_loan') || '0'),
            expected_price: parseInt(watch('expected_price') || '0'),
            psychological_defect: watch('psychological_defect') === 'true',
            parking_state: watch('parking_state'),
            hoa_fee: parseInt(watch('hoa_fee') || '0'),
            reason: watch('reason'),
            current_status: watch('current_status') as 'vacant' | 'occupied'
          }
          break
        case 'reform':
          extra = {
            type: 'reform',
            target_rooms: watch('target_rooms')?.split(',').map(r => r.trim()).filter(Boolean),
            wish_items: watch('wish_items')?.split(',').map(i => i.trim()).filter(Boolean),
            rough_budget: parseInt(watch('rough_budget') || '0'),
            desired_deadline: watch('desired_deadline'),
            visit_request: watch('visit_request') === 'true'
          }
          break
        default:
          extra = { type: 'purchase' }
      }

      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })
      formData.append('attachments', JSON.stringify(attachments))
      formData.append('extra', JSON.stringify(extra))

      const result = await createLead(formData)

      if (result.success) {
        alert('顧客情報を登録しました')
        router.push('/admin/leads')
      } else {
        alert(`登録に失敗しました: ${result.error}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // オフライン時の処理
  const handleOfflineSubmit = async (data: FormData) => {
    try {
      // IndexedDBに保存（簡易実装）
      const offlineData = {
        id: Date.now().toString(),
        data: { ...data, attachments, extra: {} },
        timestamp: new Date().toISOString()
      }
      
      localStorage.setItem(`offline_lead_${offlineData.id}`, JSON.stringify(offlineData))
      
      alert('オフラインで保存しました。接続復帰時に自動送信されます。')
      router.push('/admin/leads')
    } catch (error) {
      console.error('Offline save error:', error)
      alert('オフライン保存に失敗しました')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← 戻る
            </button>
            <h1 className="text-lg font-semibold text-gray-900">新規顧客登録</h1>
            <div className="w-8" />
          </div>
          
          {/* オンライン状態表示 */}
          <div className="mt-2 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isOnline ? 'オンライン' : 'オフライン'}
            </span>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit(isOnline ? onSubmit : handleOfflineSubmit)} className="p-4 space-y-6">
        {/* 用途選択 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">用途選択</h2>
          <select
            {...register('type')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="purchase">購入</option>
            <option value="sell">売却</option>
            <option value="reform">リフォーム</option>
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        {/* 基本情報 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">基本情報</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓 *</label>
                <input
                  {...register('last_name')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="田中"
                />
                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名 *</label>
                <input
                  {...register('first_name')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="太郎"
                />
                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓（カナ）</label>
                <input
                  {...register('last_name_kana')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="タナカ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名（カナ）</label>
                <input
                  {...register('first_name_kana')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="タロウ"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="090-1234-5678"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input
                {...register('email')}
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="tanaka@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">取得経路</label>
              <select
                {...register('source')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">選択してください</option>
                <option value="現地">現地</option>
                <option value="電話">電話</option>
                <option value="紹介">紹介</option>
                <option value="チラシ">チラシ</option>
                <option value="サイト">サイト</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </div>
        </div>

        {/* 用途別項目 */}
        {selectedType === 'purchase' && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">購入希望情報</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">予算</label>
                <input
                  {...register('budget')}
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">希望エリア</label>
                <input
                  {...register('desired_area')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="奈良市、生駒市等"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">希望間取り</label>
                <input
                  {...register('layout')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="3LDK、4LDK等"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">入居希望時期</label>
                <input
                  {...register('move_in_timing')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2025年春、即入居等"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">事前審査</label>
                <select
                  {...register('loan_preapproved')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="true">済み</option>
                  <option value="false">未</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedType === 'sell' && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">売却物件情報</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">物件種別</label>
                <select
                  {...register('property_type')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="一戸建て">一戸建て</option>
                  <option value="マンション">マンション</option>
                  <option value="土地">土地</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">建物名</label>
                <input
                  {...register('building_name')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="○○マンション"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">部屋番号</label>
                <input
                  {...register('room_no')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="101号室"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">土地面積（㎡）</label>
                  <input
                    {...register('land_size')}
                    type="number"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="150.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">延床面積（㎡）</label>
                  <input
                    {...register('floor_area')}
                    type="number"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="120.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">築年</label>
                <input
                  {...register('year_built')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2000年"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">希望価格</label>
                <input
                  {...register('expected_price')}
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="45000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">心理的瑕疵</label>
                <select
                  {...register('psychological_defect')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="true">有</option>
                  <option value="false">無</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">駐車場状況</label>
                <select
                  {...register('parking_state')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="有">有</option>
                  <option value="無">無</option>
                  <option value="要相談">要相談</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">現況</label>
                <select
                  {...register('current_status')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="occupied">居住中</option>
                  <option value="vacant">空家</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedType === 'reform' && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">リフォーム希望情報</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">対象箇所</label>
                <input
                  {...register('target_rooms')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="キッチン,リビング,浴室（カンマ区切り）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">希望商品・グレード</label>
                <input
                  {...register('wish_items')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="システムキッチン,フローリング（カンマ区切り）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">概算予算</label>
                <input
                  {...register('rough_budget')}
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="8000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">希望完了時期</label>
                <input
                  {...register('desired_deadline')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2025年3月"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">現地調査希望</label>
                <select
                  {...register('visit_request')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="true">希望</option>
                  <option value="false">不要</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 位置情報 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">位置情報（任意）</h2>
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <MapPinIcon className="w-5 h-5 text-gray-500" />
              現在位置を取得
            </button>
            {currentLocation && (
              <div className="text-sm text-gray-600">
                緯度: {currentLocation.lat.toFixed(6)}, 経度: {currentLocation.lng.toFixed(6)}
              </div>
            )}
          </div>
        </div>

        {/* 画像添付（売却時のみ30枚対応） */}
        {selectedType === 'sell' && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">写真30枚（売却物件）</h2>
            <div className="space-y-4">
              {/* 固定カテゴリ（1-14） */}
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 14 }, (_, i) => i + 1).map(slot => (
                  <PhotoSlot
                    key={slot}
                    slot={slot}
                    category={PHOTO_CATEGORIES[slot as keyof typeof PHOTO_CATEGORIES]}
                    onPhotoChange={handlePhotoChange}
                    onPhotoRemove={handlePhotoRemove}
                    photoData={photoSlots[slot]}
                    processing={processingPhotos[slot]}
                  />
                ))}
              </div>

              {/* もっと見るボタン */}
              <button
                type="button"
                onClick={() => setShowMorePhotos(!showMorePhotos)}
                className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                {showMorePhotos ? (
                  <>
                    <ChevronUpIcon className="w-5 h-5" />
                    写真を隠す
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-5 h-5" />
                    もっと見る（15-30枚）
                  </>
                )}
              </button>

              {/* 追加カテゴリ（15-30） */}
              {showMorePhotos && (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 16 }, (_, i) => i + 15).map(slot => (
                    <PhotoSlot
                      key={slot}
                      slot={slot}
                      category={PHOTO_CATEGORIES[slot as keyof typeof PHOTO_CATEGORIES]}
                      onPhotoChange={handlePhotoChange}
                      onPhotoRemove={handlePhotoRemove}
                      photoData={photoSlots[slot]}
                      processing={processingPhotos[slot]}
                    />
                  ))}
                </div>
              )}

              {/* 隠しファイル入力 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* 一般画像添付（売却以外） */}
        {selectedType !== 'sell' && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">画像添付</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCameraCapture}
                  disabled={uploading}
                  className="flex-1 p-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                >
                  <CameraIcon className="w-5 h-5" />
                  カメラ
                </button>
                <button
                  type="button"
                  onClick={handleFileSelect}
                  disabled={uploading}
                  className="flex-1 p-3 bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 disabled:opacity-50"
                >
                  <PhotoIcon className="w-5 h-5" />
                  ファイル選択
                </button>
              </div>

              {/* 添付ファイル一覧 */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">添付ファイル</h3>
                  {attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600 truncate">{attachment}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploading && (
                <div className="text-sm text-gray-600 text-center">アップロード中...</div>
              )}
            </div>
          </div>
        )}

        {/* 媒介契約（売却時のみ） */}
        {selectedType === 'sell' && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">媒介契約</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">契約種別 *</label>
                <select
                  {...register('contract_type')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="専属専任">専属専任（週1回報告）</option>
                  <option value="専任">専任（2週に1回報告）</option>
                  <option value="一般">一般（任意報告）</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">契約締結日 *</label>
                <input
                  {...register('signed_at')}
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 備考 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">備考</h2>
          <textarea
            {...register('note')}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="その他の要望や詳細な条件等を記入してください"
          />
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full p-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '送信中...' : isOnline ? '登録する' : 'オフラインで保存'}
        </button>

        {!isOnline && (
          <p className="text-sm text-gray-600 text-center">
            オフラインです。入力内容は端末に保存され、接続復帰時に自動送信されます。
          </p>
        )}
      </form>

      {/* 位置情報取得モーダル */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">位置情報の取得</h3>
            <p className="text-sm text-gray-600 mb-4">
              現在地の位置情報を取得しますか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={getCurrentLocation}
                className="flex-1 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                取得する
              </button>
              <button
                onClick={() => setShowLocationModal(false)}
                className="flex-1 p-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 写真スロットコンポーネント
interface PhotoSlotProps {
  slot: number
  category: string
  onPhotoChange: (slot: number, file: File) => void
  onPhotoRemove: (slot: number) => void
  photoData?: { file: File | null; path: string; category: string }
  processing?: boolean
}

function PhotoSlot({ slot, category, onPhotoChange, onPhotoRemove, photoData, processing }: PhotoSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onPhotoChange(slot, file)
    }
  }

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg p-3">
      <div className="text-xs font-medium text-gray-700 mb-2">
        {slot}. {category}
      </div>
      
      {photoData?.file ? (
        <div className="space-y-2">
          <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center">
            {processing ? (
              <div className="text-xs text-gray-500">処理中...</div>
            ) : (
              <div className="text-xs text-gray-500">✓ アップロード済み</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onPhotoRemove(slot)}
            className="w-full text-xs text-red-600 hover:text-red-800"
          >
            削除
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleCameraCapture}
            disabled={processing}
            className="w-full p-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
          >
            カメラ
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="w-full p-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-50"
          >
            選択
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
