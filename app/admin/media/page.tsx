'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface MediaCategory {
  id: string
  name: string
  description: string
  recommendedSize: string
  aspectRatio: string
  maxFiles: number
}

const mediaCategories: MediaCategory[] = [
  {
    id: 'ceo',
    name: '代表写真',
    description: '乾代表の写真をアップロード',
    recommendedSize: '500×600px（縦長）',
    aspectRatio: '5:6',
    maxFiles: 1
  },
  {
    id: 'staff',
    name: 'スタッフ写真',
    description: '安田さんなどスタッフの写真',
    recommendedSize: '400×400px（正方形）',
    aspectRatio: '1:1',
    maxFiles: 10
  },
  {
    id: 'characters',
    name: 'キャラクター',
    description: 'しんちゃん風キャラクター、シロなど',
    recommendedSize: '200×200px（正方形）',
    aspectRatio: '1:1',
    maxFiles: 5
  },
  {
    id: 'model-room',
    name: 'モデルルーム',
    description: '159.8㎡モデルルームの写真',
    recommendedSize: '1200×800px（横長）',
    aspectRatio: '3:2',
    maxFiles: 20
  },
  {
    id: 'reform-before',
    name: 'リフォーム前',
    description: 'リフォーム前の写真',
    recommendedSize: '600×400px（横長）',
    aspectRatio: '3:2',
    maxFiles: 50
  },
  {
    id: 'reform-after',
    name: 'リフォーム後',
    description: 'リフォーム後の写真',
    recommendedSize: '600×400px（横長）',
    aspectRatio: '3:2',
    maxFiles: 50
  },
  {
    id: 'hero',
    name: 'ヒーロー画像',
    description: 'トップページのメイン画像',
    recommendedSize: '1920×1080px（横長）',
    aspectRatio: '16:9',
    maxFiles: 5
  },
  {
    id: 'logo',
    name: 'ロゴ・認定証',
    description: 'センチュリー21ロゴ、各種認定証',
    recommendedSize: '300×100px（横長）',
    aspectRatio: '3:1',
    maxFiles: 10
  }
]

