import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/session'
import { getUserPermissions } from '@/lib/auth/permissions-server'

export async function GET() {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ message: '認証されていません' }, { status: 401 })
    }

    const permissions = await getUserPermissions(session.userId)

    return NextResponse.json({
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      permissions
    })
  } catch (error) {
    return NextResponse.json({ message: 'サーバーエラー' }, { status: 500 })
  }
}
