'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

interface Application {
  id: string
  employee_name: string
  application_type: string
  title: string
  description: string
  status: string
  created_at: string
  start_date?: string
  end_date?: string
  days?: number
  reason?: string
  symptoms?: string
  doctor_note?: boolean
  date?: string
  start_time?: string
  end_time?: string
  hours?: number
  project_name?: string
  approval_required?: boolean
  expense_date?: string
  amount?: string
  category?: string
  expense_item?: string
  receipt_file?: string
  receipt_attached?: boolean
  payment_method?: string
  urgency?: string
  parking_related?: boolean
  expense_salesperson?: string
  expense_site_type?: string
  expense_site_name?: string
  expense_site_address?: string
  expense_customer_name?: string
  expense_work_type?: string
}

export default function ApplicationDetail() {
  const params = useParams()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const id = typeof params?.id === 'string' ? params.id : ''
    if (id) {
      fetchApplication(id)
    }
  }, [params])

  const fetchApplication = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('internal_applications')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setApplication(data)
    } catch (error) {
      console.error('Error fetching application:', error)
      alert('申請の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!application) return
    
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('internal_applications')
        .update({ status: newStatus })
        .eq('id', application.id)

      if (error) throw error

      alert('ステータスを更新しました')
      fetchApplication(application.id)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('更新に失敗しました')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '承認待ち'
      case 'approved': return '承認済み'
      case 'rejected': return '却下'
      default: return '不明'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'paid_leave': return '有給申請'
      case 'sick_leave': return '病気休暇'
      case 'overtime': return '残業申請'
      case 'expense': return '経費申請'
      case 'other': return 'その他'
      default: return type
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'office_supplies': return '事務用品'
      case 'travel': return '出張費'
      case 'meals': return '会議・接待費'
      case 'equipment': return '備品・機器'
      case 'software': return 'ソフトウェア・ライセンス'
      case 'training': return '研修費'
      case 'gasoline': return 'ガソリン'
      case 'parking': return '駐車場'
      case 'other': return 'その他'
      default: return category
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'reimbursement': return '後払い（立替）'
      case 'company_card': return '会社カード'
      case 'advance_payment': return '事前支給'
      default: return method
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'low': return '低'
      case 'normal': return '通常'
      case 'high': return '高'
      case 'urgent': return '緊急'
      default: return urgency
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">申請が見つかりません</h1>
          <Link
            href="/admin/internal-applications"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            申請一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">申請詳細</h1>
              <p className="text-gray-600 mt-2">{getTypeText(application.application_type)}</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/internal-applications"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                申請一覧に戻る
              </Link>
            </div>
          </div>
        </div>

        {/* 申請情報 */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">基本情報</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">申請者:</span>
                  <span className="ml-2 text-gray-900">{application.employee_name}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">申請種別:</span>
                  <span className="ml-2 text-gray-900">{getTypeText(application.application_type)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">申請日時:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(application.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">ステータス:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">申請内容</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">タイトル:</span>
                  <span className="ml-2 text-gray-900">{application.title}</span>
                </div>
                {application.urgency && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">緊急度:</span>
                    <span className="ml-2 text-gray-900">{getUrgencyText(application.urgency)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 種別別の詳細情報 */}
          {application.application_type === 'paid_leave' || application.application_type === 'sick_leave' ? (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">休暇情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">開始日:</span>
                  <span className="ml-2 text-gray-900">
                    {application.start_date ? new Date(application.start_date).toLocaleDateString('ja-JP') : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">終了日:</span>
                  <span className="ml-2 text-gray-900">
                    {application.end_date ? new Date(application.end_date).toLocaleDateString('ja-JP') : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">日数:</span>
                  <span className="ml-2 text-gray-900">{application.days || '-'}日間</span>
                </div>
                {application.symptoms && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">症状・病名:</span>
                    <span className="ml-2 text-gray-900">{application.symptoms}</span>
                  </div>
                )}
              </div>
            </div>
          ) : application.application_type === 'overtime' ? (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">残業情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">残業日:</span>
                  <span className="ml-2 text-gray-900">
                    {application.date ? new Date(application.date).toLocaleDateString('ja-JP') : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">開始時間:</span>
                  <span className="ml-2 text-gray-900">{application.start_time || '-'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">終了時間:</span>
                  <span className="ml-2 text-gray-900">{application.end_time || '-'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">残業時間:</span>
                  <span className="ml-2 text-gray-900">{application.hours || '-'}時間</span>
                </div>
                {application.project_name && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">プロジェクト名:</span>
                    <span className="ml-2 text-gray-900">{application.project_name}</span>
                  </div>
                )}
              </div>
            </div>
          ) : application.application_type === 'expense' ? (
            <>
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">経費情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">経費発生日:</span>
                  <span className="ml-2 text-gray-900">
                    {application.expense_date ? new Date(application.expense_date).toLocaleDateString('ja-JP') : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">金額:</span>
                  <span className="ml-2 text-gray-900">¥{application.amount || '-'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">カテゴリ:</span>
                  <span className="ml-2 text-gray-900">{getCategoryText(application.category || '')}</span>
                </div>
                {application.expense_item && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">品目:</span>
                    <span className="ml-2 text-gray-900">{application.expense_item}</span>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">支払い方法:</span>
                  <span className="ml-2 text-gray-900">{getPaymentMethodText(application.payment_method || '')}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">レシート添付:</span>
                  <span className="ml-2 text-gray-900">{application.receipt_file ? 'あり' : 'なし'}</span>
                </div>
                {application.receipt_file && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-500">レシートファイル:</span>
                    <span className="ml-2 text-gray-900">{application.receipt_file}</span>
                  </div>
                )}
              </div>
            </div>
              {(application.parking_related ||
                application.expense_salesperson ||
                application.expense_site_name ||
                application.expense_site_address ||
                application.expense_customer_name ||
                application.expense_work_type) && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">現場情報</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-sm font-medium text-gray-500">駐車場関連:</span>
                      <span className="ml-2 text-gray-900">{application.parking_related ? 'はい' : 'いいえ'}</span>
                    </div>
                    {application.expense_salesperson && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">担当営業:</span>
                        <span className="ml-2 text-gray-900">{application.expense_salesperson}</span>
                      </div>
                    )}
                    {application.expense_work_type && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">作業種別:</span>
                        <span className="ml-2 text-gray-900">{application.expense_work_type}</span>
                      </div>
                    )}
                    {application.expense_site_type && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">現場種別:</span>
                        <span className="ml-2 text-gray-900">{application.expense_site_type}</span>
                      </div>
                    )}
                    {application.expense_site_name && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">現場名:</span>
                        <span className="ml-2 text-gray-900">{application.expense_site_name}</span>
                      </div>
                    )}
                    {application.expense_site_address && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-500">現場住所:</span>
                        <span className="ml-2 text-gray-900">{application.expense_site_address}</span>
                      </div>
                    )}
                    {application.expense_customer_name && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">お客様名:</span>
                        <span className="ml-2 text-gray-900">{application.expense_customer_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* 申請理由・詳細 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">申請理由・詳細</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">{application.reason || '-'}</p>
            </div>
          </div>

          {application.description && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">その他の詳細情報</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{application.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* ステータス更新 */}
        {application.status === 'pending' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">ステータス更新</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleStatusUpdate('approved')}
                disabled={updating}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {updating ? '更新中...' : '承認する'}
              </button>
              <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={updating}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {updating ? '更新中...' : '却下する'}
              </button>
            </div>
          </div>
        )}

        {/* アクション履歴 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">アクション履歴</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <span className="text-sm font-medium text-gray-900">申請作成</span>
                <span className="text-sm text-gray-500 ml-2">
                  {new Date(application.created_at).toLocaleString('ja-JP')}
                </span>
              </div>
            </div>
            {application.status !== 'pending' && (
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  application.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {application.status === 'approved' ? '承認' : '却下'}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date().toLocaleString('ja-JP')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
