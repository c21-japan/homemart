'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UsersIcon, 
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export default function AdminNavigation() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { href: '/admin', label: 'ダッシュボード', icon: HomeIcon },
    { href: '/admin/properties', label: '物件管理', icon: BuildingOfficeIcon },
    { href: '/admin/leads', label: 'リード管理', icon: UsersIcon },
    { href: '/admin/inquiries', label: 'お問い合わせ', icon: UsersIcon },
    { href: '/admin/documents', label: '書類管理', icon: DocumentTextIcon },
    { href: '/admin/internal-applications', label: '内部申請', icon: ClipboardDocumentListIcon },
    { href: '/admin/part-time-attendance', label: 'アルバイト勤怠', icon: ChartBarIcon }
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
      <div className="flex flex-col h-full">
        {/* ロゴ */}
        <div className="px-6 py-4 bg-gray-800">
          <h2 className="text-xl font-bold text-white">
            ホームマート管理画面
          </h2>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ログアウトボタン */}
        <div className="px-4 py-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </div>
  );
}
