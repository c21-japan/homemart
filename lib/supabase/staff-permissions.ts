import { createClient } from './server'

export interface StaffMember {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'staff' | 'part_time'
  department: string
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

// 権限の定義
export const PERMISSIONS = {
  // 物件管理
  PROPERTY_VIEW: 'property:view',
  PROPERTY_CREATE: 'property:create',
  PROPERTY_EDIT: 'property:edit',
  PROPERTY_DELETE: 'property:delete',
  PROPERTY_PUBLISH: 'property:publish',
  
  // リード管理
  LEAD_VIEW: 'lead:view',
  LEAD_CREATE: 'lead:create',
  LEAD_EDIT: 'lead:edit',
  LEAD_DELETE: 'lead:delete',
  LEAD_ASSIGN: 'lead:assign',
  
  // お問い合わせ管理
  INQUIRY_VIEW: 'inquiry:view',
  INQUIRY_CREATE: 'inquiry:create',
  INQUIRY_EDIT: 'inquiry:edit',
  INQUIRY_DELETE: 'inquiry:delete',
  INQUIRY_RESPOND: 'inquiry:respond',
  
  // 社員管理
  STAFF_VIEW: 'staff:view',
  STAFF_CREATE: 'staff:create',
  STAFF_EDIT: 'staff:edit',
  STAFF_DELETE: 'staff:delete',
  STAFF_PERMISSIONS: 'staff:permissions',
  
  // 勤怠管理
  ATTENDANCE_VIEW: 'attendance:view',
  ATTENDANCE_CREATE: 'attendance:create',
  ATTENDANCE_EDIT: 'attendance:edit',
  ATTENDANCE_APPROVE: 'attendance:approve',
  
  // 経費管理
  EXPENSE_VIEW: 'expense:view',
  EXPENSE_CREATE: 'expense:create',
  EXPENSE_EDIT: 'expense:edit',
  EXPENSE_APPROVE: 'expense:approve',
  
  // リフォーム管理
  REFORM_VIEW: 'reform:view',
  REFORM_CREATE: 'reform:create',
  REFORM_EDIT: 'reform:edit',
  REFORM_DELETE: 'reform:delete',
  
  // メディア管理
  MEDIA_VIEW: 'media:view',
  MEDIA_UPLOAD: 'media:upload',
  MEDIA_DELETE: 'media:delete',
  
  // レポート・分析
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',
  ANALYTICS_VIEW: 'analytics:view',
  
  // システム設定
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit'
}

// 役職別のデフォルト権限
export const ROLE_PERMISSIONS = {
  admin: [
    // 全権限
    ...Object.values(PERMISSIONS)
  ],
  manager: [
    // 管理職権限
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.PROPERTY_CREATE,
    PERMISSIONS.PROPERTY_EDIT,
    PERMISSIONS.PROPERTY_PUBLISH,
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_CREATE,
    PERMISSIONS.LEAD_EDIT,
    PERMISSIONS.LEAD_ASSIGN,
    PERMISSIONS.INQUIRY_VIEW,
    PERMISSIONS.INQUIRY_CREATE,
    PERMISSIONS.INQUIRY_EDIT,
    PERMISSIONS.INQUIRY_RESPOND,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_APPROVE,
    PERMISSIONS.EXPENSE_VIEW,
    PERMISSIONS.EXPENSE_APPROVE,
    PERMISSIONS.REFORM_VIEW,
    PERMISSIONS.REFORM_CREATE,
    PERMISSIONS.REFORM_EDIT,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SETTINGS_VIEW
  ],
  staff: [
    // 一般社員権限
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.PROPERTY_CREATE,
    PERMISSIONS.PROPERTY_EDIT,
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_CREATE,
    PERMISSIONS.LEAD_EDIT,
    PERMISSIONS.INQUIRY_VIEW,
    PERMISSIONS.INQUIRY_CREATE,
    PERMISSIONS.INQUIRY_EDIT,
    PERMISSIONS.INQUIRY_RESPOND,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_CREATE,
    PERMISSIONS.ATTENDANCE_EDIT,
    PERMISSIONS.EXPENSE_VIEW,
    PERMISSIONS.EXPENSE_CREATE,
    PERMISSIONS.EXPENSE_EDIT,
    PERMISSIONS.REFORM_VIEW,
    PERMISSIONS.REFORM_CREATE,
    PERMISSIONS.REFORM_EDIT,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.REPORT_VIEW
  ],
  part_time: [
    // パートタイム権限
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_CREATE,
    PERMISSIONS.INQUIRY_VIEW,
    PERMISSIONS.INQUIRY_CREATE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_CREATE,
    PERMISSIONS.EXPENSE_VIEW,
    PERMISSIONS.EXPENSE_CREATE,
    PERMISSIONS.REFORM_VIEW,
    PERMISSIONS.MEDIA_VIEW
  ]
}

// 社員の権限をチェック
export async function checkPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: staff, error } = await supabase
      .from('staff_members')
      .select('role, permissions')
      .eq('id', userId)
      .single()

    if (error || !staff) {
      return false
    }

    // 管理者は全権限を持つ
    if (staff.role === 'admin') {
      return true
    }

    // カスタム権限がある場合はそれをチェック
    if (staff.permissions && staff.permissions.includes(permission)) {
      return true
    }

    // 役職のデフォルト権限をチェック
    const rolePerms = ROLE_PERMISSIONS[staff.role as keyof typeof ROLE_PERMISSIONS] || []
    return rolePerms.includes(permission)
  } catch (error) {
    console.error('権限チェックエラー:', error)
    return false
  }
}

