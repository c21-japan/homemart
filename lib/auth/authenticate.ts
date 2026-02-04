import bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'
import type { UserPermissions } from './permissions'

export interface User {
  id: string
  email: string
  password_hash: string
  role: 'OWNER' | 'ADMIN' | 'STAFF'
  name: string
  created_at: string
  permissions?: UserPermissions
}

interface UsersData {
  users: User[]
}

function getUsers(): User[] {
  const filePath = path.join(process.cwd(), 'config', 'users.json')
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const data: UsersData = JSON.parse(fileContent)
  return data.users
}

export async function authenticate(emailOrId: string, password: string): Promise<User | null> {
  const users = getUsers()
  const user = users.find((u) => u.email === emailOrId || u.id === emailOrId)

  if (!user) {
    return null
  }

  const isValid = await bcrypt.compare(password, user.password_hash)

  if (!isValid) {
    return null
  }

  return user
}

export function getUserById(id: string): User | null {
  const users = getUsers()
  return users.find((u) => u.id === id) || null
}
