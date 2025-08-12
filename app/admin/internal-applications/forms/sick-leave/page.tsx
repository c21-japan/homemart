'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SickLeaveForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    employee_name: '',
    start_date: '',
    end_date: '',
    days: 1,
    reason: '',
    title: '',
    doctor_note: false,
    symptoms: ''
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

    // 日数計算
    if (name === 'start_date' || name === 'end_date') {
      if (formData.start_date && formData.end_date) {
        const start = new Date(formData.start_date)
        const end = new Date(formData.end_date)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        setFormData(prev => ({
          ...prev,
          days: diffDays > 0 ? diffDays : 1
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
          application_type: 'sick_leave',
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      alert('病気休暇申請を送信しました')
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
              <h1 className="text-3xl font-bold text-red-800">病気休暇申請フォーム</h1>
              <p className="text-gray-600 mt-2">病気休暇の申請を行います</p>
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="風邪による病気休暇申請"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-sm text-gray-500 mt-1">病気休暇の開始日を入力してください</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-sm text-gray-500 mt-1">病気休暇の終了予定日を入力してください</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  日数
                </label>
                <input
                  type="number"
                  name="days"
                  value={formData.days}
                  onChange={handleInputChange}
                  min="1"
                  max="30"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  readOnly
                />
                <p className="text-sm text-gray-500 mt-1">開始日と終了日から自動計算されます</p>
              </div>

              <div className="flex items-end">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
                  <p className="text-sm text-red-800">
                    <strong>申請日数:</strong> {formData.days}日間
                  </p>
                  {formData.start_date && formData.end_date && (
                    <p className="text-xs text-red-600 mt-1">
                      {new Date(formData.start_date).toLocaleDateString('ja-JP')} 〜 {new Date(formData.end_date).toLocaleDateString('ja-JP')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                症状・病名 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="発熱、咳、倦怠感など具体的な症状を記載してください"
              />
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="病気の詳細、医師の指示、回復の見込みなどを記載してください"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="doctor_note"
                id="doctor_note"
                checked={formData.doctor_note}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="doctor_note" className="ml-2 block text-sm text-gray-900">
                医師の診断書を添付する
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
                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '送信中...' : '申請を送信'}
              </button>
            </div>
          </form>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">病気休暇申請時の注意事項</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• 病気休暇は医師の診断書が必要な場合があります</li>
            <li>• 申請は承認待ちの状態で送信されます</li>
            <li>• 緊急の場合は、直接上司に連絡してください</li>
            <li>• 回復後は速やかに出社し、人事部に報告してください</li>
            <li>• 長期の病気休暇の場合は、定期的な状況報告が必要です</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
