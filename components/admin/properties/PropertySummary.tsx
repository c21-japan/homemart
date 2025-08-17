import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Property, Customer } from '@/types/supabase';

interface PropertySummaryProps {
  property: Property;
  seller?: Customer;
  showActions?: boolean;
  className?: string;
}

export default function PropertySummary({ 
  property, 
  seller, 
  showActions = false,
  className = '' 
}: PropertySummaryProps) {
  const formatPrice = (price: number) => {
    if (price >= 10000) {
      return `${(price / 10000).toLocaleString()}万円`;
    }
    return `${price.toLocaleString()}円`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy/MM/dd', { locale: ja });
    } catch {
      return dateString;
    }
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
      case 'available': return '販売中';
      case 'contracted': return '契約済み';
      case 'sold': return '売却済み';
      default: return status;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {property.title || '物件名未設定'}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            📍 {property.address || '住所未設定'}
          </p>
          {seller && (
            <p className="text-sm text-gray-600">
              👤 売主: 
              <Link 
                href={`/admin/customers/${seller.id}`}
                className="text-blue-600 hover:text-blue-800 ml-1 underline"
                target="_blank"
              >
                {seller.name}
              </Link>
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(property.status)}`}>
            {getStatusText(property.status)}
          </span>
          {property.featured && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ⭐ おすすめ
            </span>
          )}
        </div>
      </div>

      {/* 基本情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">価格</div>
          <div className="text-lg font-semibold text-gray-900">
            {property.price ? formatPrice(property.price) : '価格未設定'}
          </div>
        </div>
        
        {property.description && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">説明</div>
            <div className="text-sm text-gray-900 line-clamp-2">
              {property.description}
            </div>
          </div>
        )}
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">登録日</div>
          <div className="text-sm text-gray-900">
            {formatDate(property.created_at)}
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      {showActions && (
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <Link
            href={`/properties/${property.id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            👁️ 詳細表示
          </Link>
          <Link
            href={`/admin/properties/${property.id}/edit`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            ✏️ 編集
          </Link>
        </div>
      )}
    </div>
  );
}
