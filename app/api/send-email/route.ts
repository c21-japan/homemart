import { NextRequest, NextResponse } from 'next/server'
import Mailjet from 'node-mailjet'

// Mailjetの設定（環境変数から取得、フォールバック付き）
const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY || 'ea8a23b22f6f39c9a114fff4aae38816',
  apiSecret: process.env.MAILJET_SECRET_KEY || '6c1009b39b7856b4e970e1a0143a5259'
})

// 送信者メールアドレス（環境変数から取得、フォールバック付き）
const fromEmail = process.env.MAILJET_FROM_EMAIL || 'y-inui@century21.group'

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからデータを取得
    const { name, email, phone, message, propertyName } = await request.json()

    console.log('受信データ:', { name, email, phone, message, propertyName })

    // 1. お客様への自動返信メール
    const customerEmail = {
      Messages: [
        {
          From: {
            Email: fromEmail,
            Name: 'センチュリー21ホームマート'
          },
          To: [
            {
              Email: email,
              Name: name
            }
          ],
          Subject: 'お問い合わせありがとうございます - センチュリー21ホームマート',
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #FFD700; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #000; margin: 0; font-size: 24px;">センチュリー21ホームマート</h1>
              </div>
              
              <div style="background-color: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
                <h2 style="color: #36454F; margin-bottom: 20px;">お問い合わせありがとうございます</h2>
                <p style="font-size: 16px; line-height: 1.6;">${name} 様</p>
                <p style="font-size: 16px; line-height: 1.6;">この度は、センチュリー21ホームマートにお問い合わせいただき、誠にありがとうございます。</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
                  <h3 style="color: #36454F; margin-bottom: 15px;">お問い合わせ内容の確認</h3>
                  ${propertyName ? `<p><strong>物件名：</strong>${propertyName}</p>` : ''}
                  <p><strong>お名前：</strong>${name}</p>
                  <p><strong>電話番号：</strong>${phone}</p>
                  <p><strong>メールアドレス：</strong>${email}</p>
                  <p><strong>お問い合わせ内容：</strong></p>
                  <div style="background-color: #fff; padding: 15px; border-radius: 3px; white-space: pre-line;">${message}</div>
                </div>
                
                <p style="font-size: 16px; line-height: 1.6; color: #FF0000; font-weight: bold;">担当者より1営業日以内にご連絡させていただきます。</p>
                <p style="font-size: 16px; line-height: 1.6;">お急ぎの場合は、下記までお電話ください。</p>
                
                <div style="background-color: #FFD700; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 24px; font-weight: bold; color: #000;">📞 0120-43-8639</p>
                  <p style="margin: 5px 0 0 0; font-size: 16px; color: #000;">受付時間：9:00〜22:00</p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                                  <div style="font-size: 14px; color: #666; line-height: 1.5;">
                    <strong>センチュリー21ホームマート</strong><br>
                    〒635-0821 奈良県北葛城郡広陵町笠287-1<br>
                    TEL: 0120-43-8639<br>
                    担当：乾 佑企
                  </div>
              </div>
            </div>
          `
        }
      ]
    }

    // 2. 社内通知メール（乾代表宛）
    const notificationEmail = {
      Messages: [
        {
          From: {
            Email: fromEmail,
            Name: 'ホームマート問い合わせシステム'
          },
          To: [
            {
              Email: fromEmail,
              Name: '乾 佑企'
            }
          ],
          Subject: `🔔【緊急】新規お問い合わせ - ${name}様${propertyName ? ` (${propertyName})` : ''}`,
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #FF0000; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #fff; margin: 0; font-size: 24px;">🚨 新規お問い合わせ通知 🚨</h1>
              </div>
              
              <div style="background-color: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
                <h2 style="color: #FF0000; margin-bottom: 20px;">至急対応が必要です</h2>
                
                <div style="background-color: #fff3cd; padding: 20px; margin: 20px 0; border-left: 5px solid #FFD700; border-radius: 3px;">
                  <h3 style="color: #856404; margin-bottom: 15px;">📋 お客様情報</h3>
                  ${propertyName ? `<p><strong>📍 対象物件：</strong>${propertyName}</p>` : ''}
                  <p><strong>👤 お名前：</strong>${name}</p>
                  <p><strong>📞 電話番号：</strong><a href="tel:${phone}" style="color: #FF0000; font-weight: bold;">${phone}</a></p>
                  <p><strong>📧 メールアドレス：</strong><a href="mailto:${email}" style="color: #0066cc;">${email}</a></p>
                  <p><strong>🕐 受信日時：</strong>${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="color: #36454F; margin-bottom: 15px;">💬 お問い合わせ内容</h3>
                  <div style="background-color: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 3px; white-space: pre-line; font-size: 16px; line-height: 1.6;">${message}</div>
                </div>
                
                <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; border-left: 5px solid #28a745;">
                  <p style="margin: 0; font-weight: bold; color: #155724; font-size: 18px;">⚡ 対応アクション</p>
                  <p style="margin: 10px 0 0 0; color: #155724;">1. 速やかにお客様にお電話でご連絡ください</p>
                  <p style="margin: 5px 0 0 0; color: #155724;">2. 対応完了後、CRMシステムに記録してください</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f1f3f4; border-radius: 5px;">
                  <p style="margin: 0; font-size: 18px; font-weight: bold; color: #FF0000;">今すぐお客様にお電話を！</p>
                  <a href="tel:${phone}" style="display: inline-block; margin-top: 10px; padding: 15px 30px; background-color: #FF0000; color: #fff; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 18px;">📞 ${phone} に電話をかける</a>
                </div>
              </div>
            </div>
          `
        }
      ]
    }

    // メール送信実行
    console.log('メール送信開始...')
    
    // お客様にメールアドレスがある場合のみ自動返信を送信
    if (email && email.trim() !== '') {
      const customerResult = await mailjet.post('send', { version: 'v3.1' }).request(customerEmail)
      console.log('お客様への自動返信メール送信完了:', customerResult.body)
    }
    
    // 社内通知メールは必ず送信
    const notificationResult = await mailjet.post('send', { version: 'v3.1' }).request(notificationEmail)
    console.log('社内通知メール送信完了:', notificationResult.body)

    return NextResponse.json({ 
      success: true, 
      message: 'メール送信が完了しました' 
    })

  } catch (error) {
    console.error('❌ Mailjet送信エラー:', error)
    return NextResponse.json(
      { 
        error: 'メール送信に失敗しました', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
