'use client';

import { useState, useEffect, useCallback, Suspense } from "react";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { format, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";

// 型定義
interface Customer {
  id: string;
  category: 'seller' | 'buyer' | 'reform';
  name: string;
  name_kana?: string;
  phone?: string;
  email?: string;
  assignee_name?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  created_at: string;
  
  // 関連情報
  property_type?: string;
  property_address?: string;
  
  // 売却
  transaction_type?: 'purchase' | 'brokerage';
  brokerage_type?: string;
  desired_price?: number;
  next_report_due?: string;
  
  // 購入
  budget_min?: number;
  budget_max?: number;
  
  // リフォーム
  reform_status?: string;
  contracted_amount?: number;
  total_cost?: number;
  gross_profit?: number;
  progress_percent?: number;
  
  // タスク
  pending_tasks?: number;
}

interface KPIData {
  totalCustomers: number;
  newCustomersCount: number;
  pendingReports: number;
  overdueTasks: number;
  reformGrossProfit: number;
  conversionRate: number;
}

function CustomersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(searchParams?.get("tab") || "all");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState<KPIData>({
    totalCustomers: 0,
    newCustomersCount: 0,
    pendingReports: 0,
    overdueTasks: 0,
    reformGrossProfit: 0,
    conversionRate: 0,
  });

  // データ取得
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setCustomers(data || []);
      
      // KPI計算
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const kpi: KPIData = {
        totalCustomers: data?.length || 0,
        newCustomersCount: data?.filter((c: Customer) => 
          new Date(c.created_at) >= thisMonthStart
        ).length || 0,
        pendingReports: 0, // 後で実装
        overdueTasks: 0,   // 後で実装
        reformGrossProfit: 0, // 後で実装
        conversionRate: 0, // 後で実装
      };
      
      setKpiData(kpi);
      
    } catch (error) {
      console.error('Error fetching customers:', error);
      alert('顧客データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  // フィルタリング
  useEffect(() => {
    let filtered = [...customers];
    
    // タブフィルタ
    if (activeTab !== 'all') {
      filtered = filtered.filter(c => c.category === activeTab);
    }
    
    // 検索フィルタ
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.name_kana?.toLowerCase().includes(term) ||
        c.phone?.includes(term) ||
        c.email?.toLowerCase().includes(term)
      );
    }
    
    setFilteredCustomers(filtered);
  }, [customers, activeTab, searchTerm]);

  // 初回ロード
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ドロップダウンの外をクリックした時に閉じる
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // リアルタイム更新
  useEffect(() => {
    const channel = supabase
      .channel('customers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' },
        () => fetchCustomers()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchCustomers]);

  // アクション関数
  const handleSendReport = async (customerId: string) => {
    try {
      alert('報告書送信機能は後で実装されます');
    } catch (error) {
      alert('報告書の送信に失敗しました');
    }
  };

  const handleGeneratePDF = async (customerId: string) => {
    try {
      alert('PDF生成機能は後で実装されます');
    } catch (error) {
      alert('PDFの生成に失敗しました');
    }
  };

  // UI関数
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seller': return '🏠';
      case 'buyer': return '👥';
      case 'reform': return '🔨';
      default: return '❓';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'seller': return '売却';
      case 'buyer': return '購入';
      case 'reform': return 'リフォーム';
      default: return category;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (customer: Customer) => {
    // 報告期限チェック
    if (customer.next_report_due) {
      const daysUntilDue = differenceInDays(new Date(customer.next_report_due), new Date());
      if (daysUntilDue < 0) {
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">報告期限超過</span>;
      } else if (daysUntilDue <= 3) {
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">報告期限間近</span>;
      }
    }
    
    // リフォームステータス
    if (customer.reform_status) {
      const statusLabels: Record<string, string> = {
        inquiry: '問合せ',
        estimating: '見積中',
        proposing: '提案中',
        negotiating: '交渉中',
        contracted: '契約済',
        preparing: '準備中',
        started: '着工',
        completed: '完了',
        aftercare: 'アフター',
        lost: '失注',
      };
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{statusLabels[customer.reform_status]}</span>;
    }
    
    return null;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* KPIカード */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500 mb-2">総顧客数</div>
          <div className="text-2xl font-bold">{kpiData.totalCustomers}</div>
          <p className="text-xs text-gray-500">
            今月 +{kpiData.newCustomersCount}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500 mb-2">報告待ち</div>
          <div className="text-2xl font-bold text-orange-600">
            {kpiData.pendingReports}
          </div>
          <p className="text-xs text-gray-500">要対応</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500 mb-2">期限超過</div>
          <div className="text-2xl font-bold text-red-600">
            {kpiData.overdueTasks}
          </div>
          <p className="text-xs text-gray-500">タスク</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500 mb-2">リフォーム粗利</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(kpiData.reformGrossProfit)}
          </div>
          <p className="text-xs text-gray-500">今月見込み</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500 mb-2">成約率</div>
          <div className="text-2xl font-bold">
            {kpiData.conversionRate.toFixed(1)}%
          </div>
          <p className="text-xs text-gray-500">前月比</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-blue-500">
          <div className="text-sm font-medium text-blue-600 mb-2">本日のタスク</div>
          <div className="space-y-1">
            <div className="flex items-center text-xs">
              <span className="mr-1">⏰</span>
              <span>報告 3件</span>
            </div>
            <div className="flex items-center text-xs">
              <span className="mr-1">✅</span>
              <span>確認 5件</span>
            </div>
          </div>
        </div>
      </div>

      {/* ツールバー */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="名前、電話番号、メールで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/admin/customers/new')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">➕</span>
            新規顧客
          </button>
          
          <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <span className="mr-2">🔽</span>
            CSV
          </button>
        </div>
      </div>

      {/* タブ */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: '全て', count: customers.length },
              { key: 'seller', label: '売却', count: customers.filter(c => c.category === 'seller').length },
              { key: 'buyer', label: '購入', count: customers.filter(c => c.category === 'buyer').length },
              { key: 'reform', label: 'リフォーム', count: customers.filter(c => c.category === 'reform').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
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

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              該当する顧客が見つかりません
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物件</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">担当</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">次回アクション</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">アクション</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr 
                      key={customer.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/admin/customers/${customer.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center text-2xl">
                          {getCategoryIcon(customer.category)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500">
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {customer.property_type && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 mr-1">
                              {customer.property_type === 'mansion' && 'マンション'}
                              {customer.property_type === 'land' && '土地'}
                              {customer.property_type === 'house' && '戸建'}
                            </span>
                          )}
                          {customer.property_address && (
                            <div className="text-gray-500 mt-1">
                              {customer.property_address}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(customer)}
                          {customer.pending_tasks && customer.pending_tasks > 0 && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              ⚠️ {customer.pending_tasks}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {customer.assignee_name || '-'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {customer.category === 'seller' && (
                          <div>
                            <div className="font-medium">
                              {formatCurrency(customer.desired_price)}
                            </div>
                            {customer.transaction_type && (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                customer.transaction_type === 'purchase' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {customer.transaction_type === 'purchase' ? '買取' : '仲介'}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {customer.category === 'buyer' && (
                          <div className="text-sm">
                            {formatCurrency(customer.budget_min)} 〜 {formatCurrency(customer.budget_max)}
                          </div>
                        )}
                        
                        {customer.category === 'reform' && (
                          <div>
                            <div className="font-medium">
                              {formatCurrency(customer.contracted_amount)}
                            </div>
                            {customer.gross_profit && (
                              <div className="text-xs text-green-600">
                                粗利: {formatCurrency(customer.gross_profit)}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.next_report_due && (
                          <div className="text-sm">
                            <div className="font-medium">報告期限</div>
                            <div className="text-gray-500">
                              {format(new Date(customer.next_report_due), 'M/d', { locale: ja })}
                            </div>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <button 
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => setOpenDropdown(openDropdown === customer.id ? null : customer.id)}
                          >
                            ⋯
                          </button>
                          <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ${
                            openDropdown === customer.id ? 'block' : 'hidden'
                          }`}>
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                router.push(`/admin/customers/${customer.id}`);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              詳細を見る
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                router.push(`/admin/properties/new?sellerId=${customer.id}`);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              🏠 新規物件登録
                            </button>
                            
                            {customer.category === 'seller' && customer.next_report_due && (
                              <>
                                <button
                                  onClick={() => handleSendReport(customer.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  📧 報告メール送信
                                </button>
                                <button
                                  onClick={() => handleGeneratePDF(customer.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  📄 報告書PDF作成
                                </button>
                              </>
                            )}
                            
                            {customer.category === 'reform' && (
                              <button
                                onClick={() => router.push(`/admin/customers/${customer.id}/costs`)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                💰 原価入力
                              </button>
                            )}
                          </div>
                        </div>
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

export default function CustomersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <CustomersPageContent />
    </Suspense>
  );
}
