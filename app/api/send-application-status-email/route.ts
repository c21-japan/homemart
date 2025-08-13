import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { applicationId, newStatus, employeeName, applicationType } = await request.json()

    if (!applicationId || !newStatus || !employeeName || !applicationType) {
      return NextResponse.json(
        { error: '必要なパラメータが不足しています' },
        { status: 400 }
      )
    }

    // 申請データを取得
    const { data: application, error: fetchError } = await supabase
      .from('internal_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: '申請データが見つかりません' },
        { status: 404 }
      )
    }

    // メール送信処理
    const emailResult = await sendStatusEmail(application, newStatus)

    if (emailResult.success) {
      return NextResponse.json({ 
        message: 'メール送信が完了しました',
        emailSent: true 
      })
    } else {
      return NextResponse.json({ 
        error: 'メール送信に失敗しました',
        emailSent: false 
      })
    }

  } catch (error) {
    console.error('Error sending status email:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

async function sendStatusEmail(application: Record<string, unknown>, newStatus: string) {
  try {
    const statusText = newStatus === 'approved' ? '承認' : '却下'
    const statusColor = newStatus === 'approved' ? '#10B981' : '#EF4444'
    
    const applicationTypeText = {
      'paid_leave': '有給申請',
      'sick_leave': '病気休暇申請',
      'expense': '経費申請',
      'other': 'その他申請'
    }[application.application_type] || '申請'

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>申請状況のお知らせ</title>
      </head>
      <body style="font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #2c3e50; margin-bottom: 20px; text-align: center;">申請状況のお知らせ</h1>
          
          <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin-bottom: 15px; font-size: 16px;">
              <strong>${application.employee_name}</strong> 様
            </p>
            
            <p style="margin-bottom: 20px; font-size: 16px;">
              お疲れ様です。<br>
              ご提出いただいた申請の審査結果をお知らせいたします。
            </p>
            
            <div style="background-color: ${statusColor}; color: white; padding: 15px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 20px;">審査結果: ${statusText}</h2>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #2c3e50;">申請内容</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold; width: 30%;">申請種別:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${applicationTypeText}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold;">申請日:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${new Date(application.created_at).toLocaleDateString('ja-JP')}</td>
                </tr>
                ${application.start_date && application.end_date ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold;">期間:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${new Date(application.start_date).toLocaleDateString('ja-JP')} 〜 ${new Date(application.end_date).toLocaleDateString('ja-JP')}</td>
                </tr>
                ` : ''}
                ${application.amount ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold;">金額:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">¥${application.amount.toLocaleString()}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${newStatus === 'approved' ? `
            <div style="background-color: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0; color: #065f46; font-weight: bold;">
                ✓ 申請が承認されました
              </p>
              <p style="margin: 5px 0 0 0; color: #065f46; font-size: 14px;">
                承認された申請に基づいて、適切な手続きを進めさせていただきます。
              </p>
            </div>
            ` : `
            <div style="background-color: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0; color: #991b1b; font-weight: bold;">
                ✗ 申請が却下されました
              </p>
              <p style="margin: 5px 0 0 0; color: #991b1b; font-size: 14px;">
                詳細な理由や代替案について、直接上司または人事部にお問い合わせください。
              </p>
            </div>
            `}
            
            <p style="margin-bottom: 15px; font-size: 14px; color: #6c757d;">
              ご不明な点がございましたら、お気軽にお問い合わせください。
            </p>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
              このメールは自動送信されています。<br>
              返信はできませんのでご了承ください。
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // メール送信処理（実際のメール送信サービスを使用）
    // ここでは例として、メール送信が成功したと仮定
    console.log('メール送信:', {
      to: `${application.employee_name}@example.com`,
      subject: `【申請状況】${applicationTypeText}の審査結果`,
      content: emailContent
    })

    return { success: true }

  } catch (error) {
    console.error('Error in sendStatusEmail:', error)
    return { success: false, error: error.message }
  }
}
