import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth/authenticate'
import { createSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const { emailOrId, password } = await request.json()

    if (!emailOrId || !password) {
      return NextResponse.json(
        { message: 'メールアドレス/IDとパスワードを入力してください' },
        { status: 400 }
      )
    }

    const user = await authenticate(emailOrId, password)

    if (!user) {
      return NextResponse.json(
        { message: 'メールアドレス/IDまたはパスワードが間違っています' },
        { status: 401 }
      )
    }

    await createSession(user)

    return NextResponse.json({
      message: 'ログイン成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
