'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { Property, Customer } from '@/types/supabase';
import PropertySummary from '@/components/admin/properties/PropertySummary';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'contracted' | 'sold'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchProperties();
  }, [currentPage, statusFilter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');

      let query = supabase
        .from('properties')
        .select('id, title, address, price, status, featured, created_at, updated_at, seller_customer_id', { count: 'exact' })
        .order('created_at', { ascending: false });

      // ステータスフィルター
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // 検索フィルター
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
      }

      // ページネーション
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching properties:', error);
        
        // Supabaseエラーコードに基づく分岐
        if (error.code === 'PGRST116') {
          setError('物件が見つかりません');
        } else if (error.code === '42P01') {
          setError('システムエラーが発生しました。管理者に連絡してください');
        } else if (error.message?.includes('Failed to fetch')) {
          setError('ネットワークエラーです。接続を確認してください');
        } else {
          setError('物件の取得に失敗しました');
        }
        return;
      }

      if (data) {
        setProperties(data);
        setTotalProperties(count || 0);
        setHasMore((data.length === ITEMS_PER_PAGE));
        
        // 売主顧客情報を取得
        const sellerIds = data
          .filter(p => p.seller_customer_id)
          .map(p => p.seller_customer_id);
        
        if (sellerIds.length > 0) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('id, name, name_kana, phone, email, category, is_active, created_at, updated_at')
            .in('id', sellerIds);
          
          if (customerData) {
            setCustomers(customerData as Customer[]);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      if (error?.message?.includes('Failed to fetch')) {
        setError('ネットワークエラーです。接続を確認してください');
      } else {
        setError('予期しないエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProperties();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchProperties();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'contracted': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return '空室';
      case 'contracted': return '契約中';
      case 'sold': return '売却済み';
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP').format(price) + '円';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">物件管理</h1>
          <p className="text-gray-600 mt-2">登録物件の管理・編集</p>
        </div>
        <Link
          href="/admin/properties/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          新規物件登録
        </Link>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 検索 */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              検索
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="物件名、住所で検索"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* ステータスフィルター */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              ステータス
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'contracted' | 'sold')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全て</option>
              <option value="available">空室</option>
              <option value="contracted">契約中</option>
              <option value="sold">売却済み</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            検索・フィルター適用
          </button>
        </div>
      </div>

      {/* 物件一覧 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              物件一覧 ({totalProperties}件)
            </h2>
            {loading && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                更新中...
              </div>
            )}
          </div>
        </div>

        {properties.length === 0 && !loading ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">物件が見つかりません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => {
              const seller = customers.find(c => c.id === property.seller_customer_id);
              return (
                <PropertySummary
                  key={property.id}
                  property={property}
                  seller={seller}
                  showActions={true}
                  className="hover:shadow-md transition-shadow"
                />
              );
            })}
          </div>
        )}

        {/* ページネーション */}
        {hasMore && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-center">
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? '読み込み中...' : 'さらに読み込む'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
