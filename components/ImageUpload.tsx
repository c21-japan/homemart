'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  className?: string
}

export default function ImageUpload({ onImageUploaded, className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('画像アップロード開始:', file.name)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      console.log('APIレスポンス:', result)

      if (!response.ok) {
        // 環境変数が設定されていない場合の特別な処理
        if (response.status === 503) {
          throw new Error('画像アップロード機能は現在利用できません。管理者に連絡してください。')
        }
        throw new Error(result.error || 'アップロードに失敗しました')
      }

      if (!result.url) {
        console.error('URLが含まれていません:', result)
        throw new Error('アップロードレスポンスにURLが含まれていません')
      }

      console.log('アップロード成功、URL:', result.url)
      onImageUploaded(result.url)
    } catch (err) {
      console.error('アップロードエラー:', err)
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }, [onImageUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: uploading
  })

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">アップロード中...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-sm text-gray-600">
              {isDragActive ? (
                <p>ここに画像をドロップしてください</p>
              ) : (
                <div>
                  <p>画像をドラッグ&ドロップするか、クリックして選択</p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, WebP (最大5MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  )
}
