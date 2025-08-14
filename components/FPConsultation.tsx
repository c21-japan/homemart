'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface FPConsultationProps {
  inquiryId: number
  initialData?: any
  onUpdate?: (data: any) => void
}

interface FPData {
  consultationDate?: string
  consultation_topics?: string[]
  financial_goals?: string[]
  monthly_income?: number
  monthly_expenses?: number
  current_savings?: number
  loan_amount?: number
  loan_terms?: number
  fp_notes?: string
  fp_status?: 'pending' | 'scheduled' | 'completed' | 'cancelled'
}

export default function FPConsultation({ inquiryId, initialData, onUpdate }: FPConsultationProps) {
  const [fpData, setFpData] = useState<FPData>(initialData || {})
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const supabase = createBrowserClient(
    'https://avydevqmfgbdpbexcxec.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2eWRldnFtZmdiZHBiZXhjeGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzcwODMsImV4cCI6MjA3MDQxMzA4M30.XlNY0lMEL-9YepN2WZnkRRuwQ8KBpV7aTaOF_eXVYhQ'
  )

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({
          fp_consultation_requested: true,
          fp_info: fpData,
          fp_consultation_date: fpData.consultationDate,
          fp_status: fpData.fp_status || 'pending'
        })
        .eq('id', inquiryId)

      if (error) throw error
      
      alert('FP相談情報を保存しました')
      onUpdate?.(fpData)
    } catch (error) {
      console.error('Error:', error)
      alert('保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (status: FPData['fp_status']) => {
    setFpData(prev => ({ ...prev, fp_status: status }))
  }

  return (
    <div className="bg-white rounded-lg shadow border">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">FP相談情報</h3>
          <div className="flex items-center space-x-3">
            {fpData.fp_status && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                fpData.fp_status === 'completed' ? 'bg-green-100 text-green-800' :
                fpData.fp_status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                fpData.fp_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {fpData.fp_status === 'pending' ? '相談待ち' :
                 fpData.fp_status === 'scheduled' ? '相談予定' :
                 fpData.fp_status === 'completed' ? '相談完了' :
                 '相談キャンセル'}
              </span>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {isExpanded ? '閉じる' : '詳細表示'}
            </button>
          </div>
        </div>
      </div>

      {/* 基本情報（常に表示） */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              相談希望日時
            </label>
            <input
              type="datetime-local"
              value={fpData.consultationDate || ''}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFpData({...fpData, consultationDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ステータス
            </label>
            <select
              value={fpData.fp_status || 'pending'}
              onChange={(e) => handleStatusChange(e.target.value as FPData['fp_status'])}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">相談待ち</option>
              <option value="scheduled">相談予定</option>
              <option value="completed">相談完了</option>
              <option value="cancelled">相談キャンセル</option>
            </select>
          </div>
        </div>
      </div>

      {/* 詳細情報（折りたたみ可能） */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 space-y-6">
          {/* 相談内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              相談内容（複数選択可）
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['住宅ローン', '生命保険見直し', '資産運用', 'ライフプラン', '老後資金準備', '教育資金準備'].map(topic => (
                <label key={topic} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={fpData.consultation_topics?.includes(topic) || false}
                    className="mr-2"
                    onChange={(e) => {
                      const topics = fpData.consultation_topics || []
                      if (e.target.checked) {
                        setFpData({...fpData, consultation_topics: [...topics, topic]})
                      } else {
                        setFpData({...fpData, consultation_topics: topics.filter(t => t !== topic)})
                      }
                    }}
                  />
                  {topic}
                </label>
              ))}
            </div>
          </div>

          {/* 金融目標 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              金融目標（複数選択可）
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['住宅購入', '老後資金準備', '教育資金準備', '資産運用', '保険見直し', '債務整理'].map(goal => (
                <label key={goal} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={fpData.financial_goals?.includes(goal) || false}
                    className="mr-2"
                    onChange={(e) => {
                      const goals = fpData.financial_goals || []
                      if (e.target.checked) {
                        setFpData({...fpData, financial_goals: [...goals, goal]})
                      } else {
                        setFpData({...fpData, financial_goals: goals.filter(g => g !== goal)})
                      }
                    }}
                  />
                  {goal}
                </label>
              ))}
            </div>
          </div>

          {/* 収支・資産情報 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                月収（円）
              </label>
              <input
                type="number"
                value={fpData.monthly_income || ''}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFpData({...fpData, monthly_income: Number(e.target.value)})}
                placeholder="500000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                月支出（円）
              </label>
              <input
                type="number"
                value={fpData.monthly_expenses || ''}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFpData({...fpData, monthly_expenses: Number(e.target.value)})}
                placeholder="300000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                現在の貯蓄（円）
              </label>
              <input
                type="number"
                value={fpData.current_savings || ''}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFpData({...fpData, current_savings: Number(e.target.value)})}
                placeholder="10000000"
              />
            </div>
          </div>

          {/* ローン情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                希望ローン金額（円）
              </label>
              <input
                type="number"
                value={fpData.loan_amount || ''}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFpData({...fpData, loan_amount: Number(e.target.value)})}
                placeholder="30000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                希望ローン期間（年）
              </label>
              <input
                type="number"
                value={fpData.loan_terms || ''}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFpData({...fpData, loan_terms: Number(e.target.value)})}
                placeholder="35"
                min="1"
                max="50"
              />
            </div>
          </div>

          {/* 備考 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FP担当者からの備考
            </label>
            <textarea
              value={fpData.fp_notes || ''}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFpData({...fpData, fp_notes: e.target.value})}
              placeholder="相談内容や注意事項などを記入してください"
            />
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {isExpanded ? '詳細を閉じる' : '詳細を表示'}
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}
