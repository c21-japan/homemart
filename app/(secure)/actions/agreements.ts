'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { createAgreementSchema, ListingAgreement, ContractType } from '@/types/leads'
import { 
  calculateReinsDeadline, 
  calculateNextReportDate, 
  getReportIntervalDays,
  isReinsOverdue,
  getRemainingBusinessDays
} from '@/lib/utils/business-days'
import { revalidatePath } from 'next/cache'

// 媒介契約を作成
export async function createAgreement(formData: FormData) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // フォームデータの取得とバリデーション
    const rawData = {
      lead_id: formData.get('lead_id') as string,
      contract_type: formData.get('contract_type') as ContractType,
      signed_at: formData.get('signed_at') as string,
      property_id: formData.get('property_id') as string
    }

    // バリデーション
    const validatedData = createAgreementSchema.parse(rawData)

    // 契約種別に基づいて自動計算
    const signedAt = new Date(validatedData.signed_at)
    const reinsRequiredBy = calculateReinsDeadline(signedAt, validatedData.contract_type)
    const reportIntervalDays = getReportIntervalDays(validatedData.contract_type)
    const nextReportDate = calculateNextReportDate(signedAt, validatedData.contract_type)

    // 媒介契約作成
    const { data: agreement, error: insertError } = await supabase
      .from('listing_agreements')
      .insert([{
        ...validatedData,
        reins_required_by: reinsRequiredBy.toISOString().split('T')[0],
        report_interval_days: reportIntervalDays,
        next_report_date: nextReportDate.toISOString().split('T')[0]
      }])
      .select()
      .single()

    if (insertError) throw insertError

    // レインズ登録期限の警告チェック
    if (validatedData.contract_type !== '一般') {
      const remainingDays = getRemainingBusinessDays(reinsRequiredBy)
      if (remainingDays <= 3) {
        // 社内に警告メール送信
        await sendReinsWarning(agreement, remainingDays)
      }
    }

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${validatedData.lead_id}`)
    return { success: true, data: agreement }
  } catch (error) {
    console.error('Error creating agreement:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// 媒介契約を更新
export async function updateAgreement(id: string, formData: FormData) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // フォームデータの取得
    const updates: Partial<ListingAgreement> = {}
    
    if (formData.get('contract_type')) {
      updates.contract_type = formData.get('contract_type') as ContractType
    }
    if (formData.get('signed_at')) {
      updates.signed_at = formData.get('signed_at') as string
    }
    if (formData.get('reins_registered_at')) {
      updates.reins_registered_at = formData.get('reins_registered_at') as string
    }
    if (formData.get('status')) {
      updates.status = formData.get('status') as 'active' | 'suspended' | 'closed'
    }

    // 契約種別が変更された場合、再計算
    if (updates.contract_type) {
      const signedAt = new Date(updates.signed_at || formData.get('signed_at') as string)
      const reinsRequiredBy = calculateReinsDeadline(signedAt, updates.contract_type)
      const reportIntervalDays = getReportIntervalDays(updates.contract_type)
      const nextReportDate = calculateNextReportDate(signedAt, updates.contract_type)

      updates.reins_required_by = reinsRequiredBy.toISOString().split('T')[0]
      updates.report_interval_days = reportIntervalDays
      updates.next_report_date = nextReportDate.toISOString().split('T')[0]
    }

    // 媒介契約更新
    const { data: agreement, error: updateError } = await supabase
      .from('listing_agreements')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${agreement.lead_id}`)
    return { success: true, data: agreement }
  } catch (error) {
    console.error('Error updating agreement:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// 本日送付対象の媒介契約を取得
export async function getDueAgreements(date: Date = new Date()) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    const dateString = date.toISOString().split('T')[0]

    // 本日送付対象の媒介契約を取得
    const { data: agreements, error } = await supabase
      .from('listing_agreements')
      .select(`
        *,
        customer_leads (
          id,
          last_name,
          first_name,
          email,
          phone,
          extra
        )
      `)
      .eq('status', 'active')
      .lte('next_report_date', dateString)
      .order('next_report_date', { ascending: true })

    if (error) throw error

    return agreements || []
  } catch (error) {
    console.error('Error fetching due agreements:', error)
    throw error
  }
}

// 媒介契約の詳細を取得
export async function getAgreement(id: string) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    const { data: agreement, error } = await supabase
      .from('listing_agreements')
      .select(`
        *,
        customer_leads (
          id,
          last_name,
          first_name,
          email,
          phone,
          extra
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return agreement
  } catch (error) {
    console.error('Error fetching agreement:', error)
    throw error
  }
}

// 媒介契約の統計を取得
export async function getAgreementStats() {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    const { data: agreements, error } = await supabase
      .from('listing_agreements')
      .select('contract_type, status, reins_required_by, next_report_date')
      .eq('status', 'active')

    if (error) throw error

    const stats = {
      total: agreements?.length || 0,
      byType: {
        '専属専任': 0,
        '専任': 0,
        '一般': 0
      },
      dueReports: 0,
      reinsOverdue: 0
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    agreements?.forEach(agreement => {
      // 種別別カウント
      stats.byType[agreement.contract_type as ContractType]++

      // 本日送付対象
      if (new Date(agreement.next_report_date) <= today) {
        stats.dueReports++
      }

      // レインズ期限切れ
      if (agreement.reins_required_by && isReinsOverdue(new Date(agreement.reins_required_by))) {
        stats.reinsOverdue++
      }
    })

    return stats
  } catch (error) {
    console.error('Error fetching agreement stats:', error)
    throw error
  }
}

// レインズ登録警告メール送信
async function sendReinsWarning(agreement: ListingAgreement, remainingDays: number) {
  try {
    const subject = `【重要】レインズ登録期限が近づいています（残り${remainingDays}営業日）`
    
    const content = `
レインズ登録期限が近づいています。

【契約情報】
契約種別: ${agreement.contract_type}
締結日: ${agreement.signed_at}
登録期限: ${agreement.reins_required_by}
残り営業日: ${remainingDays}日

早急にレインズへの登録を行ってください。

管理画面で詳細を確認:
${process.env.NEXT_PUBLIC_SITE_URL}/admin/leads/${agreement.lead_id}
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
      console.error('Failed to send REINS warning email')
    }
  } catch (error) {
    console.error('Error sending REINS warning email:', error)
  }
}

// 報告送信後の次回報告日を更新
export async function updateNextReportDate(agreementId: string) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // 現在の媒介契約を取得
    const { data: agreement, error: fetchError } = await supabase
      .from('listing_agreements')
      .select('contract_type, last_report_sent_at')
      .eq('id', agreementId)
      .single()

    if (fetchError) throw fetchError

    // 次回報告日を計算
    const lastReportDate = agreement.last_report_sent_at ? new Date(agreement.last_report_sent_at) : new Date()
    const nextReportDate = calculateNextReportDate(lastReportDate, agreement.contract_type as ContractType)

    // 更新
    const { error: updateError } = await supabase
      .from('listing_agreements')
      .update({
        last_report_sent_at: new Date().toISOString(),
        next_report_date: nextReportDate.toISOString().split('T')[0]
      })
      .eq('id', agreementId)

    if (updateError) throw updateError

    return { success: true }
  } catch (error) {
    console.error('Error updating next report date:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}
