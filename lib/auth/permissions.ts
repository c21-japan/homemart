export const PERMISSION_TYPES = {
  VIEW: '閲覧',
  CREATE: '新規作成',
  EDIT: '編集',
  DELETE: '削除',
  APPROVE: '承認',
  EXPORT: 'エクスポート'
} as const

export type PermissionType = keyof typeof PERMISSION_TYPES

export const FEATURES = {
  DASHBOARD: 'ダッシュボード',
  CUSTOMERS: '顧客管理',
  PROPERTIES: '物件管理',
  LEADS: 'リード管理',
  INQUIRIES: '問い合わせ管理',
  DOCUMENTS: '書類管理',
  INTERNAL_APPLICATIONS: '社内申請',
  ATTENDANCE: '勤怠管理',
  PART_TIME_ATTENDANCE: 'アルバイト勤怠',
  FLYERS: 'チラシマーケティング',
  REFORM_PROJECTS: '施工実績',
  REFORM_WORKERS: 'リフォーム職人管理',
  TEAM_PERFORMANCE: 'チーム成績',
  CAREER_PATH: 'キャリアパス',
  MEDIA: 'メディア管理',
  USERS: 'ユーザー管理',
  SETTINGS: '設定',
  REPORTS: 'レポート'
} as const

export type Feature = keyof typeof FEATURES

export type UserPermissions = {
  [K in Feature]?: PermissionType[]
}

export type Role = 'OWNER' | 'ADMIN' | 'STAFF'

export function hasPermission(
  userPermissions: UserPermissions,
  feature: Feature,
  permissionType: PermissionType
): boolean {
  const featurePermissions = userPermissions[feature]
  if (!featurePermissions) return false
  return featurePermissions.includes(permissionType)
}

export function canEditPermissions(currentUserRole: Role, targetUserRole: Role): boolean {
  if (currentUserRole === 'OWNER') return true
  if (currentUserRole === 'ADMIN' && targetUserRole === 'STAFF') return true
  return false
}
