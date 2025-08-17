'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { customersAPI } from '@/lib/supabase/customers';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// 顧客の型定義
interface Customer {
  id: string;
  name: string;
  name_kana?: string;
  phone?: string;
  email?: string;
  category: 'seller' | 'buyer' | 'reform';
  source?: string;
  address?: string;
  created_at: string;
  updated_at?: string;
}

export default function CustomersPage() {
  const { user, isLoaded } = useUser();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'seller' | 'buyer' | 'reform'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    name_kana: '',
    phone: '',
    email: '',
    category: 'buyer' as const,
    source: '',
    address: ''
  });

  // 顧客データを取得（勤怠管理と同じパターン）
  useEffect(() => {
    if (isLoaded && user) {
      fetchCustomers();
    }
  }, [isLoaded, user, activeTab]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 勤怠管理と同じパターン：直接Supabaseから取得
      let data;
      if (activeTab === 'all') {
        data = await customersAPI.getAllCustomers();
      } else {
        data = await customersAPI.getCustomersByCategory(activeTab);
      }
      
      setCustomers(data || []);
    } catch (error) {
      console.error('顧客データ取得エラー:', error);
      setError('顧客データの取得中にエラーが発生しました');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // 顧客作成
  const handleCreateCustomer = async () => {
    try {
      if (!newCustomer.name.trim()) {
        alert('顧客名は必須です');
        return;
      }

      await customersAPI.createCustomer(newCustomer);
      setShowCreateModal(false);
      setNewCustomer({
        name: '',
        name_kana: '',
        phone: '',
        email: '',
        category: 'buyer',
        source: '',
        address: ''
      });
      fetchCustomers(); // 一覧を再取得
      alert('顧客が正常に作成されました');
    } catch (error) {
      console.error('顧客作成エラー:', error);
      alert('顧客の作成に失敗しました');
    }
  };

  // 顧客削除
  const handleDeleteCustomer = async (id: string) => {
    try {
      await customersAPI.deleteCustomer(id);
      setShowDeleteConfirm(null);
      fetchCustomers(); // 一覧を再取得
      alert('顧客が正常に削除されました');
    } catch (error) {
      console.error('顧客削除エラー:', error);
      alert('顧客の削除に失敗しました');
    }
  };

  // 検索フィルター
  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery) return true;
    return (
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.name_kana?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // カテゴリ別の顧客数を計算
  const getCustomerCount = (category: 'seller' | 'buyer' | 'reform') => {
    return customers.filter(c => c.category === category).length;
  };

  // カテゴリの表示名を取得
  const getCategoryDisplayName = (category: string) => {
    const categoryNames: Record<string, string> = {
      seller: '売却',
      buyer: '購入',
      reform: 'リフォーム'
    };
    return categoryNames[category] || category;
  };

  // 流入元の表示名を取得
  const getSourceDisplayName = (source: string) => {
    const sourceNames: Record<string, string> = {
      flyer: 'チラシ',
      lp: 'LP',
      suumo: 'SUUMO',
      homes: "HOME'S",
      referral: '紹介',
      other: 'その他'
    };
    return sourceNames[source] || source;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">ログインが必要です</h1>
          <p className="text-gray-600">管理者画面にアクセスするにはログインしてください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">顧客管理</h1>
            <p className="text-gray-600">売却・購入・リフォームの顧客を一元管理</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            新規顧客登録
          </button>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
            <div className="text-sm text-gray-600">総顧客数</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">{getCustomerCount('seller')}</div>
            <div className="text-sm text-gray-600">売却顧客</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">{getCustomerCount('buyer')}</div>
            <div className="text-sm text-gray-600">購入顧客</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-purple-600">{getCustomerCount('reform')}</div>
            <div className="text-sm text-gray-600">リフォーム顧客</div>
          </div>
        </div>

        {/* タブと検索 */}
        <div className="bg-white rounded-lg shadow border mb-8">
          {/* タブ */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'all', label: '全顧客', count: customers.length },
                { key: 'seller', label: '売却', count: getCustomerCount('seller') },
                { key: 'buyer', label: '購入', count: getCustomerCount('buyer') },
                { key: 'reform', label: 'リフォーム', count: getCustomerCount('reform') }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* 検索 */}
          <div className="p-6">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="顧客名、電話番号、メールアドレスで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* 顧客一覧 */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">顧客一覧</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredCustomers.length}件の顧客を表示中
            </p>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchCustomers}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                再試行
              </button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              顧客が見つかりません
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
                      カテゴリ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      連絡先
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      流入元
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      登録日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          {customer.name_kana && (
                            <div className="text-sm text-gray-500">{customer.name_kana}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.category === 'seller' ? 'bg-blue-100 text-blue-800' :
                          customer.category === 'buyer' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {getCategoryDisplayName(customer.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {customer.phone && <div>{customer.phone}</div>}
                          {customer.email && <div className="text-gray-500">{customer.email}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.source ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {getSourceDisplayName(customer.source)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(`/admin/customers/${customer.id}`, '_blank')}
                            className="text-blue-600 hover:text-blue-900"
                            title="詳細表示"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => window.open(`/admin/customers/${customer.id}/edit`, '_blank')}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="編集"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(customer.id)}
                            className="text-red-600 hover:text-red-900"
                            title="削除"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 新規顧客作成モーダル */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">新規顧客登録</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    顧客名 *
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="田中太郎"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カナ
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name_kana}
                    onChange={(e) => setNewCustomer({...newCustomer, name_kana: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="タナカタロウ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="090-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="tanaka@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カテゴリ
                  </label>
                  <select
                    value={newCustomer.category}
                    onChange={(e) => setNewCustomer({...newCustomer, category: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="buyer">購入</option>
                    <option value="seller">売却</option>
                    <option value="reform">リフォーム</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    流入元
                  </label>
                  <select
                    value={newCustomer.source}
                    onChange={(e) => setNewCustomer({...newCustomer, source: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">選択してください</option>
                    <option value="flyer">チラシ</option>
                    <option value="lp">LP</option>
                    <option value="suumo">SUUMO</option>
                    <option value="homes">HOME'S</option>
                    <option value="referral">紹介</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    住所
                  </label>
                  <input
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="東京都渋谷区..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateCustomer}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  登録
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 削除確認モーダル */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">顧客削除の確認</h3>
              <p className="text-gray-600 mb-6">
                この顧客を削除しますか？この操作は取り消せません。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleDeleteCustomer(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
