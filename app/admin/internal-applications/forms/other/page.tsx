'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function OtherApplicationForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    employee_name: '',
    title: '',
    application_type: '',
    description: '',
    urgency: 'normal',
    start_date: '',
    end_date: '',
    amount: '',
    reason: ''
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('internal_applications')
        .insert({
          ...formData,
          application_type: 'other',
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      alert('申請を送信しました')
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
              <h1 className="text-3xl font-bold text-purple-800">その他申請フォーム</h1>
              <p className="text-gray-600 mt-2">その他の申請を行います</p>
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="研修参加申請"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  申請種別 <span className="text-red-500">*</span>
                </label>
                <select
                  name="application_type"
                  value={formData.application_type}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">種別を選択</option>
                  <option value="training">研修・セミナー参加</option>
                  <option value="certification">資格取得</option>
                  <option value="equipment_request">備品・機器の要求</option>
                  <option value="facility_use">施設利用</option>
                  <option value="policy_change">制度・ルール変更提案</option>
                  <option value="work_environment">労働環境改善</option>
                  <option value="other_request">その他の要求</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  緊急度
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">低</option>
                  <option value="normal">通常</option>
                  <option value="high">高</option>
                  <option value="urgent">緊急</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始日
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-500 mt-1">該当する場合のみ入力</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了日
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  min={formData.start_date}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-500 mt-1">該当する場合のみ入力</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                金額
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
                <span className="absolute left-3 top-2.5 text-gray-500">¥</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">該当する場合のみ入力</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                申請理由・詳細 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="申請の理由、必要性、期待される効果などを具体的に記載してください。"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                その他の詳細情報
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="補足情報、添付書類の有無、連絡先など"
              />
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
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '送信中...' : '申請を送信'}
              </button>
            </div>
          </form>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-purple-800 mb-2">その他申請時の注意事項</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• 申請内容は具体的かつ明確に記載してください</li>
            <li>• 必要に応じて関連書類を添付してください</li>
            <li>• 申請は承認待ちの状態で送信されます</li>
            <li>• 緊急の場合は、直接上司に相談してください</li>
            <li>• 申請内容によっては追加の情報が必要になる場合があります</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
