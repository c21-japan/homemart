'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // ログインページは認証チェックをスキップ
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/admin/login');
      } else {
        setUser(JSON.parse(userData));
      }
    }
  }, [pathname, router, isLoginPage]);

  // ログアウト処理
  const handleLogout = () => {
    localStorage.clear();
    router.push('/admin/login');
  };

  // ログインページの場合はchildrenのみ表示
  if (isLoginPage) {
    return <>{children}</>;
  }

  const menuItems = [
    { name: 'ダッシュボード', href: '/admin', icon: HomeIcon },
    { name: '物件管理', href: '/admin/properties', icon: BuildingOfficeIcon },
    { name: 'リフォーム案件', href: '/admin/reform-projects', icon: DocumentTextIcon },
    { name: '見込み客', href: '/admin/leads', icon: UserGroupIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* サイドバー */}
        <div className="w-64 bg-gray-900 min-h-screen">
          <div className="p-4">
            <h2 className="text-white text-xl font-bold">ホームマート管理</h2>
            <p className="text-white text-sm opacity-75 mt-1">
              {user?.email}
            </p>
          </div>
          <nav className="mt-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white ${
                  pathname === item.href ? 'bg-gray-700 text-white' : ''
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white mt-8"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
              ログアウト
            </button>
          </nav>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
