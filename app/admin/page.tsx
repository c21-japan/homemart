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
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface DashboardCard {
  title: string;
  description: string;
  icon: any;
  href: string;
  action?: string;
  count?: number;
  gradient: string;
  iconColor: string;
}

interface StatCard {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: any;
  color: string;
  bgColor: string;
}

interface Activity {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  time: string;
  user?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // 統計カード定義
  const statCards: StatCard[] = [
    {
      title: '総ユーザー数',
      value: stats.userCount || 0,
      change: 12.5,
      changeType: 'increase',
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    {
      title: '登録物件数',
      value: stats.propertyCount || 0,
      change: 8.2,
      changeType: 'increase',
      icon: BuildingOfficeIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100'
    },
    {
      title: 'アクティブリード',
      value: stats.leadCount || 0,
      change: -3.1,
      changeType: 'decrease',
      icon: ArrowTrendingUpIcon,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100'
    },
    {
      title: '今日の出勤者',
      value: stats.attendanceCount || 0,
      change: 5.7,
      changeType: 'increase',
      icon: ClockIcon,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100'
    }
  ];

  // ダッシュボードカード定義
  const dashboardCards: DashboardCard[] = [
    {
      title: 'ユーザー管理',
      description: '社員・アルバイトの管理',
      icon: UsersIcon,
      href: '/admin/users',
      action: 'ユーザー一覧',
      count: stats.userCount,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'text-blue-600'
    },
    {
      title: '物件管理',
      description: '物件情報の登録・編集',
      icon: BuildingOfficeIcon,
      href: '/admin/properties',
      action: '物件一覧',
      count: stats.propertyCount,
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'リード管理',
      description: '顧客リードの管理',
      icon: ArrowTrendingUpIcon,
      href: '/admin/leads',
      action: 'リード一覧',
      count: stats.leadCount,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      iconColor: 'text-orange-600'
    },
    {
      title: '書類管理',
      description: '物件報告書等の管理',
      icon: DocumentTextIcon,
      href: '/admin/documents',
      action: '書類一覧',
      count: stats.documentCount,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconColor: 'text-purple-600'
    },
    {
      title: '内部申請',
      description: '各種申請の管理',
      icon: ClipboardDocumentListIcon,
      href: '/admin/internal-applications',
      action: '申請一覧',
      count: stats.applicationCount,
      gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconColor: 'text-amber-600'
    },
    {
      title: 'レポート',
      description: '各種レポート・分析',
      icon: ChartBarIcon,
      href: '/admin/reports',
      action: 'レポート表示',
      count: stats.reportCount,
      gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      iconColor: 'text-indigo-600'
    },
    {
      title: '勤怠管理',
      description: '従業員の勤怠記録管理',
      icon: ClockIcon,
      href: '/admin/attendance',
      action: '勤怠一覧',
      count: stats.attendanceCount,
      gradient: 'bg-gradient-to-br from-teal-500 to-teal-600',
      iconColor: 'text-teal-600'
    },
    {
      title: 'アルバイト勤怠管理',
      description: 'アルバイトのGPS位置情報付き勤怠管理',
      icon: CalendarDaysIcon,
      href: '/admin/part-time-attendance',
      action: 'アルバイト勤怠',
      count: stats.partTimeAttendanceCount,
      gradient: 'bg-gradient-to-br from-pink-500 to-pink-600',
      iconColor: 'text-pink-600'
    }
  ];

  // 検索フィルタリング
  const filteredCards = dashboardCards.filter(card =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // アクティビティログ
  const recentActivities: Activity[] = [
    {
      id: '1',
      type: 'success',
      message: '新しいリードが登録されました（田中様）',
      time: '2時間前',
      user: '佐藤'
    },
    {
      id: '2',
      type: 'info',
      message: '物件情報が更新されました（物件ID: P-001）',
      time: '4時間前',
      user: '山田'
    },
    {
      id: '3',
      type: 'warning',
      message: '新しい内部申請が提出されました',
      time: '6時間前',
      user: '田中'
    },
    {
      id: '4',
      type: 'success',
      message: '月次レポートが生成されました',
      time: '8時間前',
      user: 'システム'
    }
  ];

  // 統計データの初期化
  useEffect(() => {
    setStats({
      userCount: 28,
      propertyCount: 147,
      leadCount: 89,
      documentCount: 234,
      applicationCount: 12,
      attendanceCount: 18,
      reportCount: 15
    });

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">おかえりなさい！</h1>
            <p className="text-orange-100 text-lg">
              今日も一日お疲れ様です。管理業務を効率的に進めましょう。
            </p>
            <div className="mt-4 flex items-center space-x-4 text-sm text-orange-100">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                {currentTime.toLocaleDateString('ja-JP', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {currentTime.toLocaleTimeString('ja-JP')}
              </div>
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-orange-100 mb-1">今日のタスク</p>
              <p className="text-2xl font-bold">12 / 15</p>
              <div className="w-full bg-orange-400 bg-opacity-30 rounded-full h-2 mt-2">
                <div className="bg-white h-2 rounded-full" style={{width: '80%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-2xl p-6 border border-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'increase' ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-sm text-slate-500 ml-1">前月比</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-white shadow-sm`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 検索ボックス */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="px-8 py-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">機能検索</h2>
          <p className="text-slate-600 mt-1">管理画面の各機能を素早く見つける</p>
        </div>
        <div className="p-8">
          <div className="relative">
            <input
              type="text"
              placeholder="機能名や説明を入力してください..."
              className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* 検索結果 */}
          {searchQuery && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">検索結果</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCards.map((card, index) => (
                  <Link
                    key={index}
                    href={card.href}
                    className="group block p-4 border border-slate-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${card.gradient} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-200`}>
                        <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 group-hover:text-orange-600 transition-colors">
                          {card.title}
                        </h4>
                        <p className="text-sm text-slate-600">{card.description}</p>
                      </div>
                      <div className="text-slate-400 group-hover:text-orange-500 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {filteredCards.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <svg className="h-12 w-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-lg font-medium">該当する機能が見つかりません</p>
                  <p className="text-sm">別のキーワードで検索してみてください</p>
                </div>
              )}
            </div>
          )}
          
          {/* 全機能一覧 */}
          {!searchQuery && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">全機能一覧</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardCards.map((card, index) => (
                  <Link
                    key={index}
                    href={card.href}
                    className="group block p-4 border border-slate-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${card.gradient} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-200`}>
                        <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 group-hover:text-orange-600 transition-colors">
                          {card.title}
                        </h4>
                        <p className="text-sm text-slate-600">{card.description}</p>
                      </div>
                      <div className="text-slate-400 group-hover:text-orange-500 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="px-8 py-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">クイックアクション</h2>
          <p className="text-slate-600 mt-1">よく使用する機能に素早くアクセス</p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${card.gradient} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
                      <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-sm text-slate-500">{card.description}</p>
                    </div>
                  </div>
                  {card.count !== undefined && (
                    <div className="flex flex-col items-end">
                      <span className={`${card.gradient} text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg`}>
                        {card.count}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Link
                    href={card.href}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center group-hover:shadow-md"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    {card.action}
                  </Link>
                  <Link
                    href={`${card.href}/new`}
                    className={`${card.gradient} hover:shadow-lg text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center transform hover:scale-105`}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最近のアクティビティ */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="px-8 py-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">最近のアクティビティ</h2>
                <p className="text-slate-600 text-sm mt-1">システム内の最新の動きをチェック</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-slate-500">{activity.time}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">by {activity.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200">
              <Link
                href="/admin/activity-log"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center justify-center py-2 hover:bg-orange-50 rounded-lg transition-colors"
              >
                すべてのアクティビティを表示
                <ArrowUpIcon className="h-4 w-4 ml-1 rotate-45" />
              </Link>
            </div>
          </div>
        </div>

        {/* パフォーマンス概要 */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="px-8 py-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">今月のパフォーマンス</h2>
            <p className="text-slate-600 text-sm mt-1">チーム全体の業績概要</p>
          </div>
          <div className="p-8">
            <div className="space-y-6">
              {/* 売上目標 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">売上目標達成率</span>
                  <span className="text-sm font-bold text-green-600">87%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full shadow-sm" style={{width: '87%'}}></div>
                </div>
              </div>

              {/* リード変換率 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">リード変換率</span>
                  <span className="text-sm font-bold text-blue-600">23%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full shadow-sm" style={{width: '23%'}}></div>
                </div>
              </div>

              {/* 顧客満足度 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">顧客満足度</span>
                  <span className="text-sm font-bold text-purple-600">94%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-3 rounded-full shadow-sm" style={{width: '94%'}}></div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">¥24.8M</p>
                <p className="text-sm text-blue-700 font-medium">今月の売上</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">156</p>
                <p className="text-sm text-green-700 font-medium">成約件数</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <Link
                href="/admin/reports"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center justify-center py-2 hover:bg-orange-50 rounded-lg transition-colors"
              >
                詳細レポートを表示
                <ChartBarIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 今日のタスク・リマインダー */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">今日のリマインダー</h2>
            <div className="space-y-2">
              <div className="flex items-center text-slate-300">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                <span>チームミーティング 14:00 - 会議室A</span>
              </div>
              <div className="flex items-center text-slate-300">
                <ClockIcon className="h-5 w-5 text-yellow-400 mr-3" />
                <span>月次レポート作成締切 - 今日中</span>
              </div>
              <div className="flex items-center text-slate-300">
                <UsersIcon className="h-5 w-5 text-blue-400 mr-3" />
                <span>新人研修フォローアップ - 田中さん</span>
              </div>
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <Link
              href="/admin/calendar"
              className="bg-white text-slate-900 px-6 py-3 rounded-xl font-medium hover:bg-slate-100 transition-colors inline-flex items-center"
            >
              <CalendarDaysIcon className="h-5 w-5 mr-2" />
              カレンダーを表示
            </Link>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-[#121212] text-white py-28 mt-16" id="footer">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2 pr-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#BEAF87] rounded-lg flex items-center justify-center">
                  <i className="fas fa-home text-[#121212]"></i>
                </div>
                <div>
                  <div className="text-xl font-bold">ホームマート</div>
                  <div className="text-sm text-[#BEAF87]">CENTURY 21</div>
                </div>
              </div>
              <p className="text-white/70 mb-6 leading-relaxed">
                奈良県で10年間、お客様の不動産に関するあらゆるニーズにお応えしてまいりました。
                これからもCENTURY 21のネットワークを活かし、最高のサービスを提供いたします。
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-[#BEAF87] hover:text-[#121212]">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-[#BEAF87] hover:text-[#121212]">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-[#BEAF87] hover:text-[#121212]">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6 text-[#BEAF87]">サービス</h4>
              <ul className="space-y-3">
                <li><a href="#catalog" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">物件検索</a></li>
                <li><a href="#comparison" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">売却査定</a></li>
                <li><a href="#features" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">リフォーム</a></li>
                <li><a href="#process" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">買取再販</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6 text-[#BEAF87]">会社情報</h4>
              <ul className="space-y-3">
                <li><a className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300" href="/about">会社概要</a></li>
                <li><a href="/access" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">アクセス</a></li>
                <li><a href="/recruit" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">採用情報</a></li>
                <li><a href="/news" className="text-white/70 hover:text-[#BEAF87] transition-colors duration-300">お知らせ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6 text-[#BEAF87]">お問い合わせ</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-white/70">
                  <i className="fas fa-phone mr-2 text-[#BEAF87]"></i>0120-43-8639
                </li>
                <li className="flex items-center text-white/70">
                  <i className="fas fa-envelope mr-2 text-[#BEAF87]"></i>info@homemart-nara.com
                </li>
                <li className="flex items-start text-white/70">
                  <i className="fas fa-map-marker-alt mr-2 mt-1 text-[#BEAF87]"></i>奈良県北葛城郡広陵町笠287-1
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#BEAF87]/20 flex justify-between items-center flex-wrap gap-4">
            <p className="text-white/50 text-sm">© 2025 ホームマート（CENTURY 21加盟店）. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a className="text-white/50 hover:text-[#BEAF87] transition-colors duration-300" href="/privacy">プライバシーポリシー</a>
              <a className="text-white/50 hover:text-[#BEAF87] transition-colors duration-300" href="/terms">利用規約</a>
              <a className="text-white/50 hover:text-[#BEAF87] transition-colors duration-300" href="/disclaimer">免責事項</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
