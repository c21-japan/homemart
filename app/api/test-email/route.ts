import { NextResponse } from 'next/server'
import Mailjet from 'node-mailjet'

// Mailjetの設定（環境変数から取得、フォールバック付き）
const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY || 'ea8a23b22f6f39c9a114fff4aae38816',
  apiSecret: process.env.MAILJET_SECRET_KEY || '6c1009b39b7856b4e970e1a0143a5259'
})

// 送信者メールアドレス（環境変数から取得、フォールバック付き）
const fromEmail = process.env.MAILJET_FROM_EMAIL || 'y-inui@century21.group'

export async function GET() {
  try {
    const msg = {
      Messages: [
        {
          From: {
            Email: fromEmail,
            Name: 'センチュリー21ホームマート'
          },
          To: [
            {
              Email: fromEmail,
              Name: 'テスト受信者'
            }
          ],
          Subject: 'テストメール',
          TextPart: 'これはテストメールです',
          HTMLPart: '<strong>これはテストメールです</strong>',
        }
      ]
    }

    const result = await mailjet.post('send', { version: 'v3.1' }).request(msg)
    console.log('送信成功:', result.body)
    
    return NextResponse.json({ 
      success: true, 
      statusCode: result.response.status 
    })
  } catch (error: unknown) {
    console.error('エラー詳細:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorResponse = (error as { response?: { body?: unknown } })?.response?.body
    return NextResponse.json({ 
      error: errorMessage,
      details: errorResponse 
    }, { status: 500 })
  }
}
