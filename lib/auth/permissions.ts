// 権限レベル
export enum UserRole {
  OWNER = 'owner',        // オーナー（乾代表）
  ADMIN = 'admin',        // 管理者
  STAFF = 'staff'         // 社員
}

// 操作権限の種類
export enum PermissionType {
  VIEW = 'view',          // 閲覧
  CREATE = 'create',      // 作成
  EDIT = 'edit',          // 編集
  DELETE = 'delete',      // 削除
  APPROVE = 'approve',    // 承認
  EXPORT = 'export'       // エクスポート
}

// ページごとの権限設定
export interface PagePermissions {
  path: string
  name: string
  description: string
  permissions: PermissionType[]
  requiredRole: UserRole
  isSensitive: boolean // 機密情報かどうか
}

// ページ権限の詳細設定
export const PAGE_PERMISSIONS: PagePermissions[] = [
  {
    path: '/admin',
    name: 'ダッシュボード',
    description: '管理画面のトップページ',
    permissions: [PermissionType.VIEW],
    requiredRole: UserRole.STAFF,
    isSensitive: false
  },
  {
    path: '/admin/leads',
    name: 'リード管理',
    description: '顧客リード情報の管理',
    permissions: [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
    requiredRole: UserRole.STAFF,
    isSensitive: true
  },
  {
    path: '/admin/properties',
    name: '物件管理',
    description: '不動産物件情報の管理',
    permissions: [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
    requiredRole: UserRole.STAFF,
    isSensitive: true
  },
  {
    path: '/admin/internal-applications',
    name: '社内申請',
    description: '社内申請書類の管理',
    permissions: [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT, PermissionType.APPROVE],
    requiredRole: UserRole.STAFF,
    isSensitive: true
  },
  {
    path: '/admin/part-time-attendance',
    name: 'アルバイト勤怠',
    description: 'アルバイトの勤怠管理',
    permissions: [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
    requiredRole: UserRole.STAFF,
    isSensitive: true
  },
  {
    path: '/admin/users',
    name: 'ユーザー管理',
    description: '社員アカウントと権限の管理',
    permissions: [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT, PermissionType.DELETE],
    requiredRole: UserRole.ADMIN,
    isSensitive: true
  },
  {
    path: '/admin/documents',
    name: '書類管理',
    description: '社内書類の管理',
    permissions: [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT, PermissionType.DELETE],
    requiredRole: UserRole.ADMIN,
    isSensitive: true
  },
  {
    path: '/admin/attendance',
    name: '勤怠管理',
    description: '社員の勤怠管理',
    permissions: [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT, PermissionType.APPROVE],
    requiredRole: UserRole.ADMIN,
    isSensitive: true
  },
  {
    path: '/admin/reports',
    name: 'レポート',
    description: '各種レポートの閲覧・出力',
    permissions: [PermissionType.VIEW, PermissionType.EXPORT],
    requiredRole: UserRole.ADMIN,
    isSensitive: true
  },
  {
    path: '/admin/career-path',
    name: 'キャリアパス管理',
    description: '社員のキャリアパス管理',
    permissions: [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
    requiredRole: UserRole.ADMIN,
    isSensitive: true
  },
  {
    path: '/admin/team-performance',
    name: 'チーム成績管理',
    description: 'チームの成績・評価管理',
    permissions: [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
    requiredRole: UserRole.ADMIN,
    isSensitive: true
  },
  {
    path: '/admin/reform-workers',
    name: 'リフォーム職人管理',
    description: 'リフォーム職人の情報管理',
    permissions: [PermissionType.VIEW, PermissionType.CREATE, PermissionType.EDIT],
    requiredRole: UserRole.ADMIN,
    isSensitive: true
  }
];

// 権限設定
export const PERMISSIONS = {
  [UserRole.OWNER]: {
    name: 'オーナー',
    description: '全ての機能にアクセス可能',
    canManageUsers: true,
    canManagePermissions: true,
    canAccessAllPages: true,
    canManageSystem: true,
    pages: ['*'] // 全ページアクセス可能
  },
  [UserRole.ADMIN]: {
    name: '管理者',
    description: '管理機能にアクセス可能',
    canManageUsers: true,
    canManagePermissions: false,
    canAccessAllPages: false,
    canManageSystem: false,
    pages: [
      '/admin',
      '/admin/dashboard',
      '/admin/leads',
      '/admin/properties',
      '/admin/internal-applications',
      '/admin/part-time-attendance',
      '/admin/users',
      '/admin/documents',
      '/admin/attendance',
      '/admin/reports',
      '/admin/career-path',
      '/admin/team-performance',
      '/admin/reform-workers'
    ]
  },
  [UserRole.STAFF]: {
    name: '社員',
    description: '限定的な機能にアクセス可能',
    canManageUsers: false,
    canManagePermissions: false,
    canAccessAllPages: false,
    canManageSystem: false,
    pages: [
      '/admin',
      '/admin/dashboard',
      '/admin/leads',
      '/admin/properties',
      '/admin/internal-applications',
      '/admin/part-time-attendance'
    ]
  }
};

// 管理者のメールアドレスリスト
export const ADMIN_EMAILS = [
  'y-inui@century21.group',  // 乾代表（オーナー）
  'm-yasuda@century21.group', // 安田実加
  'info@century21.group',     // 山尾妃奈
  't-toyoda@century21.group', // 豊田
  'm-imadu@century21.group'   // 今津
];

// オーナーのメールアドレス
export const OWNER_EMAILS = [
  'y-inui@century21.group'  // 乾代表
];

// ユーザーごとの詳細権限設定
export interface UserPermissions {
  userId: string
  email: string
  role: UserRole
  pagePermissions: {
    [pagePath: string]: PermissionType[]
  }
  customPermissions: {
    [permission: string]: boolean
  }
}

// 権限チェック関数
export function hasPermission(userRole: UserRole, permission: keyof typeof PERMISSIONS[UserRole]) {
  return PERMISSIONS[userRole]?.[permission] || false;
}

// ページアクセス権限チェック
export function canAccessPage(userRole: UserRole, pagePath: string): boolean {
  const userPermissions = PERMISSIONS[userRole];
  if (!userPermissions) return false;
  
  // オーナーは全ページアクセス可能
  if (userRole === UserRole.OWNER) return true;
  
  // 特定のページへのアクセス権限チェック
  return userPermissions.pages.includes(pagePath) || 
         userPermissions.pages.some(page => pagePath.startsWith(page));
}

// ページでの操作権限チェック
export function canPerformAction(
  userRole: UserRole, 
  pagePath: string, 
  action: PermissionType
): boolean {
  // オーナーは全ての操作が可能
  if (userRole === UserRole.OWNER) return true;
  
  // ページの権限設定を取得
  const pagePermission = PAGE_PERMISSIONS.find(p => p.path === pagePath);
  if (!pagePermission) return false;
  
  // 必要な権限レベルをチェック
  if (userRole < pagePermission.requiredRole) return false;
  
  // 操作権限をチェック
  return pagePermission.permissions.includes(action);
}

// 機密情報へのアクセス権限チェック
export function canAccessSensitiveInfo(userRole: UserRole, pagePath: string): boolean {
  // オーナーは全ての機密情報にアクセス可能
  if (userRole === UserRole.OWNER) return true;
  
  // ページの権限設定を取得
  const pagePermission = PAGE_PERMISSIONS.find(p => p.path === pagePath);
  if (!pagePermission) return false;
  
  // 機密情報でない場合はアクセス可能
  if (!pagePermission.isSensitive) return true;
  
  // 機密情報の場合は管理者以上のみアクセス可能
  return userRole >= UserRole.ADMIN;
}

// ユーザー登録時の権限設定
export function getDefaultRole(email: string): UserRole {
  if (OWNER_EMAILS.includes(email)) {
    return UserRole.OWNER;
  }
  if (ADMIN_EMAILS.includes(email)) {
    return UserRole.ADMIN;
  }
  return UserRole.STAFF;
}

// デフォルトのページ権限を取得
export function getDefaultPagePermissions(userRole: UserRole): { [pagePath: string]: PermissionType[] } {
  const permissions: { [pagePath: string]: PermissionType[] } = {};
  
  PAGE_PERMISSIONS.forEach(page => {
    if (userRole >= page.requiredRole) {
      permissions[page.path] = page.permissions;
    }
  });
  
  return permissions;
}
