'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function OvertimeForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    employee_name: '',
    date: '',
    start_time: '',
    end_time: '',
    hours: 0,
    reason: '',
    title: '',
    project_name: '',
    approval_required: true
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    // 時間計算
    if (name === 'start_time' || name === 'end_time') {
      if (formData.start_time && formData.end_time) {
        const start = new Date(`2000-01-01T${formData.start_time}`)
        const end = new Date(`2000-01-01T${formData.end_time}`)
        const diffTime = end.getTime() - start.getTime()
        const diffHours = Math.round((diffTime / (1000 * 60 * 60)) * 100) / 100
        setFormData(prev => ({
          ...prev,
          hours: diffHours > 0 ? diffHours : 0
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('internal_applications')
        .insert({
          ...formData,
          application_type: 'overtime',
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      alert('残業申請を送信しました')
      router.push('/admin/internal-applications')
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('申請の送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-yellow-800">残業申請フォーム</h1>
              <p className="text-gray-600 mt-2">残業時間の申請を行います</p>
            </div>
            <Link
              href="/admin/internal-applications"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              申請一覧に戻る
            </Link>
          </div>
        </div>

        {/* 申請フォーム */}
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  申請者名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="employee_name"
                  value={formData.employee_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="山田太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  申請タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="プロジェクト完了のための残業申請"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  残業日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プロジェクト名
                </label>
                <input
                  type="text"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Webサイトリニューアル"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始時間 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <p className="text-sm text-gray-500 mt-1">通常勤務終了後の時間を入力</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了時間 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  required
                  min={formData.start_time}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <p className="text-sm text-gray-500 mt-1">残業終了予定時刻を入力</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  残業時間
                </label>
                <input
                  type="number"
                  name="hours"
                  value={formData.hours}
                  onChange={handleInputChange}
                  min="0"
                  max="12"
                  step="0.5"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  readOnly
                />
                <p className="text-sm text-gray-500 mt-1">開始時間と終了時間から自動計算されます</p>
              </div>

              <div className="flex items-end">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full">
                  <p className="text-sm text-yellow-800">
                    <strong>申請残業時間:</strong> {formData.hours}時間
                  </p>
                  {formData.date && (
                    <p className="text-xs text-yellow-600 mt-1">
                      {new Date(formData.date).toLocaleDateString('ja-JP')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                残業理由 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="プロジェクトの納期が迫っているため、品質を確保するために残業が必要です。具体的な作業内容と完了予定時刻を記載してください。"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="approval_required"
                id="approval_required"
                checked={formData.approval_required}
                onChange={handleInputChange}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <label htmlFor="approval_required" className="ml-2 block text-sm text-gray-900">
                事前承認が必要な残業である
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Link
                href="/admin/internal-applications"
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-600 text-white px-8 py-3 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '送信中...' : '申請を送信'}
              </button>
            </div>
          </form>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">残業申請時の注意事項</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 残業は事前申請が原則です（緊急時を除く）</li>
            <li>• 月間の残業時間上限は60時間です</li>
            <li>• 深夜残業（22:00以降）は別途申請が必要です</li>
            <li>• 残業申請は承認後、実施してください</li>
            <li>• 残業実施後は、実際の時間を報告してください</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
