'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  CurrencyYenIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon as ClockOutlineIcon
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // サンプルデータ
    setTimeout(() => {
      setStats({
        revenue: {
          current: 8500000,
          previous: 7200000,
          growth: 18.1
        },
        leads: {
          total: 156,
          new: 23,
          hot: 12,
          contacted: 45
        },
        properties: {
          total: 24,
          active: 18,
          pending: 4,
          sold: 2
        },
        team: {
          total: 8,
          present: 6,
          absent: 2
        },
        tasks: {
          urgent: 3,
          today: 8,
          overdue: 2
        }
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  const quickStats = [
    {
      title: '今月の売上',
      value: `¥${stats.revenue.current.toLocaleString()}`,
      change: `+${stats.revenue.growth}%`,
      changeType: 'increase',
      icon: CurrencyYenIcon,
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
      href: '/admin/reports'
    },
    {
      title: 'アクティブリード',
      value: stats.leads.total,
      subtext: `新規 ${stats.leads.new}件`,
      icon: UserGroupIcon,
      bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      href: '/admin/leads',
      badge: stats.leads.hot > 0 ? `HOT ${stats.leads.hot}` : null
    },
    {
      title: '登録物件',
      value: stats.properties.total,
      subtext: `成約 ${stats.properties.sold}件`,
      icon: BuildingOfficeIcon,
      bgColor: 'bg-gradient-to-br from-purple-500 to-pink-600',
      href: '/admin/properties'
    },
    {
      title: '本日の出勤',
      value: `${stats.team.present}/${stats.team.total}`,
      subtext: '出勤率 75%',
      icon: ClockIcon,
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-600',
      href: '/admin/attendance'
    }
  ];

  const recentActivities = [
    { type: 'lead', message: '山田太郎様から新規問い合わせ', time: '10分前', status: 'new' },
    { type: 'property', message: '広陵町の物件が成約', time: '2時間前', status: 'success' },
    { type: 'task', message: '物件写真撮影の予定', time: '3時間前', status: 'pending' },
    { type: 'alert', message: '契約書類の提出期限', time: '5時間前', status: 'warning' }
  ];

  const upcomingTasks = [
    { title: '物件内覧（田中様）', time: '14:00', location: '広陵町百済', priority: 'high' },
    { title: 'リフォーム見積もり作成', time: '16:00', location: 'オフィス', priority: 'medium' },
    { title: '月次レポート作成', time: '18:00', location: 'オフィス', priority: 'low' }
  ];

  return (
    <div className="space-y-6">
      {/* ウェルカムメッセージ */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">おはようございます、乾代表</h1>
            <p className="text-orange-100 text-lg">
              今日も素晴らしい一日にしましょう。現在{stats.tasks.urgent}件の緊急タスクがあります。
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}</div>
            <div className="text-orange-100">{new Date().toLocaleDateString('ja-JP', { weekday: 'long' })}</div>
          </div>
        </div>
      </div>

      {/* クイック統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Link 
            key={index}
            href={stat.href}
            className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute inset-0 ${stat.bgColor} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                {stat.badge && (
                  <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {stat.badge}
                  </span>
                )}
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                {stat.change && (
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                )}
                {stat.subtext && (
                  <p className="text-gray-500 text-sm mt-1">{stat.subtext}</p>
                )}
              </div>
              <ArrowRightIcon className="absolute bottom-4 right-4 h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 今日のタスク */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">今日のスケジュール</h2>
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                {upcomingTasks.length}件
              </span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="flex items-center text-xs text-gray-500">
                          <ClockOutlineIcon className="h-3 w-3 mr-1" />
                          {task.time}
                        </span>
                        <span className="flex items-center text-xs text-gray-500">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          {task.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Link 
              href="/admin/calendar"
              className="block w-full text-center py-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              すべて表示 →
            </Link>
          </div>
        </div>

        {/* 最近の活動 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">最近の活動</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'new' ? 'bg-blue-100' :
                    activity.status === 'success' ? 'bg-green-100' :
                    activity.status === 'warning' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    {activity.status === 'new' && <EnvelopeIcon className="h-4 w-4 text-blue-600" />}
                    {activity.status === 'success' && <CheckCircleIcon className="h-4 w-4 text-green-600" />}
                    {activity.status === 'warning' && <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />}
                    {activity.status === 'pending' && <ClockOutlineIcon className="h-4 w-4 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/admin/leads/new"
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center group"
        >
          <div className="inline-flex p-3 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors mb-2">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">新規リード登録</p>
        </Link>
        
        <Link
          href="/admin/properties/new"
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center group"
        >
          <div className="inline-flex p-3 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors mb-2">
            <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">物件登録</p>
        </Link>
        
        <Link
          href="/admin/documents/new"
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center group"
        >
          <div className="inline-flex p-3 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors mb-2">
            <DocumentTextIcon className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">書類作成</p>
        </Link>
        
        <Link
          href="/admin/reports"
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center group"
        >
          <div className="inline-flex p-3 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors mb-2">
            <ChartBarIcon className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">レポート確認</p>
        </Link>
      </div>
    </div>
  );
}
