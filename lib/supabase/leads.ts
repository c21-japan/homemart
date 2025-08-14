import { supabase } from '@/lib/supabase'
import { 
  CustomerLead, 
  LeadType, 
  LeadStatus, 
  LeadFilter, 
  LeadStats,
  createLeadSchema,
  updateLeadSchema,
  LeadHistory
} from '@/types/leads'

// 型を再エクスポート
export type { LeadType, LeadStatus, CustomerLead }

// リード一覧を取得
export async function getLeads(filters?: LeadFilter & { page?: number; limit?: number }): Promise<{ data: CustomerLead[]; error: any; count: number | null }> {
  try {
    let query = supabase
      .from('customer_leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by)
    }
    if (filters?.month) {
      const [year, month] = filters.month.split('-')
      query = query.gte('created_at', `${year}-${month}-01`)
      query = query.lt('created_at', `${year}-${parseInt(month) + 1}-01`)
    }
    if (filters?.search) {
      query = query.or(`last_name.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,extra->>building_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
    }

    // ページネーション
    if (filters?.page && filters?.limit) {
      const offset = (filters.page - 1) * filters.limit
      query = query.range(offset, offset + filters.limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      return { data: [], error, count: null }
    }

    return { data: data || [], error: null, count: count || 0 }
  } catch (error) {
    console.error('Error fetching leads:', error)
    return { data: [], error, count: null }
  }
}

// リード詳細を取得
export async function getLead(id: string): Promise<CustomerLead | null> {
  try {
    const { data, error } = await supabase
      .from('customer_leads')
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
      .order('created_at', { ascending: false })

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
      .from('customer_leads')
      .select('attachments')
      .eq('id', leadId)
      .single()

    if (error) throw error
    return data?.attachments || []
  } catch (error) {
    console.error('Error fetching lead attachments:', error)
    throw error
  }
}

// リードを作成
export async function createLead(leadData: any): Promise<CustomerLead> {
  try {
    // バリデーション
    const validatedData = createLeadSchema.parse(leadData)

    const { data, error } = await supabase
      .from('customer_leads')
      .insert([validatedData])
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
export async function updateLead(id: string, updates: any): Promise<CustomerLead> {
  try {
    // バリデーション
    const validatedData = updateLeadSchema.parse({ id, ...updates })

    const { data, error } = await supabase
      .from('customer_leads')
      .update(validatedData)
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
export async function deleteLead(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('customer_leads')
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
export async function addLeadAttachment(leadId: string, filePath: string): Promise<CustomerLead> {
  try {
    // 現在の添付ファイルを取得
    const { data: currentLead } = await supabase
      .from('customer_leads')
      .select('attachments')
      .eq('id', leadId)
      .single()

    if (!currentLead) {
      throw new Error('リードが見つかりません')
    }

    const currentAttachments = currentLead.attachments || []
    const newAttachments = [...currentAttachments, filePath]

    const { data, error } = await supabase
      .from('customer_leads')
      .update({ attachments: newAttachments })
      .eq('id', leadId)
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
export async function getLeadStats(): Promise<LeadStats> {
  try {
    const { data: leads, error } = await supabase
      .from('customer_leads')
      .select('type, status, created_at')

    if (error) throw error

    const stats: LeadStats = {
      total: leads?.length || 0,
      byStatus: {
        new: 0,
        in_progress: 0,
        won: 0,
        lost: 0
      },
      byType: {
        purchase: 0,
        sell: 0,
        reform: 0
      },
      byMonth: {}
    }

    leads?.forEach(lead => {
      // ステータス別カウント
      stats.byStatus[lead.status as LeadStatus]++
      
      // 種別別カウント
      stats.byType[lead.type as LeadType]++
      
      // 月別カウント
      const month = lead.created_at.substring(0, 7) // YYYY-MM
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1
    })

    return stats
  } catch (error) {
    console.error('Error fetching lead stats:', error)
    throw error
  }
}

// 担当者をアサイン
export async function assignLead(leadId: string, userId: string): Promise<CustomerLead> {
  try {
    const { data, error } = await supabase
      .from('customer_leads')
      .update({ assigned_to: userId })
      .eq('id', leadId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error assigning lead:', error)
    throw error
  }
}

// ステータスを更新
export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<CustomerLead> {
  try {
    const { data, error } = await supabase
      .from('customer_leads')
      .update({ status })
      .eq('id', leadId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating lead status:', error)
    throw error
  }
}

// 添付ファイルを削除
export async function removeLeadAttachment(leadId: string, filePath: string): Promise<CustomerLead> {
  try {
    // 現在の添付ファイルを取得
    const { data: currentLead } = await supabase
      .from('customer_leads')
      .select('attachments')
      .eq('id', leadId)
      .single()

    if (!currentLead) {
      throw new Error('リードが見つかりません')
    }

    const currentAttachments = currentLead.attachments || []
    const newAttachments = currentAttachments.filter((path: string) => path !== filePath)

    const { data, error } = await supabase
      .from('customer_leads')
      .update({ attachments: newAttachments })
      .eq('id', leadId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error removing lead attachment:', error)
    throw error
  }
}

// FP情報を更新
export async function updateFPInfo(leadId: string, fpInfo: any): Promise<CustomerLead> {
  try {
    const { data, error } = await supabase
      .from('customer_leads')
      .update({ 
        fp_info: fpInfo,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating FP info:', error)
    throw error
  }
}

// FP情報を取得
export async function getFPInfo(leadId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('customer_leads')
      .select('fp_info')
      .eq('id', leadId)
      .single()

    if (error) throw error
    return data?.fp_info || {}
  } catch (error) {
    console.error('Error fetching FP info:', error)
    throw error
  }
}
