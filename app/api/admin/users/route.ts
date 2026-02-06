import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'
import { hasPermission, type Role } from '@/lib/auth/permissions'
import {
  getAllUsers,
  getUserPermissions,
  getDefaultPermissionsForRole
} from '@/lib/auth/permissions-server'
import { verifySession } from '@/lib/auth/session'

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    const permissions = await getUserPermissions(session.userId)
    if (!permissions || !hasPermission(permissions, 'USERS', 'VIEW')) {
      return NextResponse.json({ message: '権限がありません' }, { status: 403 })
    }

    const users = getAllUsers().map(({ password_hash, ...rest }) => rest)
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ message: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    const permissions = await getUserPermissions(session.userId)
    if (!permissions || !hasPermission(permissions, 'USERS', 'CREATE')) {
      return NextResponse.json({ message: '権限がありません' }, { status: 403 })
    }

    const body = await request.json()
    const id = String(body.id || '').trim()
    const email = String(body.email || '').trim()
    const name = String(body.name || '').trim()
    const role = String(body.role || '').trim() as Role
    const password = String(body.password || '')

    if (!id || !email || !name || !role || !password) {
      return NextResponse.json({ message: '必須項目が不足しています' }, { status: 400 })
    }

    if (!['OWNER', 'ADMIN', 'STAFF'].includes(role)) {
      return NextResponse.json({ message: '無効な権限です' }, { status: 400 })
    }

    if (role === 'OWNER' && session.role !== 'OWNER') {
      return NextResponse.json({ message: 'OWNERを作成する権限がありません' }, { status: 403 })
    }

    const users = getAllUsers()
    if (users.some((u) => u.id === id)) {
      return NextResponse.json({ message: '同じIDが既に存在します' }, { status: 409 })
    }

    if (users.some((u) => u.email === email)) {
      return NextResponse.json({ message: '同じメールアドレスが既に存在します' }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const created_at = new Date().toISOString().slice(0, 10)
    const newUser = {
      id,
      email,
      password_hash,
      role,
      name,
      created_at,
      permissions: getDefaultPermissionsForRole(role)
    }

    users.push(newUser)

    const filePath = path.join(process.cwd(), 'config', 'users.json')
    fs.writeFileSync(filePath, JSON.stringify({ users }, null, 2), 'utf-8')

    const { password_hash: _omit, ...userWithoutPassword } = newUser
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'サーバーエラー' }, { status: 500 })
  }
}
