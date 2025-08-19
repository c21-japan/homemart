'use client';

import { useState, useEffect } from "react";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase-direct";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// 型定義
interface Customer {
  id: string;
  category: 'seller' | 'buyer' | 'reform';
  name: string;
  name_kana?: string;
  phone?: string;
  email?: string;
  address?: string;
  source: string;
  assignee_name?: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  
  // 関連情報
  properties?: any[];
  seller_details?: any[];
  buyer_details?: any[];
  reform_projects?: any[];
  checklists?: any[];
  meetings?: any[];
  documents?: any[];
  tasks?: any[];
  reminders?: any[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  
  const customerId = params.id as string;

  // データ取得
  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          properties(*),
          seller_details(*),
          buyer_details(*),
          reform_projects(*),
          checklists(
            *,
            checklist_items(*)
          ),
          meetings(
            *,
            meeting_notes(*)
          ),
          documents(*),
          tasks(*),
          reminders(*)
        `)
        .eq('id', customerId)
        .single();

      if (error) throw error;
      
      setCustomer(data);
      setEditData(data);
      
    } catch (error) {
      console.error('顧客詳細取得エラー:', error);
      alert('顧客情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 顧客削除
  const handleDelete = async () => {
    if (!confirm('この顧客を削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      alert('顧客を削除しました');
      router.push('/admin/customers');
      
    } catch (error) {
      console.error('顧客削除エラー:', error);
      alert('顧客の削除に失敗しました');
    }
  };

  // 編集保存
  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          ...editData,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId);

      if (error) throw error;

      alert('顧客情報を更新しました');
      setIsEditing(false);
      fetchCustomer();
      
    } catch (error) {
      console.error('顧客更新エラー:', error);
      alert('顧客情報の更新に失敗しました');
    }
  };

  // 編集キャンセル
  const handleCancel = () => {
    setIsEditing(false);
    setEditData(customer);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-red-600">顧客が見つかりません</div>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      seller: '売却',
      buyer: '購入',
      reform: 'リフォーム'
    };
    return labels[category] || category;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600 mt-2">
              {getCategoryLabel(customer.category)} • 登録日: {format(new Date(customer.created_at), 'yyyy年MM月dd日', { locale: ja })}
            </p>
          </div>
          
          <div className="flex space-x-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  編集
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  削除
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
              </>
            )}
            
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              戻る
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メイン情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">基本情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">カテゴリ</label>
                  <div className="text-sm text-gray-900">
                    {isEditing ? (
                      <select
                        value={editData.category || ''}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="seller">売却</option>
                        <option value="buyer">購入</option>
                        <option value="reform">リフォーム</option>
                      </select>
                    ) : (
                      getCategoryLabel(customer.category)
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">顧客名</label>
                  <div className="text-sm text-gray-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    ) : (
                      customer.name
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">電話番号</label>
                  <div className="text-sm text-gray-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    ) : (
                      customer.phone || '未設定'
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">メールアドレス</label>
                  <div className="text-sm text-gray-900">
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    ) : (
                      customer.email || '未設定'
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">住所</label>
                  <div className="text-sm text-gray-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.address || ''}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    ) : (
                      customer.address || '未設定'
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">担当者</label>
                  <div className="text-sm text-gray-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.assignee_name || ''}
                        onChange={(e) => setEditData({ ...editData, assignee_name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    ) : (
                      customer.assignee_name || '未設定'
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">優先度</label>
                  <div className="text-sm text-gray-900">
                    {isEditing ? (
                      <select
                        value={editData.priority || ''}
                        onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                        <option value="urgent">緊急</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(customer.priority)}`}>
                        {customer.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* カテゴリ別詳細情報 */}
            {customer.category === 'seller' && customer.seller_details?.[0] && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">売却詳細</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">希望価格</label>
                    <div className="text-sm text-gray-900">
                      {customer.seller_details[0].desired_price ? 
                        `${customer.seller_details[0].desired_price.toLocaleString()}円` : '未設定'
                      }
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">媒介種別</label>
                    <div className="text-sm text-gray-900">
                      {customer.seller_details[0].brokerage_type || '未設定'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {customer.category === 'buyer' && customer.buyer_details?.[0] && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">購入詳細</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">予算範囲</label>
                    <div className="text-sm text-gray-900">
                      {customer.buyer_details[0].budget_min && customer.buyer_details[0].budget_max ?
                        `${customer.buyer_details[0].budget_min.toLocaleString()}円 〜 ${customer.buyer_details[0].budget_max.toLocaleString()}円` : '未設定'
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {customer.category === 'reform' && customer.reform_projects?.[0] && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">リフォーム詳細</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">概算金額</label>
                    <div className="text-sm text-gray-900">
                      {customer.reform_projects[0].estimated_amount ? 
                        `${customer.reform_projects[0].estimated_amount.toLocaleString()}円` : '未設定'
                      }
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">案件番号</label>
                    <div className="text-sm text-gray-900">
                      {customer.reform_projects[0].project_number || '未設定'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 打ち合わせ記録 */}
            {customer.meetings && customer.meetings.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">打ち合わせ記録</h2>
                <div className="space-y-4">
                  {customer.meetings.map((meeting) => (
                    <div key={meeting.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{meeting.summary}</h3>
                        <span className="text-sm text-gray-500">
                          {format(new Date(meeting.started_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                        </span>
                      </div>
                      {meeting.meeting_notes?.[0] && (
                        <p className="text-sm text-gray-600">{meeting.meeting_notes[0].raw_text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* チェックリスト */}
            {customer.checklists && customer.checklists.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">チェックリスト</h2>
                <div className="space-y-4">
                  {customer.checklists.map((checklist) => (
                    <div key={checklist.id} className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">{checklist.title}</h3>
                      <div className="space-y-2">
                        {checklist.checklist_items?.map((item: any) => (
                          <label key={item.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.is_completed}
                              className="mr-2"
                              disabled
                            />
                            <span className={`text-sm ${item.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* アクション */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">アクション</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  打ち合わせ記録追加
                </button>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  チェックリスト更新
                </button>
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                  リマインド設定
                </button>
              </div>
            </div>

            {/* 統計情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">統計情報</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">打ち合わせ回数</span>
                  <span className="text-sm font-medium">{customer.meetings?.length || 0}回</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">完了タスク</span>
                  <span className="text-sm font-medium">
                    {customer.tasks?.filter(t => t.status === 'done').length || 0}件
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">未対応リマインド</span>
                  <span className="text-sm font-medium">
                    {customer.reminders?.filter(r => r.status === 'pending').length || 0}件
                  </span>
                </div>
              </div>
            </div>

            {/* 最近の更新 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">最近の更新</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>最終更新: {format(new Date(customer.updated_at), 'MM/dd HH:mm', { locale: ja })}</div>
                <div>登録日: {format(new Date(customer.created_at), 'MM/dd HH:mm', { locale: ja })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
