import { supabase } from '@/lib/supabase'
import { LeadType, LeadStatus } from '@/types/leads'

// 型を再エクスポート
export type { LeadType, LeadStatus }

export interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  lead_type: LeadType
  status: LeadStatus
  source?: string
  budget_min?: number
  budget_max?: number
  preferred_area?: string
  property_type?: string
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  notes?: string
  assigned_staff?: string
  next_action?: string
  next_action_date?: string
  created_at: string
  updated_at: string
}

export interface LeadHistory {
  id: string
  lead_id: string
  action_type: 'call' | 'email' | 'meeting' | 'visit' | 'proposal' | 'other'
  action_date: string
  summary: string
  details?: string
  next_action?: string
  next_action_date?: string
  created_by?: string
  created_at: string
}

export interface LeadAttachment {
  id: string
  lead_id: string
  file_name: string
  file_path: string
  file_type?: string
  file_size?: number
  description?: string
  uploaded_at: string
  uploaded_by?: string
}

// リード一覧を取得
export async function getLeads(filters?: {
  status?: LeadStatus
  lead_type?: LeadType
  assigned_staff?: string
  urgency?: string
}) {
  try {
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.lead_type) {
      query = query.eq('lead_type', filters.lead_type)
    }
    if (filters?.assigned_staff) {
      query = query.eq('assigned_staff', filters.assigned_staff)
    }
    if (filters?.urgency) {
      query = query.eq('urgency', filters.urgency)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching leads:', error)
    throw error
  }
}

// リード詳細を取得
export async function getLead(id: string) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching lead:', error)
    throw error
  }
}

// リード履歴を取得
export async function getLeadHistory(leadId: string) {
  try {
    const { data, error } = await supabase
      .from('lead_history')
      .select('*')
      .eq('lead_id', leadId)
      .order('action_date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching lead history:', error)
    throw error
  }
}

// リード添付ファイルを取得
export async function getLeadAttachments(leadId: string) {
  try {
    const { data, error } = await supabase
      .from('lead_attachments')
      .select('*')
      .eq('lead_id', leadId)
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching lead attachments:', error)
    throw error
  }
}

// リードを作成
export async function createLead(leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating lead:', error)
    throw error
  }
}

// リードを更新
export async function updateLead(id: string, updates: Partial<Lead>) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating lead:', error)
    throw error
  }
}

// リードを削除
export async function deleteLead(id: string) {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting lead:', error)
    throw error
  }
}

// リード履歴を追加
export async function addLeadHistory(historyData: Omit<LeadHistory, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('lead_history')
      .insert([historyData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding lead history:', error)
    throw error
  }
}

// リード添付ファイルを追加
export async function addLeadAttachment(attachmentData: Omit<LeadAttachment, 'id' | 'uploaded_at'>) {
  try {
    const { data, error } = await supabase
      .from('lead_attachments')
      .insert([attachmentData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding lead attachment:', error)
    throw error
  }
}

// リード統計を取得
export async function getLeadStats() {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status, lead_type, urgency')

    if (error) throw error

    const stats = {
      total: leads?.length || 0,
      byStatus: {
        new: leads?.filter(l => l.status === 'new').length || 0,
        in_progress: leads?.filter(l => l.status === 'in_progress').length || 0,
        won: leads?.filter(l => l.status === 'won').length || 0,
        lost: leads?.filter(l => l.status === 'lost').length || 0
      },
      byType: {
        purchase: leads?.filter(l => l.lead_type === 'purchase').length || 0,
        sell: leads?.filter(l => l.lead_type === 'sell').length || 0,
        reform: leads?.filter(l => l.lead_type === 'reform').length || 0
      },
      byUrgency: {
        urgent: leads?.filter(l => l.urgency === 'urgent').length || 0,
        high: leads?.filter(l => l.urgency === 'high').length || 0,
        normal: leads?.filter(l => l.urgency === 'normal').length || 0,
        low: leads?.filter(l => l.urgency === 'low').length || 0
      }
    }

    return stats
  } catch (error) {
    console.error('Error fetching lead stats:', error)
    throw error
  }
}
