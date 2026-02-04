import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { User } from './authenticate'
import type { UserPermissions } from './permissions'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)
const COOKIE_NAME = 'admin_session'
const EXPIRATION_TIME = '24h'

export interface SessionPayload {
  userId: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'STAFF'
  name: string
  permissions?: UserPermissions
}

export async function createSession(user: User): Promise<void> {
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    permissions: user.permissions
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION_TIME)
    .sign(SECRET_KEY)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/'
  })
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload as unknown as SessionPayload
  } catch (error) {
    return null
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  return await verifySession()
}
