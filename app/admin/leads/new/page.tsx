'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createLead } from '@/lib/supabase/leads'
import { LeadType, LeadStatus } from '@/types/leads'

export default function NewLead() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    lead_type: 'purchase' as LeadType,
    status: 'new' as LeadStatus,
    source: '',
    budget_min: '',
    budget_max: '',
    preferred_area: '',
    property_type: '',
    urgency: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    notes: '',
    assigned_staff: '',
    next_action: '',
    next_action_date: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '顧客名は必須です'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }

    if (formData.phone && !/^[0-9-+\s()]+$/.test(formData.phone)) {
      newErrors.phone = '有効な電話番号を入力してください'
    }

    if (formData.budget_min && formData.budget_max && 
        parseInt(formData.budget_min) > parseInt(formData.budget_max)) {
      newErrors.budget_max = '予算上限は予算下限より大きい値を入力してください'
    }

    if (formData.next_action_date && new Date(formData.next_action_date) < new Date()) {
      newErrors.next_action_date = '次のアクション予定日は今日以降の日付を入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const leadData = {
        ...formData,
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : undefined,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : undefined
      }

      await createLead(leadData)
      alert('顧客情報を登録しました')
      router.push('/admin/leads')
    } catch (error) {
      console.error('Error creating lead:', error)
      alert('顧客情報の登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ paddingTop: 'var(--header-height, 0px)' }}>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/leads" className="text-blue-600 hover:underline">
              ← 顧客情報管理
            </Link>
            <h1 className="text-2xl font-bold">新規顧客登録</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本情報 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    顧客名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="田中太郎"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="tanaka@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="090-1234-5678"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                    リード獲得元
                  </label>
                  <input
                    type="text"
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Webサイト、紹介、DM等"
                  />
                </div>
              </div>
            </div>

            {/* リード情報 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">リード情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="lead_type" className="block text-sm font-medium text-gray-700 mb-2">
                    種別 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="lead_type"
                    name="lead_type"
                    value={formData.lead_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="purchase">購入</option>
                    <option value="sell">売却</option>
                    <option value="reform">リフォーム</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    ステータス <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">新規</option>
                    <option value="in_progress">進行中</option>
                    <option value="won">成約</option>
                    <option value="lost">失注</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                    緊急度
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">低</option>
                    <option value="normal">普通</option>
                    <option value="high">高</option>
                    <option value="urgent">緊急</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="assigned_staff" className="block text-sm font-medium text-gray-700 mb-2">
                    担当者
                  </label>
                  <input
                    type="text"
                    id="assigned_staff"
                    name="assigned_staff"
                    value={formData.assigned_staff}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="担当者名"
                  />
                </div>
              </div>
            </div>

            {/* 物件・予算情報 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">物件・予算情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="preferred_area" className="block text-sm font-medium text-gray-700 mb-2">
                    希望エリア
                  </label>
                  <input
                    type="text"
                    id="preferred_area"
                    name="preferred_area"
                    value={formData.preferred_area}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="奈良市、生駒市等"
                  />
                </div>

                <div>
                  <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-2">
                    希望物件種別
                  </label>
                  <input
                    type="text"
                    id="property_type"
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="マンション、一戸建て、土地等"
                  />
                </div>

                <div>
                  <label htmlFor="budget_min" className="block text-sm font-medium text-gray-700 mb-2">
                    予算下限
                  </label>
                  <input
                    type="number"
                    id="budget_min"
                    name="budget_min"
                    value={formData.budget_min}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30000000"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="budget_max" className="block text-sm font-medium text-gray-700 mb-2">
                    予算上限
                  </label>
                  <input
                    type="number"
                    id="budget_max"
                    name="budget_max"
                    value={formData.budget_max}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.budget_max ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="50000000"
                    min="0"
                  />
                  {errors.budget_max && <p className="mt-1 text-sm text-red-600">{errors.budget_max}</p>}
                </div>
              </div>
            </div>

            {/* アクション情報 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">アクション情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="next_action" className="block text-sm font-medium text-gray-700 mb-2">
                    次のアクション
                  </label>
                  <input
                    type="text"
                    id="next_action"
                    name="next_action"
                    value={formData.next_action}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="物件情報の送付、現地調査等"
                  />
                </div>

                <div>
                  <label htmlFor="next_action_date" className="block text-sm font-medium text-gray-700 mb-2">
                    次のアクション予定日
                  </label>
                  <input
                    type="date"
                    id="next_action_date"
                    name="next_action_date"
                    value={formData.next_action_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.next_action_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.next_action_date && <p className="mt-1 text-sm text-red-600">{errors.next_action_date}</p>}
                </div>
              </div>
            </div>

            {/* 備考 */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                備考・詳細
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="顧客の希望条件や詳細な要望等を記入してください"
              />
            </div>

            {/* ボタン */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link
                href="/admin/leads"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '登録中...' : '登録'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
