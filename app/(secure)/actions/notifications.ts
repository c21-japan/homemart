'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// チェックリスト完了通知
export async function sendChecklistCompletionNotification(checklistId: string, leadId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // チェックリストと顧客情報を取得
    const { data: checklist, error: checklistError } = await supabase
      .from('customer_checklists')
      .select(`
        *,
        customer_leads (
          id,
          last_name,
          first_name,
          email,
          phone,
          type,
          assigned_to
        )
      `)
      .eq('id', checklistId)
      .single()

    if (checklistError) throw checklistError

    // 100%完了の場合のみ通知
    if (checklist.progress_percentage === 100) {
      const lead = checklist.customer_leads
      const typeLabel = checklist.type === 'seller' ? '売主' : 
                       checklist.type === 'buyer' ? '買主' : 'リフォーム'

      const subject = `【完了通知】${lead.last_name}${lead.first_name}様の${typeLabel}チェックリストが完了しました`
      
      const content = `
${lead.last_name}${lead.first_name}様の${typeLabel}チェックリストが100%完了しました。

【完了情報】
顧客名: ${lead.last_name}${lead.first_name}
チェックリスト種別: ${typeLabel}
完了日時: ${new Date().toLocaleDateString('ja-JP')}
完了項目数: ${checklist.completed_items}/${checklist.total_items}

管理画面で詳細を確認:
${process.env.NEXT_PUBLIC_SITE_URL}/admin/leads/${leadId}

次のステップの準備をお願いします。
      `.trim()

      // 担当者と管理者に通知
      const recipients = [process.env.ADMIN_EMAIL || 'admin@example.com']
      if (lead.assigned_to && lead.assigned_to !== user.id) {
        // 担当者のメールアドレスを取得
        const { data: assignedUser } = await supabase.auth.admin.getUserById(lead.assigned_to)
        if (assignedUser?.user?.email) {
          recipients.push(assignedUser.user.email)
        }
      }

      // メール送信
      for (const recipient of recipients) {
        await sendEmail(recipient, subject, content)
      }

      // 通知履歴を保存
      await saveNotificationLog('checklist_completion', checklistId, subject, content, recipients)
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending checklist completion notification:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// 未完了リマインド通知
export async function sendIncompleteReminders() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // 進捗率が低いチェックリストを取得（50%未満）
    const { data: incompleteChecklists, error: fetchError } = await supabase
      .from('customer_checklists')
      .select(`
        *,
        customer_leads (
          id,
          last_name,
          first_name,
          email,
          phone,
          type,
          assigned_to
        )
      `)
      .lt('progress_percentage', 50)
      .order('progress_percentage', { ascending: true })

    if (fetchError) throw fetchError

    let reminderCount = 0

    for (const checklist of incompleteChecklists || []) {
      const lead = checklist.customer_leads
      const typeLabel = checklist.type === 'seller' ? '売主' : 
                       checklist.type === 'buyer' ? '買主' : 'リフォーム'

      // 最後の更新から7日以上経過している場合のみリマインド
      const lastUpdated = new Date(checklist.updated_at)
      const daysSinceUpdate = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceUpdate >= 7) {
        const subject = `【リマインド】${lead.last_name}${lead.first_name}様の${typeLabel}チェックリストが停滞しています`
        
        const content = `
${lead.last_name}${lead.first_name}様の${typeLabel}チェックリストが停滞しています。

【現在の状況】
顧客名: ${lead.last_name}${lead.first_name}
チェックリスト種別: ${typeLabel}
進捗率: ${checklist.progress_percentage}%
完了項目数: ${checklist.completed_items}/${checklist.total_items}
最後の更新: ${lastUpdated.toLocaleDateString('ja-JP')}（${daysSinceUpdate}日前）

早急な対応をお願いします。

管理画面で詳細を確認:
${process.env.NEXT_PUBLIC_SITE_URL}/admin/leads/${lead.id}
        `.trim()

        // 担当者にリマインド送信
        const recipients = [process.env.ADMIN_EMAIL || 'admin@example.com']
        if (lead.assigned_to && lead.assigned_to !== user.id) {
          const { data: assignedUser } = await supabase.auth.admin.getUserById(lead.assigned_to)
          if (assignedUser?.user?.email) {
            recipients.push(assignedUser.user.email)
          }
        }

        for (const recipient of recipients) {
          await sendEmail(recipient, subject, content)
        }

        // 通知履歴を保存
        await saveNotificationLog('incomplete_reminder', checklist.id, subject, content, recipients)
        reminderCount++
      }
    }

    return { success: true, reminderCount }
  } catch (error) {
    console.error('Error sending incomplete reminders:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// 媒介契約期限切れアラート
export async function sendAgreementDeadlineAlerts() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    // レインズ登録期限が近い媒介契約を取得
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data: urgentAgreements, error: fetchError } = await supabase
      .from('listing_agreements')
      .select(`
        *,
        customer_leads (
          id,
          last_name,
          first_name,
          email,
          phone,
          type
        )
      `)
      .lt('reins_required_by', nextWeek.toISOString().split('T')[0])
      .is('reins_registered_at', null)
      .eq('status', 'active')

    if (fetchError) throw fetchError

    let alertCount = 0

    for (const agreement of urgentAgreements || []) {
      const lead = agreement.customer_leads
      const deadline = new Date(agreement.reins_required_by)
      const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      const subject = `【緊急】${lead.last_name}${lead.first_name}様のレインズ登録期限が迫っています`
      
      const content = `
${lead.last_name}${lead.first_name}様のレインズ登録期限が迫っています。

【緊急事項】
顧客名: ${lead.last_name}${lead.first_name}
契約種別: ${agreement.contract_type}
レインズ登録期限: ${deadline.toLocaleDateString('ja-JP')}
残り日数: ${daysUntilDeadline}日

早急にレインズへの登録を行ってください。

管理画面で詳細を確認:
${process.env.NEXT_PUBLIC_SITE_URL}/admin/leads/${lead.id}
      `.trim()

      // 担当者と管理者に緊急通知
      const recipients = [process.env.ADMIN_EMAIL || 'admin@example.com']
      if (lead.assigned_to && lead.assigned_to !== user.id) {
        const { data: assignedUser } = await supabase.auth.admin.getUserById(lead.assigned_to)
        if (assignedUser?.user?.email) {
          recipients.push(assignedUser.user.email)
        }
      }

      for (const recipient of recipients) {
        await sendEmail(recipient, subject, content)
      }

      // 通知履歴を保存
      await saveNotificationLog('deadline_alert', agreement.id, subject, content, recipients)
      alertCount++
    }

    return { success: true, alertCount }
  } catch (error) {
    console.error('Error sending agreement deadline alerts:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' }
  }
}

// メール送信
async function sendEmail(to: string, subject: string, content: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        content
      })
    })

    if (!response.ok) {
      throw new Error(`メール送信に失敗: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('メール送信エラー:', error)
    return false
  }
}

// 通知履歴を保存
async function saveNotificationLog(
  type: string, 
  referenceId: string, 
  subject: string, 
  content: string, 
  recipients: string[]
) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    await supabase
      .from('notification_logs')
      .insert([{
        type,
        reference_id: referenceId,
        subject,
        content,
        recipients: recipients.join(', '),
        sent_at: new Date().toISOString()
      }])

  } catch (error) {
    console.error('通知履歴保存エラー:', error)
  }
}
