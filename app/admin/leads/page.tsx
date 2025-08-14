// app/admin/leads/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Lead } from '@/types/lead'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    fetchLeads()
  }, [filter])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      if (error) throw error
      
      // ローカル状態を更新
      setLeads(leads.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: newStatus, updated_at: new Date().toISOString() }
          : lead
      ))
      
      // モーダルを閉じる
      setIsModalOpen(false)
      setSelectedLead(null)
      setStatusUpdate('')
      setNote('')
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  const addNote = async (leadId: string, noteContent: string) => {
    try {
      const lead = leads.find(l => l.id === leadId)
      if (!lead) return

      const currentNotes = lead.notes || []
      const newNote = {
        content: noteContent,
        created_at: new Date().toISOString(),
        created_by: 'admin' // 実際の実装では認証ユーザー情報を使用
      }

      const { error } = await supabase
        .from('leads')
        .update({ 
          notes: [...currentNotes, newNote],
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      if (error) throw error
      
      // ローカル状態を更新
      setLeads(leads.map(lead => 
        lead.id === leadId 
          ? { ...lead, notes: [...currentNotes, newNote], updated_at: new Date().toISOString() }
          : lead
      ))
      
      setNote('')
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  const filteredLeads = leads.filter(lead => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        lead.name.toLowerCase().includes(search) ||
        lead.email.toLowerCase().includes(search) ||
        lead.phone?.includes(search) ||
        lead.company?.toLowerCase().includes(search)
      )
    }
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800'
      case 'qualified':
        return 'bg-green-100 text-green-800'
      case 'proposal':
        return 'bg-purple-100 text-purple-800'
      case 'negotiation':
        return 'bg-orange-100 text-orange-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return '新規'
      case 'contacted':
        return '連絡済み'
      case 'qualified':
        return '見込みあり'
      case 'proposal':
        return '提案中'
      case 'negotiation':
        return '交渉中'
      case 'closed':
        return '成約/終了'
      default:
        return status
    }
  }

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'real_estate':
        return '不動産売買'
      case 'reform':
        return 'リフォーム'
      case 'consultation':
        return '相談'
      default:
        return type
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">リード管理</h1>
        <p className="text-gray-600">お問い合わせの管理と対応状況の確認</p>
      </div>

      {/* フィルターとサーチ */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="名前、メール、電話番号、会社名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="new">新規</option>
              <option value="contacted">連絡済み</option>
              <option value="qualified">見込みあり</option>
              <option value="proposal">提案中</option>
              <option value="negotiation">交渉中</option>
              <option value="closed">成約/終了</option>
            </select>
            <button
              onClick={fetchLeads}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              更新
            </button>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-1">総リード数</div>
          <div className="text-2xl font-bold text-gray-900">{leads.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-1">新規</div>
          <div className="text-2xl font-bold text-blue-600">
            {leads.filter(l => l.status === 'new').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-1">対応中</div>
          <div className="text-2xl font-bold text-yellow-600">
            {leads.filter(l => ['contacted', 'qualified', 'proposal', 'negotiation'].includes(l.status)).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-1">成約</div>
          <div className="text-2xl font-bold text-green-600">
            {leads.filter(l => l.status === 'closed').length}
          </div>
        </div>
      </div>

      {/* リード一覧 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            リードが見つかりません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    お客様情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    サービス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(lead.created_at), 'MM/dd HH:mm', { locale: ja })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{lead.name}</div>
                        <div className="text-gray-500">{lead.email}</div>
                        {lead.phone && <div className="text-gray-500">{lead.phone}</div>}
                        {lead.company && <div className="text-gray-500">{lead.company}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {getServiceTypeLabel(lead.service_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedLead(lead)
                          setIsModalOpen(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 詳細モーダル */}
      {isModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                リード詳細
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">名前</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">メール</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">電話番号</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.phone || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">会社名</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLead.company || '-'}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">メッセージ</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedLead.message}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">ステータス更新</label>
                <select
                  value={statusUpdate || selectedLead.status}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">新規</option>
                  <option value="contacted">連絡済み</option>
                  <option value="qualified">見込みあり</option>
                  <option value="proposal">提案中</option>
                  <option value="negotiation">交渉中</option>
                  <option value="closed">成約/終了</option>
                </select>
                <button
                  onClick={() => updateLeadStatus(selectedLead.id, statusUpdate || selectedLead.status)}
                  disabled={!statusUpdate || statusUpdate === selectedLead.status}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  ステータスを更新
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">メモ追加</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="対応内容や備考を記入..."
                />
                <button
                  onClick={() => addNote(selectedLead.id, note)}
                  disabled={!note.trim()}
                  className="mt-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  メモを追加
                </button>
              </div>

              {selectedLead.notes && selectedLead.notes.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">過去のメモ</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedLead.notes.map((note, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-900">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(note.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setSelectedLead(null)
                    setStatusUpdate('')
                    setNote('')
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
