'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface MediaFile {
  id: string
  name: string
  url: string
  type: string
  size: number
  created_at: string
  property_id?: string
}

export default function MediaManagement() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [maxFiles] = useState(20)

  useEffect(() => {
    fetchMediaFiles()
  }, [])

  const fetchMediaFiles = async () => {
    try {
      setLoading(true)
      
      // Supabaseから物件データを取得
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, name, image_url')
        .order('created_at', { ascending: false })

      if (propertiesError) throw propertiesError

      // 画像ファイルのデータを構築
      const mediaData: MediaFile[] = []
      
      // 物件に画像が設定されている場合
      if (propertiesData) {
        propertiesData.forEach(property => {
          if (property.image_url) {
            mediaData.push({
              id: `property-${property.id}`,
              name: `${property.name}.jpg`,
              url: property.image_url,
              type: 'image/jpeg',
              size: 1024000, // 推定サイズ
              created_at: new Date().toISOString(),
              property_id: property.id
            })
          }
        })
      }

      // サンプル画像も追加（開発用）
      if (mediaData.length === 0) {
        mediaData.push(
          {
            id: '1',
            name: 'sample-property-1.jpg',
            url: 'https://res.cloudinary.com/dowleg3za/image/upload/v1/sample-property-1',
            type: 'image/jpeg',
            size: 1024000,
            created_at: new Date().toISOString(),
            property_id: '1'
          },
          {
            id: '2',
            name: 'sample-property-2.jpg',
            url: 'https://res.cloudinary.com/dowleg3za/image/upload/v1/sample-property-2',
            type: 'image/jpeg',
            size: 2048000,
            created_at: new Date().toISOString(),
            property_id: '2'
          }
        )
      }

      setMediaFiles(mediaData)
    } catch (error) {
      console.error('Error fetching media files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      
      // 最大20枚まで制限
      if (files.length > maxFiles) {
        alert(`一度にアップロードできるのは最大${maxFiles}枚までです。`)
        return
      }
      
      // 画像ファイルのみフィルタリング
      const imageFiles = files.filter(file => file.type.startsWith('image/'))
      
      if (imageFiles.length !== files.length) {
        alert('画像ファイル以外は除外されました。')
      }
      
      setSelectedFiles(imageFiles)
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    try {
      setUploading(true)
      
      // 各ファイルのチェック
      for (const file of selectedFiles) {
        // ファイルサイズチェック（5MB以下）
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name}: ファイルサイズは5MB以下にしてください。`)
          continue
        }

        // ファイルタイプチェック
        if (!file.type.startsWith('image/')) {
          alert(`${file.name}: 画像ファイルのみアップロード可能です。`)
          continue
        }
      }

      // 一括アップロード処理
      const uploadPromises = selectedFiles.map(async (file, index) => {
        try {
          // プログレスバーの初期化
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
          
          // ここでCloudinaryへのアップロード処理を実装
          // 現在はダミーのアップロード処理（プログレスバー付き）
          for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 50))
            setUploadProgress(prev => ({ ...prev, [file.name]: i }))
          }

          const newFile: MediaFile = {
            id: `${Date.now()}-${index}`,
            name: file.name,
            url: `https://res.cloudinary.com/dowleg3za/image/upload/v1/${file.name}`,
            type: file.type,
            size: file.size,
            created_at: new Date().toISOString()
          }

          return newFile
        } catch (error) {
          console.error(`Upload error for ${file.name}:`, error)
          return null
        }
      })

      const uploadedFiles = await Promise.all(uploadPromises)
      const successfulUploads = uploadedFiles.filter(file => file !== null) as MediaFile[]

      if (successfulUploads.length > 0) {
        setMediaFiles(prev => [...successfulUploads, ...prev])
        alert(`${successfulUploads.length}枚の画像のアップロードが完了しました。`)
      }

      setSelectedFiles([])
      setUploadProgress({})
      
      // ファイル入力フィールドをリセット
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (error) {
      console.error('Upload error:', error)
      alert('アップロードに失敗しました。')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このファイルを削除してもよろしいですか？')) return

    try {
      // ここでCloudinaryからファイルを削除
      setMediaFiles(prev => prev.filter(file => file.id !== id))
      alert('ファイルを削除しました。')
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました。')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">画像管理</h1>
              <p className="text-gray-600 mt-2">サイトで使用する画像ファイルを管理します</p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        </div>

        {/* アップロードセクション */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">画像アップロード</h2>
                      <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || uploading}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    selectedFiles.length === 0 || uploading
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {uploading ? 'アップロード中...' : `アップロード (${selectedFiles.length}枚)`}
                </button>
              </div>
              
              {/* 選択されたファイル一覧 */}
              {selectedFiles.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">選択されたファイル ({selectedFiles.length}枚)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border">
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-500 text-sm">📷</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* プログレスバー */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(uploadProgress).map(([fileName, progress]) => (
                    <div key={fileName} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium truncate">{fileName}</span>
                        <span className="text-sm text-gray-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            対応形式: JPG, PNG, GIF / 最大サイズ: 5MB / 一度に最大20枚までアップロード可能
          </p>
        </div>

        {/* 画像一覧 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">画像一覧</h2>
            <p className="text-gray-600 mt-1">登録済みの画像ファイル一覧</p>
          </div>
          <div className="p-6">
            {mediaFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📷</div>
                <p className="text-gray-600">画像ファイルがありません</p>
                <p className="text-sm text-gray-500 mt-2">上記のアップロード機能で画像を追加してください</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mediaFiles.map((file) => (
                  <div key={file.id} className="border rounded-lg overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lpLHotKU8L3RleHQ+PC9zdmc+'
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate" title={file.name}>
                        {file.name}
                      </h3>
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <p>サイズ: {formatFileSize(file.size)}</p>
                        <p>タイプ: {file.type}</p>
                        <p>登録日: {formatDate(file.created_at)}</p>
                        {file.property_id && (
                          <p>物件ID: {file.property_id}</p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          表示
                        </a>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