export default function MediaManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>(mediaCategories[0])
  const [uploadedImages, setUploadedImages] = useState<{[key: string]: string[]}>({})
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // ページロード時にバケットを作成
  useEffect(() => {
    const initStorage = async () => {
      try {
        // バケットの存在確認と作成
        const { data: buckets } = await supabase.storage.listBuckets()
        const mediaExists = buckets?.some(bucket => bucket.name === 'media')
        
        if (!mediaExists) {
          const { error } = await supabase.storage.createBucket('media', {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            fileSizeLimit: 10485760 // 10MB
          })
          
          if (error && !error.message.includes('already exists')) {
            console.error('Error creating bucket:', error)
          } else {
            console.log('Media bucket created successfully')
          }
        }
        
        // 既存の画像を読み込み
        loadExistingImages()
      } catch (error) {
        console.error('Error initializing storage:', error)
      }
    }
    
    initStorage()
  }, [])

  // 既存の画像を読み込む
  const loadExistingImages = async () => {
    try {
      const images: {[key: string]: string[]} = {}
      
      for (const category of mediaCategories) {
        const { data, error } = await supabase.storage
          .from('media')
          .list(category.id, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
          })
        
        if (!error && data) {
          images[category.id] = data.map(file => {
            const { data: { publicUrl } } = supabase.storage
              .from('media')
              .getPublicUrl(`${category.id}/${file.name}`)
            return publicUrl
          })
        }
      }
      
      setUploadedImages(images)
    } catch (error) {
      console.error('Error loading existing images:', error)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    const uploaded: string[] = []

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
      
      // 画像のリサイズ処理
      const resizedFile = await resizeImage(file, selectedCategory.aspectRatio)
      
      // ファイル名の生成
      const timestamp = Date.now()
      const fileName = `${selectedCategory.id}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`

      try {
        // Supabase Storageにアップロード
        const { data, error } = await supabase.storage
          .from('media')
          .upload(fileName, resizedFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        // 公開URLを取得
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(fileName)

        uploaded.push(publicUrl)

        // 進捗更新
        setUploadProgress(Math.round(((i + 1) / acceptedFiles.length) * 100))
      } catch (error) {
        console.error('Upload error:', error)
        alert(`アップロードエラー: ${file.name}`)
      }
    }

    // アップロードした画像を保存
    setUploadedImages(prev => ({
      ...prev,
      [selectedCategory.id]: [...(prev[selectedCategory.id] || []), ...uploaded]
    }))

    setUploading(false)
    setUploadProgress(0)
  }, [selectedCategory])

  // 画像リサイズ関数
  const resizeImage = (file: File, aspectRatio: string): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          
          // アスペクト比に基づいてサイズを計算
          const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number)
          let width = img.width
          let height = img.height
          
          // 最大サイズを設定（品質を保ちつつファイルサイズを抑える）
          const maxWidth = 1920
          const maxHeight = 1920
          
          if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height)
            width *= scale
            height *= scale
          }
          
          // アスペクト比を維持してトリミング
          const targetAspect = widthRatio / heightRatio
          const currentAspect = width / height
          
          if (currentAspect > targetAspect) {
            // 横が長すぎる場合
            const newWidth = height * targetAspect
            const offsetX = (width - newWidth) / 2
            canvas.width = newWidth
            canvas.height = height
            ctx.drawImage(img, offsetX, 0, newWidth, height, 0, 0, newWidth, height)
          } else {
            // 縦が長すぎる場合
            const newHeight = width / targetAspect
            const offsetY = (height - newHeight) / 2
            canvas.width = width
            canvas.height = newHeight
            ctx.drawImage(img, 0, offsetY, width, newHeight, 0, 0, width, newHeight)
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(resizedFile)
            } else {
              resolve(file)
            }
          }, 'image/jpeg', 0.9)
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: selectedCategory.maxFiles
  })

  const deleteImage = async (categoryId: string, imageUrl: string) => {
    if (!confirm('この画像を削除しますか？')) return

    try {
      // URLからファイルパスを抽出
      const urlParts = imageUrl.split('/storage/v1/object/public/media/')
      if (urlParts.length < 2) return
      
      const filePath = urlParts[1]

      const { error } = await supabase.storage
        .from('media')
        .remove([filePath])

      if (error) throw error

      // ローカルステートから削除
      setUploadedImages(prev => ({
        ...prev,
        [categoryId]: prev[categoryId]?.filter(url => url !== imageUrl) || []
      }))

      alert('画像を削除しました')
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">画像管理</h1>
              <p className="text-sm text-gray-600 mt-1">
                各カテゴリーに画像をドラッグ&ドロップでアップロード
              </p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* カテゴリー選択 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-bold text-lg mb-4">カテゴリー</h2>
              <div className="space-y-2">
                {mediaCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedCategory.id === category.id
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-white'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs opacity-80 mt-1">
                      {uploadedImages[category.id]?.length || 0} / {category.maxFiles} 枚
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* アップロードエリア */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* カテゴリー情報 */}
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold mb-2">{selectedCategory.name}</h2>
                <p className="text-gray-600 mb-4">{selectedCategory.description}</p>
                
                <div className="bg-yellow-50 border-l-4 border-[#FFD700] p-4 rounded">
                  <h3 className="font-bold text-[#B8860B] mb-2">📏 推奨サイズ</h3>
                  <p className="text-lg font-mono">{selectedCategory.recommendedSize}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    アスペクト比: {selectedCategory.aspectRatio}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ※異なるサイズの画像も自動でリサイズ・トリミングされます
                  </p>
                </div>
              </div>

              {/* ドロップゾーン */}
              <div className="p-6">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-[#FFD700] bg-yellow-50'
                      : 'border-gray-300 hover:border-[#B8860B] hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  
                  {uploading ? (
                    <div>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
                      <p className="text-gray-600">アップロード中... {uploadProgress}%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4 max-w-xs mx-auto">
                        <div 
                          className="bg-gradient-to-r from-[#FFD700] to-[#B8860B] h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-lg text-gray-600 mb-2">
                        {isDragActive
                          ? 'ここにドロップしてください'
                          : 'クリックまたはドラッグ&ドロップで画像をアップロード'
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        最大{selectedCategory.maxFiles}枚まで • JPG, PNG, GIF, WebP対応
                      </p>
                    </div>
                  )}
                </div>

                {/* アップロード済み画像 */}
                {uploadedImages[selectedCategory.id]?.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold text-lg mb-4">アップロード済み画像</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadedImages[selectedCategory.id].map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={imageUrl}
                              alt={`${selectedCategory.name} ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => deleteImage(selectedCategory.id, imageUrl)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            画像 {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
