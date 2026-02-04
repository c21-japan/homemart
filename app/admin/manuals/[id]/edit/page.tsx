'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const MAX_VIDEO_SIZE = 200 * 1024 * 1024
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v'
]

interface ManualDetail {
  id: string
  title: string
  category: '工務部' | '営業/事務'
  content: string
  created_at: string
  updated_at: string
}

interface ManualVideo {
  id: string
  manual_id: string
  title: string | null
  file_path: string
  file_name: string
  file_type: string
  file_size: number | null
  created_at: string
  downloadUrl?: string
}

export default function ManualEditPage() {
  const params = useParams()
  const router = useRouter()
  const manualId = params?.id as string

  const [manual, setManual] = useState<ManualDetail | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<'工務部' | '営業/事務'>('営業/事務')
  const [content, setContent] = useState('')
  const [videos, setVideos] = useState<ManualVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!manualId) return
    fetchManual()
  }, [manualId])

  const fetchManual = async () => {
    try {
      setLoading(true)

      const { data: manualData, error: manualError } = await supabase
        .from('manuals')
        .select('*')
        .eq('id', manualId)
        .single()

      if (manualError) throw manualError
      setManual(manualData)
      setTitle(manualData.title)
      setCategory(manualData.category)
      setContent(manualData.content)

      await refreshVideos()
    } catch (error) {
      console.error('Error fetching manual:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshVideos = async () => {
    const { data: videoData, error: videoError } = await supabase
      .from('manual_videos')
      .select('*')
      .eq('manual_id', manualId)
      .order('created_at', { ascending: true })

    if (videoError) {
      console.error('Error fetching videos:', videoError)
      return
    }

    const withUrls = await Promise.all(
      (videoData || []).map(async (video) => {
        try {
          const response = await fetch(`/api/manual-videos/presign?path=${encodeURIComponent(video.file_path)}`)
          if (!response.ok) return video
          const { downloadUrl } = await response.json()
          return { ...video, downloadUrl }
        } catch (error) {
          console.error('Error fetching signed URL:', error)
          return video
        }
      })
    )

    setVideos(withUrls)
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('タイトルと本文は必須です')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('manuals')
        .update({
          title: title.trim(),
          category,
          content: content.trim()
        })
        .eq('id', manualId)

      if (error) throw error

      router.push(`/admin/manuals/${manualId}`)
    } catch (error) {
      console.error('Error updating manual:', error)
      alert('更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (filtered.length === 0) return

    setUploading(true)

    try {
      const uploaded = [] as Array<{
        manual_id: string
        title: string
        file_path: string
        file_name: string
        file_type: string
        file_size: number
      }>

      for (const file of filtered) {
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

        if (error) throw error
        await refreshVideos()
      }
    } catch (error) {
      console.error('Error uploading videos:', error)
      alert('動画のアップロードに失敗しました')
    } finally {
      setUploading(false)
      setUploadProgress({})
      e.target.value = ''
    }
  }

  const handleDeleteVideo = async (video: ManualVideo) => {
    if (!confirm('この動画を削除しますか？')) return

    try {
      const { error: storageError } = await supabase
        .storage
        .from('manual-videos')
        .remove([video.file_path])

      if (storageError) {
        console.error('Storage delete error:', storageError)
      }

      const { error } = await supabase
        .from('manual_videos')
        .delete()
        .eq('id', video.id)

      if (error) throw error

      setVideos(prev => prev.filter(item => item.id !== video.id))
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('動画の削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'var(--header-height, 0px)' }}>
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!manual) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'var(--header-height, 0px)' }}>
        <div className="max-w-5xl mx-auto px-4 py-10 text-center text-gray-500">
          マニュアルが見つかりませんでした。
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'var(--header-height, 0px)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">マニュアル編集</h1>
              <p className="text-gray-600 mt-1">内容の修正や動画の追加ができます</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/manuals/${manualId}`}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                詳細に戻る
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {saving ? '保存中...' : '保存する'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              rows={12}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm leading-6 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">動画を追加</label>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
              multiple
              onChange={handleVideoSelect}
              className="mt-2 block w-full text-sm"
            />
            <p className="mt-2 text-xs text-gray-500">対応形式: MP4, MOV, WebM / 200MB以下</p>

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

            {videos.length > 0 && (
              <div className="mt-6 space-y-4">
                {videos.map(video => (
                  <div key={video.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{video.title || video.file_name}</p>
                        <p className="text-xs text-gray-500">
                          {(video.file_size || 0) > 0 ? `${(video.file_size! / 1024 / 1024).toFixed(1)} MB` : 'サイズ不明'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(video)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        削除
                      </button>
                    </div>
                    {video.downloadUrl ? (
                      <video controls className="mt-3 w-full rounded-lg bg-black/90">
                        <source src={video.downloadUrl} type={video.file_type} />
                        お使いのブラウザでは動画を再生できません。
                      </video>
                    ) : (
                      <p className="mt-3 text-xs text-gray-500">動画URLの取得に失敗しました。</p>
                    )}
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
