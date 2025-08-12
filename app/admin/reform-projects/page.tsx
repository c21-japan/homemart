'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import ImageUpload from '@/components/ImageUpload'

interface ReformProject {
  id: string
  title: string
  before_image_url: string
  after_image_url: string
  description?: string
  created_at: string
}

export default function ReformProjectsPage() {
  const [projects, setProjects] = useState<ReformProject[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<ReformProject | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    before_image_url: '',
    after_image_url: ''
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reform_projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      // エラーが発生しても空配列を設定して処理を続行
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleBeforeImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, before_image_url: url }))
  }

  const handleAfterImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, after_image_url: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.before_image_url.trim() || !formData.after_image_url.trim()) {
      alert('タイトル、施工前画像、施工後画像は必須です')
      return
    }

    try {
      setUploading(true)
      
      if (editingProject) {
        // 編集
        const { error } = await supabase
          .from('reform_projects')
          .update({
            title: formData.title,
            description: formData.description,
            before_image_url: formData.before_image_url,
            after_image_url: formData.after_image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProject.id)

        if (error) throw error
        alert('施工実績を更新しました')
      } else {
        // 新規作成
        const { error } = await supabase
          .from('reform_projects')
          .insert([{
            title: formData.title,
            description: formData.description,
            before_image_url: formData.before_image_url,
            after_image_url: formData.after_image_url
          }])

        if (error) throw error
        alert('施工実績を追加しました')
      }

      setShowModal(false)
      setEditingProject(null)
      setFormData({ title: '', description: '', before_image_url: '', after_image_url: '' })
      fetchProjects()
    } catch (error) {
      console.error('Error saving project:', error)
      alert('保存に失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (project: ReformProject) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description || '',
      before_image_url: project.before_image_url,
      after_image_url: project.after_image_url
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この施工実績を削除してもよろしいですか？')) return

    try {
      const { error } = await supabase
        .from('reform_projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('施工実績を削除しました')
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('削除に失敗しました')
    }
  }

  const openNewModal = () => {
    setEditingProject(null)
    setFormData({ title: '', description: '', before_image_url: '', after_image_url: '' })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProject(null)
    setFormData({ title: '', description: '', before_image_url: '', after_image_url: '' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">施工実績管理</h1>
              <p className="text-gray-600 mt-2">リフォーム施工実績の管理（施工前後比較）</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={openNewModal}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold"
              >
                新規追加
              </button>
              <Link
                href="/admin"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ダッシュボードに戻る
              </Link>
            </div>
          </div>
        </div>

        {/* 施工実績一覧 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">施工実績一覧</h2>
          </div>
          <div className="p-6">
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {/* 施工前後の画像を横並びで表示 */}
                    <div className="grid grid-cols-2 gap-1">
                      <div className="relative h-32">
                        <Image
                          src={project.before_image_url}
                          alt={`${project.title} - 施工前`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          施工前
                        </div>
                      </div>
                      <div className="relative h-32">
                        <Image
                          src={project.after_image_url}
                          alt={`${project.title} - 施工後`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          施工後
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">施工実績がありません</p>
                <button
                  onClick={openNewModal}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  最初の施工実績を追加
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProject ? '施工実績を編集' : '新規施工実績を追加'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: キッチンリフォーム"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="施工内容の詳細を入力してください"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    施工前画像 *
                  </label>
                  {formData.before_image_url ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Image
                          src={formData.before_image_url}
                          alt="施工前プレビュー"
                          width={200}
                          height={150}
                          className="rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, before_image_url: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">画像を変更する場合は、新しい画像をアップロードしてください</p>
                    </div>
                  ) : (
                    <div>
                      <ImageUpload onImageUploaded={handleBeforeImageUploaded} />
                      <p className="text-xs text-gray-500 mt-1">
                        画像アップロードに問題がある場合は、管理者に連絡してください
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    施工後画像 *
                  </label>
                  {formData.after_image_url ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Image
                          src={formData.after_image_url}
                          alt="施工後プレビュー"
                          width={200}
                          height={150}
                          className="rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, after_image_url: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">画像を変更する場合は、新しい画像をアップロードしてください</p>
                    </div>
                  ) : (
                    <div>
                      <ImageUpload onImageUploaded={handleAfterImageUploaded} />
                      <p className="text-xs text-gray-500 mt-1">
                        画像アップロードに問題がある場合は、管理者に連絡してください
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? '処理中...' : (editingProject ? '更新' : '追加')}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
