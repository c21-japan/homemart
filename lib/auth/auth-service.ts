import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export type UserRole = 'owner' | 'manager' | 'staff' | 'part_time'

export interface User {
  id: string
  email: string
  role: UserRole
  profile: UserProfile
  permissions: string[]
}

export interface UserProfile {
  firstName: string
  lastName: string
  employeeCode?: string
  department?: string
  position?: string
  avatarUrl?: string
}

export class AuthService {
  private supabase

  constructor() {
    const cookieStore = cookies()
    this.supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
  }

  // ログイン
  async login(email: string, password: string) {
    try {
      // ユーザー検証
      const { data: user, error: userError } = await this.supabase
        .from('auth_users')
        .select(`
          *,
          user_profiles (*)
        `)
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (userError || !user) {
        return { error: 'メールアドレスまたはパスワードが正しくありません' }
      }

      // パスワード検証
      const isValid = await bcrypt.compare(password, user.password_hash)
      if (!isValid) {
        return { error: 'メールアドレスまたはパスワードが正しくありません' }
      }

      // セッション作成
      const sessionToken = uuidv4()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // 24時間有効

      const { error: sessionError } = await this.supabase
        .from('user_sessions')
        .insert({
          auth_user_id: user.id,
          token: sessionToken,
          expires_at: expiresAt.toISOString()
        })

      if (sessionError) {
        return { error: 'セッションの作成に失敗しました' }
      }

      // 最終ログイン時刻更新
      await this.supabase
        .from('auth_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)

      // アクティビティログ記録
      await this.logActivity(user.id, 'login', 'auth', user.id)

      return { 
        data: {
          user: this.formatUser(user),
          sessionToken
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { error: 'ログイン処理中にエラーが発生しました' }
    }
  }

  // セッション検証
  async validateSession(sessionToken: string) {
    try {
      const { data: session, error: sessionError } = await this.supabase
        .from('user_sessions')
        .select(`
          *,
          auth_users (
            *,
            user_profiles (*)
          )
        `)
        .eq('token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (sessionError || !session) {
        return null
      }

      return this.formatUser(session.auth_users)
    } catch (error) {
      console.error('Session validation error:', error)
      return null
    }
  }

  // ログアウト
  async logout(sessionToken: string) {
    try {
      // セッション削除
      await this.supabase
        .from('user_sessions')
        .delete()
        .eq('token', sessionToken)

      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { error: 'ログアウト処理中にエラーが発生しました' }
    }
  }

  // ユーザー権限取得
  async getUserPermissions(userId: string, role: UserRole): Promise<string[]> {
    try {
      // ロール権限取得
      const { data: rolePerms } = await this.supabase
        .from('role_permissions')
        .select(`
          permissions (
            code
          )
        `)
        .eq('role', role)

      // カスタム権限取得
      const { data: customPerms } = await this.supabase
        .from('user_custom_permissions')
        .select(`
          permissions (
            code
          ),
          granted
        `)
        .eq('auth_user_id', userId)

      const permissions = new Set<string>()

      // ロール権限追加
      rolePerms?.forEach(p => {
        if (p.permissions?.code) {
          permissions.add(p.permissions.code)
        }
      })

      // カスタム権限適用
      customPerms?.forEach(p => {
        if (p.permissions?.code) {
          if (p.granted) {
            permissions.add(p.permissions.code)
          } else {
            permissions.delete(p.permissions.code)
          }
        }
      })

      return Array.from(permissions)
    } catch (error) {
      console.error('Permission fetch error:', error)
      return []
    }
  }

  // 権限チェック
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const { data: user } = await this.supabase
        .from('auth_users')
        .select('role')
        .eq('id', userId)
        .single()

      if (!user) return false

      const permissions = await this.getUserPermissions(userId, user.role)
      return permissions.includes(permission)
    } catch (error) {
      console.error('Permission check error:', error)
      return false
    }
  }

  // ユーザー作成
  async createUser(userData: {
    email: string
    password: string
    role: UserRole
    profile: {
      firstName: string
      lastName: string
      employeeCode?: string
      department?: string
      position?: string
    }
  }) {
    try {
      // パスワードハッシュ化
      const passwordHash = await bcrypt.hash(userData.password, 12)

      // ユーザー作成
      const { data: user, error: userError } = await this.supabase
        .from('auth_users')
        .insert({
          email: userData.email,
          password_hash: passwordHash,
          role: userData.role
        })
        .select()
        .single()

      if (userError || !user) {
        return { error: 'ユーザーの作成に失敗しました' }
      }

      // プロファイル作成
      const { error: profileError } = await this.supabase
        .from('user_profiles')
        .insert({
          auth_user_id: user.id,
          first_name: userData.profile.firstName,
          last_name: userData.profile.lastName,
          employee_code: userData.profile.employeeCode,
          department: userData.profile.department,
          position: userData.profile.position
        })

      if (profileError) {
        return { error: 'プロファイルの作成に失敗しました' }
      }

      return { data: user }
    } catch (error) {
      console.error('User creation error:', error)
      return { error: 'ユーザー作成中にエラーが発生しました' }
    }
  }

  // ユーザー一覧取得
  async getUsers() {
    try {
      const { data: users, error } = await this.supabase
        .from('auth_users')
        .select(`
          *,
          user_profiles (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        return { error: 'ユーザー一覧の取得に失敗しました' }
      }

      return { data: users.map(user => this.formatUser(user)) }
    } catch (error) {
      console.error('Users fetch error:', error)
      return { error: 'ユーザー一覧取得中にエラーが発生しました' }
    }
  }

  // アクティビティログ記録
  private async logActivity(
    userId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    details?: any
  ) {
    try {
      await this.supabase
        .from('activity_logs')
        .insert({
          auth_user_id: userId,
          action,
          target_type: targetType,
          target_id: targetId,
          details
        })
    } catch (error) {
      console.error('Activity log error:', error)
    }
  }

  private formatUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      profile: {
        firstName: dbUser.user_profiles?.first_name || '',
        lastName: dbUser.user_profiles?.last_name || '',
        employeeCode: dbUser.user_profiles?.employee_code,
        department: dbUser.user_profiles?.department,
        position: dbUser.user_profiles?.position,
        avatarUrl: dbUser.user_profiles?.avatar_url
      },
      permissions: []
    }
  }
}
