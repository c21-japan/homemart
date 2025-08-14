'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
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
  const [loading, setLoading] = useState(true);

  // ログインページは認証チェックをスキップ
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [pathname, isLoginPage]);

  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // Supabaseセッションを確認
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/admin/login');
        return;
      }

      // ユーザー情報を取得
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.push('/admin/login');
        return;
      }

      // 管理者権限を確認
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .eq('role', 'admin')
        .single();

      if (adminError || !adminUser) {
        console.error('管理者権限がありません');
        await supabase.auth.signOut();
        router.push('/admin/login');
        return;
      }

      setUser(user);
    } catch (error) {
      console.error('認証エラー:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ログインページの場合はchildrenのみ表示
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 認証されていない場合は何も表示しない
  if (!user) {
    return null;
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
              {user.email}
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
