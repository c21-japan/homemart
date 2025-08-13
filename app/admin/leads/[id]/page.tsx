'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CustomerLead, LeadType, LeadStatus, ChecklistType } from '@/types/leads'
import { getLead } from '@/lib/supabase/leads'
import { getAgreement } from '@/app/(secure)/actions/agreements'
import { getChecklist, updateChecklistItem, attachFileToChecklistItem } from '@/app/(secure)/actions/checklists'
import { formatCurrency } from '@/lib/utils/format'
import { 
  UserIcon, 
  HomeIcon, 
  DocumentTextIcon, 
  PhotoIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline'

export default function LeadDetailPage() {
  const params = useParams()
  const leadId = params.id as string
  
  const [lead, setLead] = useState<CustomerLead | null>(null)
  const [agreement, setAgreement] = useState<any>(null)
  const [checklists, setChecklists] = useState<any>({})
  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'agreement' | 'checklists'>('details')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchLeadData()
  }, [leadId])

  const fetchLeadData = async () => {
    try {
      setLoading(true)
      
      // 顧客情報を取得
      const leadData = await getLead(leadId)
      if (!leadData) {
        throw new Error('顧客情報が見つかりません')
      }
      setLead(leadData)

      // 媒介契約を取得（売却の場合）
      if (leadData.type === 'sell') {
        try {
          const agreementData = await getAgreement(leadId)
          setAgreement(agreementData)
        } catch (error) {
          console.log('媒介契約はまだ作成されていません')
        }
      }

      // チェックリストを取得
      await fetchChecklists(leadData)

    } catch (error) {
      console.error('Error fetching lead data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChecklists = async (leadData: CustomerLead) => {
    try {
      const checklistTypes: ChecklistType[] = []
      
      // 顧客タイプに基づいてチェックリスト種別を決定
      if (leadData.type === 'sell') {
        checklistTypes.push('seller')
      } else if (leadData.type === 'purchase') {
        checklistTypes.push('buyer')
      } else if (leadData.type === 'reform') {
        checklistTypes.push('reform')
      }

      // 各チェックリストを取得
      const checklistsData: any = {}
      for (const type of checklistTypes) {
        const result = await getChecklist(leadId, type)
        if (result.success) {
          checklistsData[type] = result.data
        }
      }
      
      setChecklists(checklistsData)
    } catch (error) {
      console.error('Error fetching checklists:', error)
    }
  }

  const handleChecklistItemToggle = async (checklistType: string, itemId: string, checked: boolean) => {
    try {
      const result = await updateChecklistItem(itemId, { checked })
      if (result.success) {
        // チェックリストを再取得
        await fetchChecklists(lead!)
      }
    } catch (error) {
      console.error('Error updating checklist item:', error)
    }
  }

  const handleFileUpload = async (checklistType: string, itemId: string, file: File) => {
    try {
      setUploading(prev => ({ ...prev, [itemId]: true }))
      
      const result = await attachFileToChecklistItem(itemId, file)
      if (result.success) {
        // チェックリストを再取得
        await fetchChecklists(lead!)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const getExtraSummary = (lead: CustomerLead) => {
    const extra = lead.extra
    switch (extra.type) {
      case 'purchase': return extra.budget ? `予算: ${formatCurrency(extra.budget)}` : '予算未定'
      case 'sell': return extra.expected_price ? `希望価格: ${formatCurrency(extra.expected_price)}` : '価格要相談'
      case 'reform': return extra.rough_budget ? `概算予算: ${formatCurrency(extra.rough_budget)}` : '予算要相談'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">顧客情報が見つかりません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {lead.last_name}{lead.first_name}様
                </h1>
                <p className="text-sm text-gray-600">
                  {lead.type === 'purchase' ? '購入' : lead.type === 'sell' ? '売却' : 'リフォーム'} - {lead.status}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              基本情報
            </button>
            {lead.type === 'sell' && (
              <button
                onClick={() => setActiveTab('photos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'photos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                写真管理
              </button>
            )}
            {lead.type === 'sell' && (
              <button
                onClick={() => setActiveTab('agreement')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'agreement'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                媒介契約
              </button>
            )}
            <button
              onClick={() => setActiveTab('checklists')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'checklists'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              チェックリスト
            </button>
          </nav>
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'details' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">基本情報</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">連絡先</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">電話:</span> {lead.phone || '未設定'}</p>
                    <p><span className="font-medium">メール:</span> {lead.email || '未設定'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">住所</h3>
                  <div className="space-y-2">
                    <p>{lead.prefecture} {lead.city}</p>
                    <p>{lead.address1} {lead.address2}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">詳細情報</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">用途別項目:</span> {getExtraSummary(lead)}</p>
                    <p><span className="font-medium">備考:</span> {lead.note || 'なし'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && lead.type === 'sell' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">写真管理</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">写真30枚の管理機能は別途実装予定です。</p>
            </div>
          </div>
        )}

        {activeTab === 'agreement' && lead.type === 'sell' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">媒介契約</h2>
            </div>
            <div className="px-6 py-4">
              {agreement ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><span className="font-medium">契約種別:</span> {agreement.contract_type}</p>
                      <p><span className="font-medium">締結日:</span> {agreement.signed_at}</p>
                      <p><span className="font-medium">レインズ登録期限:</span> {agreement.reins_required_by}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">次回報告日:</span> {agreement.next_report_date}</p>
                      <p><span className="font-medium">報告間隔:</span> {agreement.report_interval_days}日</p>
                      <p><span className="font-medium">ステータス:</span> {agreement.status}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">媒介契約はまだ作成されていません。</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'checklists' && (
          <div className="space-y-6">
            {Object.keys(checklists).length > 0 ? (
              Object.entries(checklists).map(([type, checklist]: [string, any]) => (
                <div key={type} className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900">
                        {type === 'seller' ? '売主用チェックリスト' : 
                         type === 'buyer' ? '買主用チェックリスト' : 'リフォーム用チェックリスト'}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          進捗: {checklist.completed_items}/{checklist.total_items}
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${checklist.progress_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {checklist.progress_percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-3">
                      {checklist.items?.map((item: any) => (
                        <div key={item.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                          <button
                            onClick={() => handleChecklistItemToggle(type, item.id, !item.checked)}
                            className={`mt-1 flex-shrink-0 ${
                              item.checked 
                                ? 'text-green-600 hover:text-green-700' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {item.checked ? (
                              <CheckCircleIcon className="h-5 w-5" />
                            ) : (
                              <XCircleIcon className="h-5 w-5" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${
                                item.checked ? 'text-gray-900 line-through' : 'text-gray-900'
                              }`}>
                                {item.label}
                              </span>
                              {item.required && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  必須
                                </span>
                              )}
                            </div>
                            {item.checked && item.completed_at && (
                              <p className="text-xs text-gray-500 mt-1">
                                完了日: {new Date(item.completed_at).toLocaleDateString('ja-JP')}
                              </p>
                            )}
                            {item.note && (
                              <p className="text-sm text-gray-600 mt-1">{item.note}</p>
                            )}
                            {item.file_path && (
                              <div className="flex items-center space-x-2 mt-2">
                                <DocumentArrowUpIcon className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600">ファイル添付済み</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <input
                              type="file"
                              id={`file-${item.id}`}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleFileUpload(type, item.id, file)
                                }
                              }}
                            />
                            <label
                              htmlFor={`file-${item.id}`}
                              className={`inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${
                                uploading[item.id]
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
                              }`}
                            >
                              {uploading[item.id] ? 'アップロード中...' : 'ファイル添付'}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4">
                  <p className="text-gray-600">チェックリストはまだ作成されていません。</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
