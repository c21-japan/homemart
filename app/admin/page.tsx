'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface DashboardCard {
  title: string;
  description: string;
  icon: any;
  href: string;
  permission?: string;
  action?: string;
  count?: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({});

  // ダッシュボードカード定義
  const dashboardCards: DashboardCard[] = [
    {
      title: 'ユーザー管理',
      description: '社員・アルバイトの管理',
      icon: UsersIcon,
      href: '/admin/users',
      permission: 'user.read',
      action: 'ユーザー一覧',
      count: stats.userCount
    },
    {
      title: '物件管理',
      description: '物件情報の登録・編集',
      icon: BuildingOfficeIcon,
      href: '/admin/properties',
      permission: 'property.read',
      action: '物件一覧',
      count: stats.propertyCount
    },
    {
      title: 'リード管理',
      description: '顧客リードの管理',
      icon: UsersIcon,
      href: '/admin/leads',
      permission: 'lead.read',
      action: 'リード一覧',
      count: stats.leadCount
    },
    {
      title: '書類管理',
      description: '物件報告書等の管理',
      icon: DocumentTextIcon,
      href: '/admin/documents',
      permission: 'property.read',
      action: '書類一覧',
      count: stats.documentCount
    },
    {
      title: '内部申請',
      description: '各種申請の管理',
      icon: ClipboardDocumentListIcon,
      href: '/admin/internal-applications',
      permission: 'attendance.read',
      action: '申請一覧',
      count: stats.applicationCount
    },
    {
      title: '勤怠管理',
      description: '出退勤・シフト管理',
      icon: ClockIcon,
      href: '/admin/attendance',
      permission: 'attendance.read',
      action: '勤怠一覧',
      count: stats.attendanceCount
    },
    {
      title: 'レポート',
      description: '各種レポート・分析',
      icon: ChartBarIcon,
      href: '/admin/reports',
      permission: 'report.view',
      action: 'レポート表示',
      count: stats.reportCount
    }
  ];

  // 権限に基づいてカードをフィルタリング
  const filteredCards = dashboardCards.filter(card => {
    if (!card.permission) return true;
    return user?.permissions?.includes(card.permission);
  });

  // ユーザー情報取得（実際の実装では認証コンテキストから取得）
  useEffect(() => {
    // TODO: 認証コンテキストからユーザー情報を取得
    setUser({
      profile: {
        firstName: '佑企',
        lastName: '乾',
        employeeCode: 'HM001',
        department: '経営',
        position: '代表取締役'
      },
      role: 'owner',
      permissions: ['system.manage', 'user.read', 'property.read', 'lead.read', 'attendance.read', 'report.view']
    });

    // TODO: 実際の統計データを取得
    setStats({
      userCount: 8,
      propertyCount: 24,
      leadCount: 156,
      documentCount: 89,
      applicationCount: 12,
      attendanceCount: 45,
      reportCount: 5
    });
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-2 text-gray-600">
          お疲れ様です、{user.profile.lastName} {user.profile.firstName}さん
        </p>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {user.role === 'owner' ? 'オーナー' : 
             user.role === 'manager' ? 'マネージャー' : 
             user.role === 'staff' ? 'スタッフ' : 'パートタイム'}
          </span>
          <span className="ml-2">{user.profile.department} - {user.profile.position}</span>
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.userCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">登録物件数</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.propertyCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブリード</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.leadCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">今日の出勤</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.attendanceCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">クイックアクション</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card) => (
              <div key={card.title} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <card.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{card.title}</h3>
                      <p className="text-xs text-gray-500">{card.description}</p>
                    </div>
                  </div>
                  {card.count !== undefined && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {card.count}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex space-x-2">
                  <Link
                    href={card.href}
                    className="flex-1 bg-blue-600 text-white text-xs px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
                  >
                    <EyeIcon className="h-4 w-4 inline mr-1" />
                    {card.action}
                  </Link>
                  {card.permission?.includes('create') && (
                    <Link
                      href={`${card.href}/new`}
                      className="bg-green-600 text-white text-xs px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近のアクティビティ */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">最近のアクティビティ</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-600">新しいリードが登録されました</span>
              <span className="ml-auto text-gray-400">2時間前</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600">物件情報が更新されました</span>
              <span className="ml-auto text-gray-400">4時間前</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-gray-600">新しい内部申請が提出されました</span>
              <span className="ml-auto text-gray-400">6時間前</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
