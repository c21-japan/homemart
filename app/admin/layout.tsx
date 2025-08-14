'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  HomeIcon, 
  UsersIcon, 
  BuildingOfficeIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  permission?: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // メニュー項目（権限で制御）
  const menuItems: MenuItem[] = [
    { name: 'ダッシュボード', href: '/admin', icon: HomeIcon },
    { name: 'ユーザー管理', href: '/admin/users', icon: UsersIcon, permission: 'user.read' },
    { name: '物件管理', href: '/admin/properties', icon: BuildingOfficeIcon, permission: 'property.read' },
    { name: 'リード管理', href: '/admin/leads', icon: UsersIcon, permission: 'lead.read' },
    { name: '書類管理', href: '/admin/documents', icon: DocumentTextIcon, permission: 'property.read' },
    { name: '内部申請', href: '/admin/internal-applications', icon: ClipboardDocumentListIcon, permission: 'attendance.read' },
    { name: '勤怠管理', href: '/admin/attendance', icon: ClockIcon, permission: 'attendance.read' },
    { name: 'レポート', href: '/admin/reports', icon: ChartBarIcon, permission: 'report.view' },
    { name: '設定', href: '/admin/settings', icon: Cog6ToothIcon, permission: 'system.manage' },
  ];

  // 権限に基づいてメニューをフィルタリング
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return user?.permissions?.includes(item.permission);
  });

  // ログアウト処理
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/admin/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ユーザー情報取得（実際の実装では認証コンテキストから取得）
  useEffect(() => {
    // TODO: 認証コンテキストからユーザー情報を取得
    // 仮のユーザー情報
    setUser({
      profile: {
        firstName: '佑企',
        lastName: '乾',
        employeeCode: 'HM001',
        department: '経営',
        position: '代表取締役',
        avatarUrl: '/default-avatar.png'
      },
      role: 'owner',
      permissions: ['system.manage', 'user.read', 'property.read', 'lead.read', 'attendance.read', 'report.view']
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* モバイルサイドバー */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HM</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">ホームマート</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center">
              <img
                className="h-8 w-8 rounded-full"
                src={user?.profile?.avatarUrl || '/default-avatar.png'}
                alt=""
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.profile?.lastName} {user?.profile?.firstName}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-3 flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        </div>
      </div>

      {/* デスクトップサイドバー */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HM</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">ホームマート</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center">
              <img
                className="h-8 w-8 rounded-full"
                src={user?.profile?.avatarUrl || '/default-avatar.png'}
                alt=""
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.profile?.lastName} {user?.profile?.firstName}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-3 flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="lg:pl-64">
        {/* ヘッダー */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* 通知やその他のアイコン */}
            </div>
          </div>
        </div>

        {/* ページコンテンツ */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
