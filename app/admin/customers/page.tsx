'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { SellerBadge } from '@/components/customers/SellerBadge';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Confirm } from '@/components/ui/Confirm';

interface Customer {
  id: string;
  category: 'seller' | 'buyer' | 'reform';
  name: string;
  name_kana?: string;
  phone?: string;
  email?: string;
  address?: string;
  source?: string;
  assignee_user_id?: string;
  property_type?: string;
  created_at: string;
  seller_details?: any[];
  buyer_details?: any[];
  reform_projects?: any[];
}

export default function CustomersPage() {
  const { user } = useUser();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'seller' | 'buyer' | 'reform'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    property_type: '',
    source: '',
    assignee_user_id: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // 顧客データを取得
  useEffect(() => {
    fetchCustomers();
  }, [activeTab, filters]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers?' + new URLSearchParams({
        category: activeTab === 'all' ? '' : activeTab,
        ...filters,
        query: searchQuery
      }));
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('顧客データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 顧客作成
  const handleCreateCustomer = async (data: any) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchCustomers();
      }
    } catch (error) {
      console.error('顧客作成エラー:', error);
    }
  };

  // 顧客削除
  const handleDeleteCustomer = async (id: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteConfirm(null);
        fetchCustomers();
      }
    } catch (error) {
      console.error('顧客削除エラー:', error);
    }
  };

  // タブ別の顧客数を計算
  const getCustomerCount = (category: 'seller' | 'buyer' | 'reform') => {
    return customers.filter(c => c.category === category).length;
  };

  // 流入元の表示名を取得
  const getSourceDisplayName = (source: string) => {
    const sourceNames: Record<string, string> = {
      flyer: 'チラシ',
      lp: 'LP',
      sumo: 'SUUMO',
      homes: "HOME'S",
      referral: '紹介',
      other: 'その他'
    };
    return sourceNames[source] || source;
  };

  // 物件種別の表示名を取得
  const getPropertyTypeDisplayName = (type: string) => {
    const typeNames: Record<string, string> = {
      mansion: 'マンション',
      land: '土地',
      house: '戸建'
    };
    return typeNames[type] || type;
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

  // テーブル列の定義
  const columns = [
    {
      key: 'name',
      label: '顧客名',
      render: (customer: Customer) => (
        <div>
          <div className="font-medium text-gray-900">{customer.name}</div>
          {customer.name_kana && (
            <div className="text-sm text-gray-500">{customer.name_kana}</div>
          )}
        </div>
      )
    },
    {
      key: 'category',
      label: 'カテゴリ',
      render: (customer: Customer) => (
        <Badge 
          variant={customer.category === 'seller' ? 'default' : 
                  customer.category === 'buyer' ? 'secondary' : 'outline'}
        >
          {getCategoryDisplayName(customer.category)}
        </Badge>
      )
    },
    {
      key: 'property_type',
      label: '物件種別',
      render: (customer: Customer) => (
        customer.property_type ? (
          <Badge variant="outline">
            {getPropertyTypeDisplayName(customer.property_type)}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'seller_info',
      label: '売却情報',
      render: (customer: Customer) => {
        if (customer.category !== 'seller') return <span className="text-gray-400">-</span>;
        
        const sellerDetail = customer.seller_details?.[0];
        if (!sellerDetail) return <span className="text-gray-400">-</span>;

        return (
          <div className="space-y-1">
            <SellerBadge type={sellerDetail.purchase_or_brokerage} />
            <div className="text-sm text-gray-600">
              {sellerDetail.brokerage === 'exclusive_right' ? '専属専任' :
               sellerDetail.brokerage === 'exclusive' ? '専任' : '一般'}
            </div>
            {sellerDetail.brokerage_end && (
              <div className="text-xs text-gray-500">
                期限: {new Date(sellerDetail.brokerage_end).toLocaleDateString('ja-JP')}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'reform_info',
      label: 'リフォーム情報',
      render: (customer: Customer) => {
        if (customer.category !== 'reform') return <span className="text-gray-400">-</span>;
        
        const reformProject = customer.reform_projects?.[0];
        if (!reformProject) return <span className="text-gray-400">-</span>;

        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              ¥{reformProject.expected_revenue?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-500">
              進捗: {reformProject.progress_percent || 0}%
            </div>
          </div>
        );
      }
    },
    {
      key: 'source',
      label: '流入元',
      render: (customer: Customer) => (
        customer.source ? (
          <Badge variant="outline">
            {getSourceDisplayName(customer.source)}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'created_at',
      label: '登録日',
      render: (customer: Customer) => (
        <div className="text-sm text-gray-600">
          {new Date(customer.created_at).toLocaleDateString('ja-JP')}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'アクション',
      render: (customer: Customer) => (
        <div className="flex space-x-2">
          <Link
            href={`/admin/customers/${customer.id}`}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="詳細表示"
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/customers/${customer.id}/edit`}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="編集"
          >
            <PencilIcon className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(customer.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="削除"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">顧客管理</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      {/* タブとフィルター */}
      <div className="bg-white rounded-lg shadow border">
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

        {/* 検索・フィルター */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1">
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

            {/* フィルター */}
            <div className="flex gap-4">
              <select
                value={filters.property_type}
                onChange={(e) => setFilters(prev => ({ ...prev, property_type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">物件種別</option>
                <option value="mansion">マンション</option>
                <option value="land">土地</option>
                <option value="house">戸建</option>
              </select>

              <select
                value={filters.source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">流入元</option>
                <option value="flyer">チラシ</option>
                <option value="lp">LP</option>
                <option value="suumo">SUUMO</option>
                <option value="homes">HOME'S</option>
                <option value="referral">紹介</option>
                <option value="other">その他</option>
              </select>

              <button
                onClick={() => setFilters({ property_type: '', source: '', assignee_user_id: '' })}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                クリア
              </button>
            </div>
          </div>
        </div>

        {/* テーブル */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">読み込み中...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">顧客が見つかりません</p>
            </div>
          ) : (
            <DataTable
              data={customers}
              columns={columns}
              className="w-full"
            />
          )}
        </div>
      </div>

      {/* 新規顧客作成モーダル */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="新規顧客登録"
        size="4xl"
      >
        <CustomerForm onSubmit={handleCreateCustomer} />
      </Modal>

      {/* 削除確認モーダル */}
      <Confirm
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => showDeleteConfirm && handleDeleteCustomer(showDeleteConfirm)}
        title="顧客削除の確認"
        message="この顧客を削除しますか？この操作は取り消せません。"
        confirmText="削除"
        cancelText="キャンセル"
        variant="destructive"
      />
    </div>
  );
}
