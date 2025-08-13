import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl, getTokensFromCode } from '@/lib/google-api'

// Google認証URLを取得
export async function GET() {
  try {
    const authUrl = getAuthUrl()
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Auth URL generation error:', error)
    return NextResponse.json(
      { error: '認証URLの生成に失敗しました' },
      { status: 500 }
    )
  }
}

// 認証コードからトークンを取得
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    if (!code) {
      return NextResponse.json(
        { error: '認証コードが必要です' },
        { status: 400 }
      )
    }

    const tokens = await getTokensFromCode(code)
    
    return NextResponse.json({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expiry_date
    })
  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json(
      { error: 'トークンの取得に失敗しました' },
      { status: 500 }
    )
  }
}
