import { NextRequest, NextResponse } from 'next/server'
import { refreshAccessToken } from '@/lib/google-api'

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'リフレッシュトークンが必要です' },
        { status: 400 }
      )
    }

    const credentials = await refreshAccessToken(refreshToken)
    
    if (!credentials.access_token) {
      throw new Error('アクセストークンの取得に失敗しました')
    }

    return NextResponse.json({
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token || refreshToken,
      expiresIn: credentials.expiry_date || Date.now() + 3600000 // 1時間後
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'トークンの更新に失敗しました' },
      { status: 500 }
    )
  }
}
