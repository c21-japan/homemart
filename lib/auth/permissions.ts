// 権限レベル
export enum UserRole {
  OWNER = 'owner',        // オーナー（乾代表）
  ADMIN = 'admin',        // 管理者
  STAFF = 'staff'         // 社員
}

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
