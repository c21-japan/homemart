'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string>(value || '')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploading(true)

    // すぐにプレビュー表示
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // アップロード処理
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.url) {
        onChange(data.url)
        setPreview(data.url)
      } else {
        alert('アップロードに失敗しました')
        setPreview('')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('アップロードに失敗しました')
      setPreview('')
    } finally {
      setIsUploading(false)
    }
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        {isUploading ? (
          <div>
            <p>アップロード中...</p>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-600">ここにドロップしてください</p>
        ) : (
          <div>
            <p className="text-gray-600">
              クリックして画像を選択<br />
              またはドラッグ&ドロップ
            </p>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG, GIF, WEBP（最大10MB）
            </p>
          </div>
        )}
      </div>

      {/* プレビュー */}
      {preview && !isUploading && (
        <div className="relative">
          <img
            src={preview}
            alt="プレビュー"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => {
              setPreview('')
              onChange('')
            }}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