// 社員の全権限を取得
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data: staff, error } = await supabase
      .from('staff_members')
      .select('role, permissions')
      .eq('id', userId)
      .single()

    if (error || !staff) {
      return []
    }

    // 管理者は全権限を持つ
    if (staff.role === 'admin') {
      return Object.values(PERMISSIONS)
    }

    // カスタム権限と役職のデフォルト権限を結合
    const rolePerms = ROLE_PERMISSIONS[staff.role as keyof typeof ROLE_PERMISSIONS] || []
    const customPerms = staff.permissions || []
    
    return [...new Set([...rolePerms, ...customPerms])]
  } catch (error) {
    console.error('権限取得エラー:', error)
    return []
  }
}

// 社員の役職を取得
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: staff, error } = await supabase
      .from('staff_members')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || !staff) {
      return null
    }

    return staff.role
  } catch (error) {
    console.error('役職取得エラー:', error)
    return null
  }
}

// 社員の基本情報を取得
export async function getStaffMember(userId: string): Promise<StaffMember | null> {
  try {
    const supabase = await createClient()
    const { data: staff, error } = await supabase
      .from('staff_members')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !staff) {
      return null
    }

    return staff
  } catch (error) {
    console.error('社員情報取得エラー:', error)
    return null
  }
}

// 権限に基づいてメニュー項目をフィルタリング
export function filterMenuItemsByPermissions(
  menuItems: Array<{ id: string; permissions?: string[] }>,
  userPermissions: string[]
): Array<{ id: string; permissions?: string[] }> {
  return menuItems.filter(item => {
    if (!item.permissions || item.permissions.length === 0) {
      return true // 権限指定がない場合は表示
    }
    
    return item.permissions.some(permission => userPermissions.includes(permission))
  })
}

// 権限チェック用のユーティリティ関数（サーバーサイド用）
export async function checkUserPermissions(userId: string) {
  try {
    const [permissions, role] = await Promise.all([
      getUserPermissions(userId),
      getUserRole(userId)
    ])
    
    return {
      permissions,
      role,
      hasPermission: (permission: string) => permissions.includes(permission),
      hasAnyPermission: (requiredPermissions: string[]) => 
        requiredPermissions.some(permission => permissions.includes(permission)),
      hasAllPermissions: (requiredPermissions: string[]) => 
        requiredPermissions.every(permission => permissions.includes(permission))
    }
  } catch (error) {
    console.error('権限読み込みエラー:', error)
    return {
      permissions: [],
      role: null,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false
    }
  }
}
