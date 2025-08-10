import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

// SendGrid設定
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message, propertyName } = body

    // 受信するメールアドレス
    const emailTo = process.env.EMAIL_TO || 'your-email@example.com'
    const emailFrom = process.env.EMAIL_FROM || 'noreply@example.com'

    // HTML形式のメール本文
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">新しいお問い合わせ</h1>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          ${propertyName ? `
            <div style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af;">物件情報</h3>
              <p style="margin: 0;">${propertyName}</p>
            </div>
          ` : ''}
          
          <div style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af;">お客様情報</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 5px 0; color: #6b7280;">お名前：</td>
                <td style="padding: 5px 0;"><strong>${name}</strong></td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #6b7280;">電話番号：</td>
                <td style="padding: 5px 0;">
                  <a href="tel:${phone}" style="color: #1e40af; text-decoration: none;">
                    <strong>${phone}</strong>
                  </a>
                </td>
              </tr>
              ${email ? `
                <tr>
                  <td style="padding: 5px 0; color: #6b7280;">メール：</td>
                  <td style="padding: 5px 0;">
                    <a href="mailto:${email}" style="color: #1e40af; text-decoration: none;">
                      ${email}
                    </a>
                  </td>
                </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af;">お問い合わせ内容</h3>
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #92400e;">
              ⚠️ お客様への返信は、上記の連絡先に直接ご連絡ください
            </p>
          </div>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">株式会社ホームマート 自動送信システム</p>
        </div>
      </div>
    `

    // テキスト形式のメール本文（HTMLが表示できない場合用）
    const textBody = `
新しいお問い合わせが届きました。

【物件】
${propertyName || 'なし'}

【お客様情報】
お名前：${name}
電話番号：${phone}
メール：${email || 'なし'}

【お問い合わせ内容】
${message}

---
このメールは自動送信されています。
お客様への返信は、上記の連絡先に直接ご連絡ください。
    `.trim()

    // SendGridでメール送信
    const msg = {
      to: emailTo,
      from: emailFrom,
      subject: `【ホームマート】新規お問い合わせ：${name}様${propertyName ? `（${propertyName}）` : ''}`,
      text: textBody,
      html: htmlBody,
    }

    await sgMail.send(msg)
    console.log('メール送信成功')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('SendGrid error:', error)
    
    // SendGridのエラー詳細を確認
    if (error.response) {
      console.error('SendGrid response error:', error.response.body)
    }
    
    return NextResponse.json(
      { error: 'メール送信に失敗しました', details: error.message },
      { status: 500 }
    )
  }
}
