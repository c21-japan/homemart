'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ExpenseForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    employee_name: '',
    title: '',
    expense_date: '',
    amount: '',
    category: '',
    description: '',
    receipt_attached: false,
    payment_method: 'reimbursement',
    urgency: 'normal'
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('internal_applications')
        .insert({
          ...formData,
          application_type: 'expense',
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      alert('経費申請を送信しました')
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
              <h1 className="text-3xl font-bold text-green-800">経費申請フォーム</h1>
              <p className="text-gray-600 mt-2">経費の申請を行います</p>
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="会議用備品購入費"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  経費発生日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="expense_date"
                  value={formData.expense_date}
                  onChange={handleInputChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  金額 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="1"
                    className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="1000"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-500">¥</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  経費カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">カテゴリを選択</option>
                  <option value="office_supplies">事務用品</option>
                  <option value="travel">出張費</option>
                  <option value="meals">会議・接待費</option>
                  <option value="equipment">備品・機器</option>
                  <option value="software">ソフトウェア・ライセンス</option>
                  <option value="training">研修費</option>
                  <option value="other">その他</option>
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="low">低</option>
                  <option value="normal">通常</option>
                  <option value="high">高</option>
                  <option value="urgent">緊急</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                経費の詳細 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="購入した物品の詳細、用途、必要性などを具体的に記載してください。"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  支払い方法
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="reimbursement">後払い（立替）</option>
                  <option value="company_card">会社カード</option>
                  <option value="advance_payment">事前支給</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="receipt_attached"
                  id="receipt_attached"
                  checked={formData.receipt_attached}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="receipt_attached" className="ml-2 block text-sm text-gray-900">
                  レシート・領収書を添付する
                </label>
              </div>
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
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '送信中...' : '申請を送信'}
              </button>
            </div>
          </form>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-800 mb-2">経費申請時の注意事項</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 経費申請は事前承認が原則です（緊急時を除く）</li>
            <li>• レシート・領収書は必ず保管し、申請時に添付してください</li>
            <li>• 個人使用目的の経費は申請できません</li>
            <li>• 高額な経費（5万円以上）は事前に上司の承認が必要です</li>
            <li>• 経費申請は承認後、支払い処理が行われます</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
