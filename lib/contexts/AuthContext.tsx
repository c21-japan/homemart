'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface StaffMember {
  id: string
  role: string
  permissions: string[]
  first_name: string
  last_name: string
  email: string
}

interface AuthContextType {
  user: User | null
  staff: StaffMember | null
  loading: boolean
  isAuthenticated: boolean
  isStaff: boolean
  hasPermission: (permission: string) => boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [staff, setStaff] = useState<StaffMember | null>(null)
  const [loading, setLoading] = useState(true)

  // 認証状態をチェック（1回のみ実行）
  useEffect(() => {
    checkUser()
    
    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await checkUserData(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setStaff(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      // ローカルストレージからキャッシュされた認証情報を確認
      const cachedAuth = localStorage.getItem('homemart-auth')
      if (cachedAuth) {
        const { user: cachedUser, staff: cachedStaff, timestamp } = JSON.parse(cachedAuth)
        const now = Date.now()
        
        // 30分以内のキャッシュであれば使用
        if (now - timestamp < 30 * 60 * 1000) {
          setUser(cachedUser)
          setStaff(cachedStaff)
          setLoading(false)
          return
        }
      }

      // キャッシュが無効な場合は新しく取得
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user) {
        await checkUserData(user)
      }
    } catch (error) {
      console.error('認証チェックエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkUserData = async (user: User) => {
    try {
      // 社員テーブルでユーザーを確認
      const { data: staffData, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !staffData) {
        setUser(user)
        setStaff(null)
        // 一般ユーザーの場合はキャッシュしない
        return
      }

      setUser(user)
      setStaff(staffData)

      // 認証情報をキャッシュ（30分間有効）
      localStorage.setItem('homemart-auth', JSON.stringify({
        user,
        staff: staffData,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('社員情報取得エラー:', error)
      setUser(user)
      setStaff(null)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('homemart-auth')
      setUser(null)
      setStaff(null)
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  const refreshUser = async () => {
    if (user) {
      await checkUserData(user)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!staff) return false
    if (staff.role === 'admin') return true
    return staff.permissions?.includes(permission) || false
  }

  const value: AuthContextType = {
    user,
    staff,
    loading,
    isAuthenticated: !!user,
    isStaff: !!staff,
    hasPermission,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 認証が必要なページ用のフック
export function useRequireAuth() {
  const { user, staff, loading, isAuthenticated, isStaff } = useAuth()
  
  return {
    user,
    staff,
    loading,
    isAuthenticated,
    isStaff,
    // 認証が必要な場合のヘルパー
    requireAuth: () => {
      if (loading) return 'loading'
      if (!isAuthenticated) return 'unauthenticated'
      if (!isStaff) return 'unauthorized'
      return 'authorized'
    }
  }
}
