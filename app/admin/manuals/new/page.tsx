'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const MAX_VIDEO_SIZE = 200 * 1024 * 1024
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v'
]

export default function ManualCreatePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<'工務部' | '営業/事務'>('営業/事務')
  const [content, setContent] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return

    const filtered = files.filter(file => {
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        alert(`${file.name} は対応していない形式です。`) 
        return false
      }
      if (file.size > MAX_VIDEO_SIZE) {
        alert(`${file.name} は200MB以下にしてください。`)
        return false
      }
      return true
    })

    setSelectedFiles(prev => [...prev, ...filtered])
    e.target.value = ''
  }

  const uploadVideos = async (manualId: string) => {
    if (selectedFiles.length === 0) return

    setUploading(true)

    const uploaded = [] as Array<{
      manual_id: string
      title: string
      file_path: string
      file_name: string
      file_type: string
      file_size: number
    }>

    try {
      for (const file of selectedFiles) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 10 }))

        const response = await fetch('/api/manual-videos/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '動画アップロードの準備に失敗しました')
        }

        const { uploadUrl, filePath } = await response.json()
        setUploadProgress(prev => ({ ...prev, [file.name]: 40 }))

        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        })

        if (!uploadResponse.ok) {
          throw new Error(`${file.name} のアップロードに失敗しました`)
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 80 }))

        uploaded.push({
          manual_id: manualId,
          title: file.name,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size
        })

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
      }

      if (uploaded.length > 0) {
        const { error } = await supabase
          .from('manual_videos')
          .insert(uploaded)

        if (error) {
          throw error
        }
      }
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('タイトルを入力してください')
      return
    }
    if (!content.trim()) {
      alert('本文を入力してください')
      return
    }

    setSaving(true)

    try {
      const { data, error } = await supabase
        .from('manuals')
        .insert({
          title: title.trim(),
          category,
          content: content.trim()
        })
        .select('id')
        .single()

      if (error || !data) {
        throw error || new Error('マニュアル作成に失敗しました')
      }

      if (selectedFiles.length > 0) {
        await uploadVideos(data.id)
      }

      router.push(`/admin/manuals/${data.id}`)
    } catch (error) {
      console.error('Error creating manual:', error)
      alert('マニュアルの作成に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'var(--header-height, 0px)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">新規マニュアル作成</h1>
              <p className="text-gray-600 mt-1">目的・手順・注意点をわかりやすくまとめましょう</p>
            </div>
            <Link
              href="/admin/manuals"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              一覧に戻る
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 物件登録の流れ"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">カテゴリ</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as '工務部' | '営業/事務')}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="工務部">工務部</option>
              <option value="営業/事務">営業/事務</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">本文</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="【目的】\n\n【手順】\n1. ...\n\n【注意点】\n..."
              rows={12}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm leading-6 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">動画アップロード</label>
            <div className="mt-2 flex items-center gap-4">
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
                multiple
                onChange={handleFileSelect}
                className="block w-full text-sm"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">対応形式: MP4, MOV, WebM / 200MB以下</p>

            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            )}

            {Object.keys(uploadProgress).length > 0 && (
              <div className="mt-4 space-y-2">
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="rounded-lg border border-gray-200 px-3 py-2">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{fileName}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className={`rounded-lg px-6 py-2 text-sm font-semibold text-white ${saving || uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {saving ? '保存中...' : uploading ? '動画アップロード中...' : '保存する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
