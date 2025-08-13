import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// LINE公式アカウント設定
const LINE_CONFIG = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  webhookUrl: process.env.LINE_WEBHOOK_URL
}

// LINE Webhook受信
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-line-signature')

    // 署名検証
    if (!verifyLineSignature(body, signature)) {
      return NextResponse.json({ error: '署名が無効です' }, { status: 401 })
    }

    const events = JSON.parse(body).events

    for (const event of events) {
      if (event.type === 'message') {
        await handleLineMessage(event)
      } else if (event.type === 'follow') {
        await handleLineFollow(event)
      } else if (event.type === 'unfollow') {
        await handleLineUnfollow(event)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('LINE webhook error:', error)
    return NextResponse.json({ error: 'Webhook処理エラー' }, { status: 500 })
  }
}

// LINE署名検証
function verifyLineSignature(body: string, signature: string | null): boolean {
  if (!signature || !LINE_CONFIG.channelSecret) return false
  
  const crypto = require('crypto')
  const hash = crypto
    .createHmac('SHA256', LINE_CONFIG.channelSecret)
    .update(body)
    .digest('base64')
  
  return hash === signature
}

// LINEメッセージ処理
async function handleLineMessage(event: any) {
  try {
    const { message, replyToken, source } = event
    const userId = source.userId

    if (message.type === 'text') {
      const text = message.text
      
      // 自動応答処理
      const response = await generateAutoResponse(text, userId)
      
      if (response) {
        await replyLineMessage(replyToken, response)
      }
    }
  } catch (error) {
    console.error('LINE message handling error:', error)
  }
}

// LINEフォロー処理
async function handleLineFollow(event: any) {
  try {
    const { source } = event
    const userId = source.userId

    // ユーザープロフィールを取得
    const profile = await getLineUserProfile(userId)
    
    // データベースにLINEユーザー情報を保存
    await saveLineUser(userId, profile)

    // 歓迎メッセージを送信
    const welcomeMessage = {
      type: 'text',
      text: `ホームマートへようこそ！\n\n不動産のご相談やリフォームのご質問など、お気軽にお聞かせください。\n\n営業時間: 9:00-18:00（平日）\n担当: 乾 佑企`
    }

    await pushLineMessage(userId, welcomeMessage)

  } catch (error) {
    console.error('LINE follow handling error:', error)
  }
}

// LINEアンフォロー処理
async function handleLineUnfollow(event: any) {
  try {
    const { source } = event
    const userId = source.userId

    // データベースからLINEユーザー情報を削除
    await removeLineUser(userId)

  } catch (error) {
    console.error('LINE unfollow handling error:', error)
  }
}

// 自動応答生成
async function generateAutoResponse(text: string, userId: string): Promise<any> {
  try {
    // キーワードベースの自動応答
    const responses: { [key: string]: string } = {
      '物件': '物件のご相談ですね。お客様のご希望をお聞かせください。\n\n・購入希望\n・売却希望\n・賃貸希望\n・リフォーム希望\n\nどのようなご相談でしょうか？',
      '価格': '価格についてのご相談ですね。\n\n・購入予算\n・売却希望価格\n・賃貸料\n・リフォーム費用\n\n具体的な金額をお聞かせください。',
      'リフォーム': 'リフォームのご相談ですね。\n\n・キッチン\n・浴室\n・リビング\n・外装\n・その他\n\nどの部分のリフォームをご希望でしょうか？',
      '見積もり': '見積もりをご希望ですね。\n\n物件の詳細やご希望をお聞かせいただければ、お見積もりをさせていただきます。\n\nお客様の連絡先もお聞かせください。',
      '営業時間': '営業時間は以下の通りです。\n\n平日: 9:00-18:00\n土曜: 9:00-17:00\n日祝: 休み\n\nご都合の良い時間にお電話ください。',
      '担当': '担当は乾 佑企です。\n\n不動産・リフォームの専門家として、お客様のご希望に合わせた最適なプランをご提案いたします。\n\nお気軽にご相談ください。'
    }

    // キーワードマッチング
    for (const [keyword, response] of Object.entries(responses)) {
      if (text.includes(keyword)) {
        return {
          type: 'text',
          text: response
        }
      }
    }

    // デフォルト応答
    return {
      type: 'text',
      text: 'ご相談ありがとうございます。\n\n担当者からの返信をお待ちください。\n\n営業時間内でしたら、お電話でのご相談も可能です。\n\nTEL: 0742-XX-XXXX'
    }

  } catch (error) {
    console.error('Auto response generation error:', error)
    return null
  }
}

// LINEメッセージ返信
async function replyLineMessage(replyToken: string, message: any) {
  try {
    if (!LINE_CONFIG.channelAccessToken) {
      throw new Error('LINEチャネルアクセストークンが設定されていません')
    }

    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINE_CONFIG.channelAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        replyToken,
        messages: [message]
      })
    })

    if (!response.ok) {
      throw new Error(`LINE返信エラー: ${response.status}`)
    }

  } catch (error) {
    console.error('LINE reply error:', error)
  }
}

// LINEプッシュメッセージ送信
export async function pushLineMessage(userId: string, message: any) {
  try {
    if (!LINE_CONFIG.channelAccessToken) {
      throw new Error('LINEチャネルアクセストークンが設定されていません')
    }

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINE_CONFIG.channelAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: userId,
        messages: [message]
      })
    })

    if (!response.ok) {
      throw new Error(`LINEプッシュエラー: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('LINE push error:', error)
    return false
  }
}

// LINEユーザープロフィール取得
async function getLineUserProfile(userId: string) {
  try {
    if (!LINE_CONFIG.channelAccessToken) {
      throw new Error('LINEチャネルアクセストークンが設定されていません')
    }

    const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: {
        'Authorization': `Bearer ${LINE_CONFIG.channelAccessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`LINEプロフィール取得エラー: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('LINE profile fetch error:', error)
    return null
  }
}

// LINEユーザー情報保存
async function saveLineUser(userId: string, profile: any) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    await supabase
      .from('line_users')
      .upsert([{
        line_user_id: userId,
        display_name: profile?.displayName || '',
        picture_url: profile?.pictureUrl || '',
        status_message: profile?.statusMessage || '',
        created_at: new Date().toISOString()
      }], {
        onConflict: 'line_user_id'
      })

  } catch (error) {
    console.error('LINE user save error:', error)
  }
}

// LINEユーザー情報削除
async function removeLineUser(userId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    await supabase
      .from('line_users')
      .delete()
      .eq('line_user_id', userId)

  } catch (error) {
    console.error('LINE user remove error:', error)
  }
}

// 顧客にLINE通知送信
export async function sendLineNotificationToCustomer(leadId: string, message: string) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // 顧客情報を取得
    const { data: lead, error: leadError } = await supabase
      .from('customer_leads')
      .select('line_user_id')
      .eq('id', leadId)
      .single()

    if (leadError || !lead.line_user_id) {
      throw new Error('LINEユーザーIDが見つかりません')
    }

    // LINEメッセージを送信
    const result = await pushLineMessage(lead.line_user_id, {
      type: 'text',
      text: message
    })

    return { success: result }
  } catch (error) {
    console.error('LINE customer notification error:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラー' }
  }
}
