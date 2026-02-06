import { NextRequest, NextResponse } from 'next/server'
import {
  canEditPermissions,
  type UserPermissions
} from '@/lib/auth/permissions'
import { updateUserPermissions, getAllUsers } from '@/lib/auth/permissions-server'
import { verifySession } from '@/lib/auth/session'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    const users = getAllUsers()
    const targetUser = users.find((u) => u.id === id)
    if (!targetUser) {
      return NextResponse.json({ message: 'ユーザーが見つかりません' }, { status: 404 })
    }

    if (!canEditPermissions(session.role, targetUser.role)) {
      return NextResponse.json(
        { message: 'このユーザーの権限を編集する権限がありません' },
        { status: 403 }
      )
    }

    const { permissions } = (await request.json()) as { permissions: UserPermissions }
    const success = await updateUserPermissions(id, permissions)

    if (success) {
      return NextResponse.json({ message: '権限を更新しました' })
    }

    return NextResponse.json({ message: '更新に失敗しました' }, { status: 500 })
  } catch (error) {
    console.error('Permission update error:', error)
    return NextResponse.json({ message: 'サーバーエラー' }, { status: 500 })
  }
}
