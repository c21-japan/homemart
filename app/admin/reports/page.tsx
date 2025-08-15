'use client';

import { useState, useEffect } from 'react';

export default function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        // モックデータ
        const mockData = {
          summary: {
            totalProperties: 24,
            totalLeads: 156,
            totalUsers: 8,
            totalContracts: 12
          },
          monthlyStats: [
            { month: '1月', properties: 18, leads: 120, contracts: 8 },
            { month: '2月', properties: 20, leads: 135, contracts: 10 },
            { month: '3月', properties: 22, leads: 145, contracts: 11 },
            { month: '4月', properties: 24, leads: 156, contracts: 12 }
          ],
          topPerformers: [
            { name: '田中太郎', contracts: 5, revenue: '¥2,500,000' },
            { name: '佐藤花子', contracts: 4, revenue: '¥2,000,000' },
            { name: '山田次郎', contracts: 3, revenue: '¥1,500,000' }
          ]
        };
        setReportData(mockData);
      } catch (error) {
        console.error('レポートデータ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">レポート・分析</h1>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="week">今週</option>
          <option value="month">今月</option>
          <option value="quarter">四半期</option>
          <option value="year">年間</option>
        </select>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総物件数</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData.summary.totalProperties}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総リード数</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData.summary.totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData.summary.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総契約数</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData.summary.totalContracts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 月次統計 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">月次統計</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物件数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">リード数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">契約数</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.monthlyStats.map((stat, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.properties}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.leads}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.contracts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* トップパフォーマー */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">トップパフォーマー</h2>
        <div className="space-y-4">
          {reportData.topPerformers.map((performer, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {index + 1}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                  <p className="text-sm text-gray-500">{performer.contracts}件の契約</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{performer.revenue}</p>
                <p className="text-sm text-gray-500">売上</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
