'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listLeads, getLeadStats, LeadFilter, Lead, LeadStats } from '@/app/(secure)/actions/leads';
import { LeadType, LeadStatus } from '@/types/leads';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadFilter>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [filter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const result = await listLeads(filter);
      if (result.success && result.data) {
        setLeads(result.data);
      } else {
        console.error('Failed to fetch leads:', result.error);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await getLeadStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key: keyof LeadFilter, value: string | undefined) => {
    setFilter(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleSearch = () => {
    setFilter(prev => ({
      ...prev,
      search: searchTerm || undefined
    }));
  };

  const clearFilters = () => {
    setFilter({});
    setSearchTerm('');
  };

  const getTypeLabel = (type: LeadType) => {
    const labels = {
      purchase: '購入',
      sell: '売却',
      reform: 'リフォーム'
    };
    return labels[type];
  };

  const getStatusLabel = (status: LeadStatus) => {
    const labels = {
      new: '新規',
      in_progress: '進行中',
      won: '成約',
      lost: '失注'
    };
    return labels[status];
  };

  const getStatusColor = (status: LeadStatus) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">顧客情報管理</h1>
              <p className="text-gray-600">登録された顧客情報の一覧と管理</p>
            </div>
            <Link
              href="/leads/new"
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              ＋ 新規登録
            </Link>
          </div>

          {/* 統計情報 */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-800">総件数</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
                <div className="text-sm text-blue-800">新規</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.in_progress}</div>
                <div className="text-sm text-yellow-800">進行中</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats.won}</div>
                <div className="text-sm text-green-800">成約</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{stats.lost}</div>
                <div className="text-sm text-red-800">失注</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.by_type.sell}</div>
                <div className="text-sm text-gray-800">売却</div>
              </div>
            </div>
          )}
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">検索・絞り込み</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用途</label>
              <select
                value={filter.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">すべて</option>
                <option value="purchase">購入</option>
                <option value="sell">売却</option>
                <option value="reform">リフォーム</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
              <select
                value={filter.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">すべて</option>
                <option value="new">新規</option>
                <option value="in_progress">進行中</option>
                <option value="won">成約</option>
                <option value="lost">失注</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">開始日</label>
              <input
                type="date"
                value={filter.start_date || ''}
                onChange={(e) => handleFilterChange('start_date', e.target.value || undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
              <input
                type="date"
                value={filter.end_date || ''}
                onChange={(e) => handleFilterChange('end_date', e.target.value || undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">担当者</label>
              <input
                type="text"
                value={filter.assigned_to || ''}
                onChange={(e) => handleFilterChange('assigned_to', e.target.value || undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="担当者ID"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="氏名、建物名、電話番号で検索"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              検索
            </button>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            >
              クリア
            </button>
          </div>
        </div>

        {/* 顧客情報一覧 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              顧客情報一覧 ({leads.length}件)
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">読み込み中...</div>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">該当する顧客情報がありません</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用途
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      連絡先
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      登録日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      添付
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.last_name} {lead.first_name}
                          </div>
                          {lead.last_name_kana && (
                            <div className="text-sm text-gray-500">
                              {lead.last_name_kana} {lead.first_name_kana}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getTypeLabel(lead.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.phone}</div>
                        {lead.email && (
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {getStatusLabel(lead.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.attachments ? lead.attachments.length : 0}件
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          詳細
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
