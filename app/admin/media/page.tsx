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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchMediaFiles()
  }, [])

  const fetchMediaFiles = async () => {
    try {
      setLoading(true)
      // ここでCloudinaryやSupabaseから画像ファイルを取得
      // 現在はダミーデータを使用
      const dummyData: MediaFile[] = [
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
      ]
      setMediaFiles(dummyData)
    } catch (error) {
      console.error('Error fetching media files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      
      // ファイルサイズチェック（5MB以下）
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください。')
        return
      }

      // ファイルタイプチェック
      if (!selectedFile.type.startsWith('image/')) {
        alert('画像ファイルのみアップロード可能です。')
        return
      }

      // ここでCloudinaryへのアップロード処理を実装
      // 現在はダミーのアップロード処理
      const newFile: MediaFile = {
        id: Date.now().toString(),
        name: selectedFile.name,
        url: `https://res.cloudinary.com/dowleg3za/image/upload/v1/${selectedFile.name}`,
        type: selectedFile.type,
        size: selectedFile.size,
        created_at: new Date().toISOString()
      }

      setMediaFiles(prev => [newFile, ...prev])
      setSelectedFile(null)
      
      // ファイル入力フィールドをリセット
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      alert('アップロードが完了しました。')
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
          <div className="flex items-center gap-4">
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="flex-1 p-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                !selectedFile || uploading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? 'アップロード中...' : 'アップロード'}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            対応形式: JPG, PNG, GIF / 最大サイズ: 5MB
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
