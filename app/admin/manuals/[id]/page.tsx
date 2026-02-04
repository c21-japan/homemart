'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

export default function ManualDetailPage() {
  const params = useParams()
  const manualId = params?.id as string

  const [manual, setManual] = useState<ManualDetail | null>(null)
  const [videos, setVideos] = useState<ManualVideo[]>([])
  const [loading, setLoading] = useState(true)

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

      const { data: videoData, error: videoError } = await supabase
        .from('manual_videos')
        .select('*')
        .eq('manual_id', manualId)
        .order('created_at', { ascending: true })

      if (videoError) throw videoError

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
    } catch (error) {
      console.error('Error fetching manual:', error)
    } finally {
      setLoading(false)
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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{manual.title}</h1>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${manual.category === '工務部' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {manual.category}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                更新: {new Date(manual.updated_at).toLocaleString('ja-JP')}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/manuals"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                一覧に戻る
              </Link>
              <Link
                href={`/admin/manuals/${manual.id}/edit`}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                編集
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">本文</h2>
          <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
            {manual.content}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">動画</h2>
          {videos.length === 0 ? (
            <p className="text-sm text-gray-500">関連動画はまだ登録されていません。</p>
          ) : (
            <div className="space-y-6">
              {videos.map(video => (
                <div key={video.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{video.title || video.file_name}</p>
                      <p className="text-xs text-gray-500">
                        {(video.file_size || 0) > 0 ? `${(video.file_size! / 1024 / 1024).toFixed(1)} MB` : 'サイズ不明'}
                      </p>
                    </div>
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
      </div>
    </div>
  )
}
