import fs from 'fs'
import path from 'path'
import { getCurrentUser } from './session'
import type { Role, UserPermissions } from './permissions'

export interface UserWithPermissions {
  id: string
  email: string
  password_hash: string
  role: Role
  name: string
  created_at: string
  permissions: UserPermissions
}

function readPermissionsConfig() {
  const filePath = path.join(process.cwd(), 'config', 'permissions.json')
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    return null
  }
}

export function getDefaultPermissionsForRole(role: Role): UserPermissions {
  const config = readPermissionsConfig()
  const defaults = config?.default_permissions?.[role]
  return defaults || {}
}

export function getAllUsers(): UserWithPermissions[] {
  const filePath = path.join(process.cwd(), 'config', 'users.json')
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(fileContent)
  return data.users
}

export function getUserPermissions(userId: string): UserPermissions | null {
  const users = getAllUsers()
  const user = users.find((u) => u.id === userId)
  return user?.permissions || null
}

export function updateUserPermissions(userId: string, newPermissions: UserPermissions): boolean {
  try {
    const filePath = path.join(process.cwd(), 'config', 'users.json')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(fileContent)

    const userIndex = data.users.findIndex((u: UserWithPermissions) => u.id === userId)
    if (userIndex === -1) return false

    data.users[userIndex].permissions = newPermissions

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Failed to update permissions:', error)
    return false
  }
}

export async function getCurrentUserPermissions() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return null

  const permissions = getUserPermissions(currentUser.userId)
  return {
    ...currentUser,
    permissions
  }
}
