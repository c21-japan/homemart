import fs from 'fs'
import path from 'path'
import { getCurrentUser } from './session'
import type { Role, UserPermissions } from './permissions'
import { createAdminClient } from '@/lib/supabase/admin'

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

async function getUserPermissionsFromDb(userId: string): Promise<UserPermissions | null> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('admin_user_permissions')
      .select('permissions')
      .eq('user_id', userId)
      .single()

    if (error || !data) return null
    return (data.permissions as UserPermissions) || null
  } catch (error) {
    console.error('Failed to read permissions from DB:', error)
    return null
  }
}

export async function getUserPermissions(userId: string): Promise<UserPermissions | null> {
  const dbPermissions = await getUserPermissionsFromDb(userId)
  if (dbPermissions) return dbPermissions

  const users = getAllUsers()
  const user = users.find((u) => u.id === userId)
  return user?.permissions || null
}

export async function updateUserPermissions(
  userId: string,
  newPermissions: UserPermissions
): Promise<boolean> {
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient()
      const { error } = await supabase
        .from('admin_user_permissions')
        .upsert({
          user_id: userId,
          permissions: newPermissions,
          updated_at: new Date().toISOString()
        })

      if (!error) return true
      console.error('Failed to update permissions in DB:', error)
    }
  } catch (error) {
    console.error('Failed to update permissions in DB:', error)
  }

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

  const permissions = await getUserPermissions(currentUser.userId)
  return {
    ...currentUser,
    permissions
  }
}
