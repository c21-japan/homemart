'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { 
  createChecklistSchema, 
  updateChecklistItemSchema,
  CustomerChecklist, 
  ChecklistType, 
  ChecklistItem,
  CHECKLIST_ITEMS 
} from '@/types/leads'
import { revalidatePath } from 'next/cache'

// チェックリストを作成
export async function createChecklist(leadId: string, type: ChecklistType) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // 既存のチェックリストがあるかチェック
    const { data: existingChecklist } = await supabase
      .from('customer_checklists')
      .select('id')
      .eq('lead_id', leadId)
      .eq('type', type)
      .single()

    if (existingChecklist) {
      throw new Error('この顧客のチェックリストは既に存在します')
    }

    // チェックリスト項目を取得
    const checklistItems = CHECKLIST_ITEMS[type]
    
    // チェックリスト作成
    const { data: checklist, error: insertError } = await supabase
      .from('customer_checklists')
      .insert([{
        lead_id: leadId,
        type,
        items: [],
        progress_percentage: 0,
        total_items: checklistItems.length,
        completed_items: 0
      }])
      .select()
      .single()

    if (insertError) throw insertError

    // チェックリスト項目を作成
    const itemsToInsert = checklistItems.map(item => ({
      checklist_id: checklist.id,
      item_key: item.key,
      label: item.label,
      checked: false,
      required: item.required,
      order_index: item.order
    }))

    const { error: itemsError } = await supabase
      .from('checklist_items')
      .insert(itemsToInsert)

    if (itemsError) throw itemsError

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${leadId}`)
    return { success: true, data: checklist }
  } catch (error) {
    console.error('Error creating checklist:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// チェックリストを取得
export async function getChecklist(leadId: string, type: ChecklistType) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // チェックリストと項目を取得
    const { data: checklist, error: checklistError } = await supabase
      .from('customer_checklists')
      .select('*')
      .eq('lead_id', leadId)
      .eq('type', type)
      .single()

    if (checklistError) {
      if (checklistError.code === 'PGRST116') {
        // チェックリストが存在しない場合は作成
        return await createChecklist(leadId, type)
      }
      throw checklistError
    }

    // チェックリスト項目を取得
    const { data: items, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('checklist_id', checklist.id)
      .order('order_index', { ascending: true })

    if (itemsError) throw itemsError

    // 進捗率を計算
    const completedItems = items.filter(item => item.checked).length
    const progressPercentage = Math.round((completedItems / items.length) * 100)

    // 進捗率を更新
    if (checklist.progress_percentage !== progressPercentage) {
      await supabase
        .from('customer_checklists')
        .update({
          progress_percentage: progressPercentage,
          completed_items: completedItems
        })
        .eq('id', checklist.id)
    }

    return {
      success: true,
      data: {
        ...checklist,
        items: items || [],
        progress_percentage: progressPercentage,
        completed_items: completedItems
      }
    }
  } catch (error) {
    console.error('Error fetching checklist:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// チェックリスト項目を更新
export async function updateChecklistItem(itemId: string, updates: { checked: boolean; note?: string; file_path?: string }) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // バリデーション
    const validatedData = updateChecklistItemSchema.parse({ item_id: itemId, ...updates })

    // チェックリスト項目を更新
    const updateData: any = {
      checked: validatedData.checked,
      updated_at: new Date().toISOString()
    }

    if (validatedData.checked) {
      updateData.completed_at = new Date().toISOString()
    } else {
      updateData.completed_at = null
    }

    if (validatedData.note !== undefined) {
      updateData.note = validatedData.note
    }

    if (validatedData.file_path !== undefined) {
      updateData.file_path = validatedData.file_path
    }

    const { data: item, error: updateError } = await supabase
      .from('checklist_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single()

    if (updateError) throw updateError

    // チェックリストの進捗率を更新
    await updateChecklistProgress(item.checklist_id)

    revalidatePath('/admin/leads')
    return { success: true, data: item }
  } catch (error) {
    console.error('Error updating checklist item:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// チェックリストの進捗率を更新
async function updateChecklistProgress(checklistId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // チェックリスト項目を取得
    const { data: items, error: itemsError } = await supabase
      .from('checklist_items')
      .select('checked')
      .eq('checklist_id', checklistId)

    if (itemsError) throw itemsError

    // 進捗率を計算
    const totalItems = items.length
    const completedItems = items.filter(item => item.checked).length
    const progressPercentage = Math.round((completedItems / totalItems) * 100)

    // チェックリストを更新
    await supabase
      .from('customer_checklists')
      .update({
        progress_percentage: progressPercentage,
        completed_items: completedItems
      })
      .eq('id', checklistId)

  } catch (error) {
    console.error('Error updating checklist progress:', error)
  }
}

// 顧客の全チェックリストを取得
export async function getCustomerChecklists(leadId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // 全チェックリストを取得
    const { data: checklists, error: checklistsError } = await supabase
      .from('customer_checklists')
      .select('*')
      .eq('lead_id', leadId)
      .order('type', { ascending: true })

    if (checklistsError) throw checklistsError

    // 各チェックリストの項目を取得
    const checklistsWithItems = await Promise.all(
      checklists.map(async (checklist) => {
        const { data: items } = await supabase
          .from('checklist_items')
          .select('*')
          .eq('checklist_id', checklist.id)
          .order('order_index', { ascending: true })

        return {
          ...checklist,
          items: items || []
        }
      })
    )

    return { success: true, data: checklistsWithItems }
  } catch (error) {
    console.error('Error fetching customer checklists:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// チェックリスト統計を取得
export async function getChecklistStats() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // 全チェックリストの統計を取得
    const { data: checklists, error: checklistsError } = await supabase
      .from('customer_checklists')
      .select('type, progress_percentage, total_items, completed_items')

    if (checklistsError) throw checklistsError

    const stats = {
      total: checklists.length,
      byType: {
        seller: { count: 0, avgProgress: 0, totalItems: 0, completedItems: 0 },
        buyer: { count: 0, avgProgress: 0, totalItems: 0, completedItems: 0 },
        reform: { count: 0, avgProgress: 0, totalItems: 0, completedItems: 0 }
      },
      overall: {
        avgProgress: 0,
        totalItems: 0,
        completedItems: 0
      }
    }

    let totalProgress = 0
    let totalItems = 0
    let totalCompletedItems = 0

    checklists.forEach(checklist => {
      const type = checklist.type as ChecklistType
      stats.byType[type].count++
      stats.byType[type].avgProgress += checklist.progress_percentage
      stats.byType[type].totalItems += checklist.total_items
      stats.byType[type].completedItems += checklist.completed_items

      totalProgress += checklist.progress_percentage
      totalItems += checklist.total_items
      totalCompletedItems += checklist.completed_items
    })

    // 平均値を計算
    Object.keys(stats.byType).forEach(type => {
      const typeStats = stats.byType[type as ChecklistType]
      if (typeStats.count > 0) {
        typeStats.avgProgress = Math.round(typeStats.avgProgress / typeStats.count)
      }
    })

    if (stats.total > 0) {
      stats.overall.avgProgress = Math.round(totalProgress / stats.total)
    }
    stats.overall.totalItems = totalItems
    stats.overall.completedItems = totalCompletedItems

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching checklist stats:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// チェックリスト項目にファイルを添付
export async function attachFileToChecklistItem(itemId: string, file: File) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // ファイルをSupabase Storageにアップロード
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `checklist-attachments/${itemId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('checklist-attachments')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // 添付ファイル情報をデータベースに保存
    const { data: attachment, error: insertError } = await supabase
      .from('checklist_attachments')
      .insert([{
        item_id: itemId,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: user.id
      }])
      .select()
      .single()

    if (insertError) throw insertError

    // チェックリスト項目のfile_pathを更新
    await supabase
      .from('checklist_items')
      .update({ file_path: filePath })
      .eq('id', itemId)

    return { success: true, data: attachment }
  } catch (error) {
    console.error('Error attaching file to checklist item:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}
