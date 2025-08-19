'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { Property, Customer } from '@/types/supabase';
import PropertySummary from '@/components/admin/properties/PropertySummary';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  
  const [property, setProperty] = useState<Property | null>(null);
  const [seller, setSeller] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      setError('');

      // 物件情報を取得
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propertyError) {
        console.error('物件取得エラー:', propertyError);
        setError('物件の取得に失敗しました');
        return;
      }

      if (propertyData) {
        setProperty(propertyData);

        // 売主情報を取得
        if (propertyData.seller_customer_id) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('*')
            .eq('id', propertyData.seller_customer_id)
            .single();

          if (customerData) {
            setSeller(customerData);
          }
        }
      }
    } catch (error: any) {
      console.error('物件詳細取得エラー:', error);
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">エラー</h1>
            <p className="text-gray-600 mb-6">{error || '物件が見つかりません'}</p>
            <Link
              href="/admin/properties"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              物件一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/properties"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                物件一覧に戻る
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">物件詳細</h1>
            </div>
            <Link
              href={`/admin/properties/${property.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              編集
            </Link>
          </div>
        </div>

        {/* 物件情報 */}
        <div className="mb-8">
          <PropertySummary
            property={property}
            seller={seller || undefined}
            showActions={false}
            className="mb-6"
          />
        </div>

        {/* 追加情報セクション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">追加情報</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">物件ID</h3>
              <p className="text-sm text-gray-900 font-mono">{property.id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">作成日時</h3>
              <p className="text-sm text-gray-900">
                {new Date(property.created_at).toLocaleString('ja-JP')}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">更新日時</h3>
              <p className="text-sm text-gray-900">
                {new Date(property.updated_at).toLocaleString('ja-JP')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
