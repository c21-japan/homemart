import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'
import {
  hasPermission,
  canEditPermissions,
  type Role,
  type UserPermissions
} from '@/lib/auth/permissions'
import {
  getAllUsers,
  getUserPermissions,
  getDefaultPermissionsForRole
} from '@/lib/auth/permissions-server'
import { verifySession } from '@/lib/auth/session'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    const permissions = getUserPermissions(session.userId)
    if (!permissions || !hasPermission(permissions, 'USERS', 'VIEW')) {
      return NextResponse.json({ message: '権限がありません' }, { status: 403 })
    }

    const users = getAllUsers()
    const user = users.find((u) => u.id === id)

    if (!user) {
      return NextResponse.json({ message: 'ユーザーが見つかりません' }, { status: 404 })
    }

    const { password_hash, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json({ message: 'サーバーエラー' }, { status: 500 })
  }
}

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

    const permissions = getUserPermissions(session.userId)
    if (!permissions || !hasPermission(permissions, 'USERS', 'EDIT')) {
      return NextResponse.json({ message: '権限がありません' }, { status: 403 })
    }

    const users = getAllUsers()
    const userIndex = users.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ message: 'ユーザーが見つかりません' }, { status: 404 })
    }

    const targetUser = users[userIndex]
    if (!canEditPermissions(session.role, targetUser.role)) {
      return NextResponse.json(
        { message: 'このユーザーを編集する権限がありません' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const nextEmail = typeof body.email === 'string' ? body.email.trim() : targetUser.email
    const nextName = typeof body.name === 'string' ? body.name.trim() : targetUser.name
    const nextRole = typeof body.role === 'string' ? (body.role.trim() as Role) : targetUser.role
    const nextPassword = typeof body.password === 'string' ? body.password : ''
    const resetPermissions = Boolean(body.resetPermissions)
    const newPermissions = body.permissions as UserPermissions | undefined

    if (!nextEmail || !nextName) {
      return NextResponse.json({ message: '必須項目が不足しています' }, { status: 400 })
    }

    if (!['OWNER', 'ADMIN', 'STAFF'].includes(nextRole)) {
      return NextResponse.json({ message: '無効な権限です' }, { status: 400 })
    }

    if (nextRole === 'OWNER' && session.role !== 'OWNER') {
      return NextResponse.json({ message: 'OWNERに変更する権限がありません' }, { status: 403 })
    }

    if (users.some((u) => u.email === nextEmail && u.id !== targetUser.id)) {
      return NextResponse.json({ message: '同じメールアドレスが既に存在します' }, { status: 409 })
    }

    const updatedUser = { ...targetUser }
    updatedUser.email = nextEmail
    updatedUser.name = nextName
    updatedUser.role = nextRole

    if (nextPassword) {
      updatedUser.password_hash = await bcrypt.hash(nextPassword, 10)
    }

    if (newPermissions) {
      updatedUser.permissions = newPermissions
    } else if (resetPermissions || nextRole !== targetUser.role) {
      updatedUser.permissions = getDefaultPermissionsForRole(nextRole)
    }

    users[userIndex] = updatedUser

    const filePath = path.join(process.cwd(), 'config', 'users.json')
    fs.writeFileSync(filePath, JSON.stringify({ users }, null, 2), 'utf-8')

    const { password_hash, ...userWithoutPassword } = updatedUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json({ message: 'サーバーエラー' }, { status: 500 })
  }
}
