'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { createLeadSchema, updateLeadSchema, CustomerLead, LeadType, LeadStatus } from '@/types/leads'
import { revalidatePath } from 'next/cache'

// 新規リード作成
export async function createLead(formData: FormData) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // フォームデータの取得とバリデーション
    const rawData = {
      type: formData.get('type') as LeadType,
      source: formData.get('source') as string,
      last_name: formData.get('last_name') as string,
      first_name: formData.get('first_name') as string,
      last_name_kana: formData.get('last_name_kana') as string,
      first_name_kana: formData.get('first_name_kana') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      postal_code: formData.get('postal_code') as string,
      prefecture: formData.get('prefecture') as string,
      city: formData.get('city') as string,
      address1: formData.get('address1') as string,
      address2: formData.get('address2') as string,
      residence_structure: formData.get('residence_structure') as string,
      household: formData.get('household') as string,
      note: formData.get('note') as string,
      attachments: JSON.parse(formData.get('attachments') as string || '[]'),
      location: formData.get('location') ? JSON.parse(formData.get('location') as string) : undefined,
      extra: JSON.parse(formData.get('extra') as string || '{}')
    }

    // バリデーション
    const validatedData = createLeadSchema.parse(rawData)

    // リード作成
    const { data: lead, error: insertError } = await supabase
      .from('customer_leads')
      .insert([{
        ...validatedData,
        created_by: user.id
      }])
      .select()
      .single()

    if (insertError) throw insertError

    // 社内通知メール送信
    await sendLeadNotification(lead)

    revalidatePath('/admin/leads')
    return { success: true, data: lead }
  } catch (error) {
    console.error('Error creating lead:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// リード更新
export async function updateLead(id: string, formData: FormData) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // フォームデータの取得とバリデーション
    const rawData = {
      id,
      type: formData.get('type') as LeadType,
      source: formData.get('source') as string,
      last_name: formData.get('last_name') as string,
      first_name: formData.get('first_name') as string,
      last_name_kana: formData.get('last_name_kana') as string,
      first_name_kana: formData.get('first_name_kana') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      postal_code: formData.get('postal_code') as string,
      prefecture: formData.get('prefecture') as string,
      city: formData.get('city') as string,
      address1: formData.get('address1') as string,
      address2: formData.get('address2') as string,
      residence_structure: formData.get('residence_structure') as string,
      household: formData.get('household') as string,
      note: formData.get('note') as string,
      attachments: JSON.parse(formData.get('attachments') as string || '[]'),
      location: formData.get('location') ? JSON.parse(formData.get('location') as string) : undefined,
      extra: JSON.parse(formData.get('extra') as string || '{}'),
      status: formData.get('status') as LeadStatus,
      assigned_to: formData.get('assigned_to') as string
    }

    // バリデーション
    const validatedData = updateLeadSchema.parse(rawData)

    // リード更新
    const { data: lead, error: updateError } = await supabase
      .from('customer_leads')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${id}`)
    return { success: true, data: lead }
  } catch (error) {
    console.error('Error updating lead:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// リード削除
export async function deleteLead(id: string) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // 管理者権限チェック
    const { data: { user: userData } } = await supabase.auth.getUser()
    const isAdmin = userData?.user_metadata?.role === 'admin'
    
    if (!isAdmin) {
      throw new Error('削除権限がありません')
    }

    // リード削除
    const { error: deleteError } = await supabase
      .from('customer_leads')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    revalidatePath('/admin/leads')
    return { success: true }
  } catch (error) {
    console.error('Error deleting lead:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// 担当者アサイン
export async function assignLead(leadId: string, userId: string) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // 担当者アサイン
    const { data: lead, error: updateError } = await supabase
      .from('customer_leads')
      .update({ assigned_to: userId })
      .eq('id', leadId)
      .select()
      .single()

    if (updateError) throw updateError

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${leadId}`)
    return { success: true, data: lead }
  } catch (error) {
    console.error('Error assigning lead:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// ステータス更新
export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // ステータス更新
    const { data: lead, error: updateError } = await supabase
      .from('customer_leads')
      .update({ status })
      .eq('id', leadId)
      .select()
      .single()

    if (updateError) throw updateError

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${leadId}`)
    return { success: true, data: lead }
  } catch (error) {
    console.error('Error updating lead status:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// 社内通知メール送信
async function sendLeadNotification(lead: CustomerLead) {
  try {
    const typeLabels = {
      purchase: '購入',
      sell: '売却',
      reform: 'リフォーム'
    }

    const subject = `【新規顧客情報】${typeLabels[lead.type]} / ${lead.last_name}${lead.first_name} / 担当`
    
    const content = `
新規顧客情報が登録されました。

【基本情報】
氏名: ${lead.last_name} ${lead.first_name}
電話: ${lead.phone || '未入力'}
メール: ${lead.email || '未入力'}
住所: ${lead.prefecture || ''} ${lead.city || ''} ${lead.address1 || ''}
取得経路: ${lead.source || '未入力'}

【詳細】
${lead.note || '特になし'}

管理画面で詳細を確認してください:
${process.env.NEXT_PUBLIC_SITE_URL}/admin/leads/${lead.id}
    `.trim()

    // 既存のメール送信APIを使用
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: process.env.ADMIN_EMAIL || 'admin@example.com',
        subject,
        content
      })
    })

    if (!response.ok) {
      console.error('Failed to send notification email')
    }
  } catch (error) {
    console.error('Error sending notification email:', error)
  }
}
