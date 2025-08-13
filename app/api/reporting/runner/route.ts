import { NextRequest, NextResponse } from 'next/server'
import { getDueAgreements, updateNextReportDate } from '@/app/(secure)/actions/agreements'
import { getAgreement } from '@/app/(secure)/actions/agreements'

// 法令準拠の報告メールテンプレート生成
function generateReportEmail(agreement: any, metrics: any = {}) {
  const lead = agreement.customer_leads
  const extra = lead.extra
  
  // 物件情報の抽出
  const buildingName = extra.building_name || '未定'
  const roomNo = extra.room_no || ''
  const address = `${lead.prefecture || ''} ${lead.city || ''} ${extra.address1 || ''}`
  const expectedPrice = extra.expected_price ? `${extra.expected_price.toLocaleString()}円` : '要相談'
  
  // 契約種別の表示
  const contractTypeLabel = agreement.contract_type === '専属専任' ? '専属専任' : 
                           agreement.contract_type === '専任' ? '専任' : '一般'
  
  // 報告回数の計算
  const reportCount = agreement.last_report_sent_at ? 
    Math.floor((new Date().getTime() - new Date(agreement.last_report_sent_at).getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1 : 1
  
  // 件名
  const subject = `【販売状況報告】${lead.last_name}${lead.first_name}様邸（${buildingName}${roomNo}）／${contractTypeLabel}・第${reportCount}回`
  
  // 本文
  const body = `
${lead.last_name}${lead.first_name}様

センチュリー21ホームマートです。
下記のとおり販売活動の状況をご報告いたします。

■ 概況
・広告掲載：SUUMO／HOME'S／レインズ
・表示価格：${expectedPrice}
・直近の実績：閲覧 ${metrics.pageViews || 0}／問い合わせ ${metrics.inquiries || 0}／内見 ${metrics.viewings || 0} 件

■ 反響と所見
${metrics.feedback || '特になし'}

■ 競合状況
・同エリアの競合：${metrics.competitors || 0}件
・価格帯：${metrics.priceRange || '要調査'}

■ 推奨アクション（次回まで）
- ${metrics.recommendedActions?.[0] || '価格の見直し検討'}
- ${metrics.recommendedActions?.[1] || '広告の最適化'}

■ 次回報告予定
- ${new Date(agreement.next_report_date).toLocaleDateString('ja-JP')}（自動送付予定）

※${contractTypeLabel === '専属専任' ? '週1回' : contractTypeLabel === '専任' ? '2週に1回' : '任意'}の頻度で状況報告を継続します。
ご不明点があれば、本メールへご返信ください。

センチュリー21 ホームマート
担当：乾

---
※本メールは法令（宅建業法34条の2第9項）に基づく定期報告です。
※専属専任・専任契約の場合は、法定頻度での報告を継続いたします。
  `.trim()

  return { subject, body }
}

// メール送信処理
async function sendReportEmail(toEmail: string, subject: string, body: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: toEmail,
        subject,
        content: body
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

// 送信ログの保存
async function saveReportLog(agreementId: string, subject: string, body: string, toEmail: string, success: boolean, error?: string) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const metrics = {
      pageViews: Math.floor(Math.random() * 100) + 10, // 仮のデータ
      inquiries: Math.floor(Math.random() * 10) + 1,
      viewings: Math.floor(Math.random() * 5),
      competitors: Math.floor(Math.random() * 8) + 2,
      priceRange: '3000万〜5000万円',
      feedback: '内見者の方からは間取りの良さを評価いただいています。',
      recommendedActions: ['価格の見直し検討', '広告の最適化']
    }

    await supabase
      .from('listing_report_logs')
      .insert([{
        agreement_id: agreementId,
        subject,
        body,
        to_email: toEmail,
        metrics,
        success,
        error
      }])

  } catch (error) {
    console.error('送信ログ保存エラー:', error)
  }
}

// メイン処理
export async function GET(request: NextRequest) {
  try {
    // 認証チェック（Vercel Cronからの呼び出しのみ許可）
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    console.log('自動報告送信処理を開始:', new Date().toISOString())

    // 本日送付対象の媒介契約を取得
    const dueAgreements = await getDueAgreements()
    
    if (dueAgreements.length === 0) {
      console.log('本日送付対象の媒介契約はありません')
      return NextResponse.json({ 
        success: true, 
        message: '送付対象なし',
        processed: 0 
      })
    }

    console.log(`${dueAgreements.length}件の媒介契約が送付対象です`)

    let successCount = 0
    let errorCount = 0

    // 各媒介契約に対して報告メールを送信
    for (const agreement of dueAgreements) {
      try {
        const lead = agreement.customer_leads
        
        // メールアドレスがない場合はスキップ
        if (!lead.email) {
          console.log(`リードID ${lead.id}: メールアドレスが設定されていません`)
          continue
        }

        // 報告メールの生成
        const { subject, body } = generateReportEmail(agreement)
        
        // メール送信
        const sendSuccess = await sendReportEmail(lead.email, subject, body)
        
        if (sendSuccess) {
          // 送信成功時は次回報告日を更新
          await updateNextReportDate(agreement.id)
          
          // 送信ログを保存
          await saveReportLog(agreement.id, subject, body, lead.email, true)
          
          successCount++
          console.log(`リードID ${lead.id}: 報告メール送信成功`)
        } else {
          // 送信失敗時
          await saveReportLog(agreement.id, subject, body, lead.email, false, 'メール送信に失敗')
          errorCount++
          console.log(`リードID ${lead.id}: 報告メール送信失敗`)
        }

      } catch (error) {
        console.error(`リードID ${agreement.customer_leads.id}: 処理エラー:`, error)
        errorCount++
        
        // エラーログを保存
        await saveReportLog(
          agreement.id, 
          'エラー', 
          'エラーが発生しました', 
          'error@example.com', 
          false, 
          error instanceof Error ? error.message : '不明なエラー'
        )
      }
    }

    console.log(`自動報告送信処理完了: 成功 ${successCount}件, 失敗 ${errorCount}件`)

    return NextResponse.json({
      success: true,
      message: '自動報告送信処理完了',
      processed: dueAgreements.length,
      successCount: successCount,
      errors: errorCount
    })

  } catch (error) {
    console.error('自動報告送信処理でエラーが発生:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    }, { status: 500 })
  }
}

// POSTメソッドでも同じ処理を実行可能（テスト用）
export async function POST(request: NextRequest) {
  return GET(request)
}
