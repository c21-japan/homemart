'use client';

import { useState } from "react";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// 型定義
interface CustomerFormData {
  category: 'seller' | 'buyer' | 'reform';
  name: string;
  name_kana?: string;
  phone?: string;
  phone_secondary?: string;
  email?: string;
  line_id?: string;
  postal_code?: string;
  prefecture?: string;
  city?: string;
  address?: string;
  building?: string;
  source: 'flyer' | 'lp' | 'suumo' | 'homes' | 'referral' | 'walk_in' | 'repeat' | 'other';
  source_detail?: string;
  assignee_user_id?: string;
  assignee_name?: string;
  is_vip: boolean;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  tags: string[];
  notes?: string;
  
  // 物件情報
  property_type?: 'mansion' | 'land' | 'house';
  mansion_name?: string;
  room_number?: string;
  floor_number?: number;
  total_floors?: number;
  land_number?: string;
  land_category?: string;
  land_area?: number;
  building_coverage?: number;
  floor_area_ratio?: number;
  building_area?: number;
  number_of_floors?: number;
  floor_plan?: string;
  built_year?: number;
  built_month?: number;
  area?: number;
  balcony_area?: number;
  nearest_station?: string;
  station_distance?: number;
  assessed_value?: number;
  market_value?: number;
  management_company?: string;
  management_fee?: number;
  repair_fund?: number;
  
  // 売却詳細
  desired_price?: number;
  minimum_price?: number;
  reason_for_sale?: string;
  urgency?: 'urgent' | 'high' | 'medium' | 'low';
  transaction_type?: 'purchase' | 'brokerage';
  brokerage_type?: 'exclusive_right' | 'exclusive' | 'general';
  brokerage_start_date?: string;
  contract_number?: string;
  report_channel?: 'email' | 'postal' | 'line' | 'phone';
  report_frequency?: number;
  
  // 購入詳細
  preferred_areas?: string[];
  budget_min?: number;
  budget_max?: number;
  preferred_property_types?: ('mansion' | 'land' | 'house')[];
  min_area?: number;
  max_building_age?: number;
  required_floor_plan?: string;
  self_funds?: number;
  loan_amount?: number;
  pre_approved?: boolean;
  bank_name?: string;
  
  // リフォーム詳細
  project_number?: string;
  is_existing_customer?: boolean;
  referrer_customer_id?: string;
  requested_works?: string[];
  estimated_amount?: number;
  quoted_amount?: number;
  survey_date?: string;
  scheduled_end_date?: string;
  sales_user_id?: string;
  project_manager_id?: string;
  
  // 打ち合わせ記録
  meeting_title?: string;
  meeting_date?: string;
  meeting_content?: string;
  meeting_photos?: File[];
}

export default function NewCustomerPage() {
  const router = useRouter();

  // TODO: 認証システムが実装されたら置き換える
  const user = undefined as { id?: string; fullName?: string; username?: string } | undefined;

  // State
  const [formData, setFormData] = useState<CustomerFormData>({
    category: 'seller',
    name: '',
    source: 'flyer',
    is_vip: false,
    priority: 'medium',
    tags: [],
    property_type: 'mansion',
    transaction_type: 'brokerage',
    brokerage_type: 'exclusive',
    report_channel: 'email',
    urgency: 'medium',
    preferred_areas: [],
    preferred_property_types: ['mansion'],
    pre_approved: false,
    requested_works: [],
    is_existing_customer: false,
    meeting_title: '',
    meeting_date: '',
    meeting_content: '',
    meeting_photos: []
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '顧客名は必須です';
    }
    
    if (formData.category === 'seller' && !formData.desired_price) {
      newErrors.desired_price = '希望価格は必須です';
    }
    
    if (formData.category === 'buyer' && (!formData.budget_min || !formData.budget_max)) {
      newErrors.budget_min = '予算範囲は必須です';
      newErrors.budget_max = '予算範囲は必須です';
    }
    
    if (formData.category === 'reform' && !formData.estimated_amount) {
      newErrors.estimated_amount = '概算金額は必須です';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. 顧客基本情報の作成
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          category: formData.category,
          name: formData.name,
          name_kana: formData.name_kana,
          phone: formData.phone,
          phone_secondary: formData.phone_secondary,
          email: formData.email,
          line_id: formData.line_id,
          postal_code: formData.postal_code,
          prefecture: formData.prefecture,
          city: formData.city,
          address: formData.address,
          building: formData.building,
          source: formData.source,
          source_detail: formData.source_detail,
          assignee_user_id: user?.id,
          assignee_name: user?.fullName || user?.username,
          is_vip: formData.is_vip,
          priority: formData.priority,
          tags: formData.tags,
          notes: formData.notes,
          created_by: user?.id,
          updated_by: user?.id
        })
        .select()
        .single();
      
      if (customerError) throw customerError;
      
      // 2. 物件情報の作成
      if (formData.property_type && formData.address) {
        const { error: propertyError } = await supabase
          .from('properties')
          .insert({
            customer_id: customer.id,
            property_type: formData.property_type,
            postal_code: formData.postal_code,
            prefecture: formData.prefecture,
            city: formData.city,
            address: formData.address,
            mansion_name: formData.mansion_name,
            room_number: formData.room_number,
            floor_number: formData.floor_number,
            total_floors: formData.total_floors,
            land_number: formData.land_number,
            land_category: formData.land_category,
            land_area: formData.land_area,
            building_coverage: formData.building_coverage,
            floor_area_ratio: formData.floor_area_ratio,
            building_area: formData.building_area,
            number_of_floors: formData.number_of_floors,
            floor_plan: formData.floor_plan,
            built_year: formData.built_year,
            built_month: formData.built_month,
            area: formData.area,
            balcony_area: formData.balcony_area,
            nearest_station: formData.nearest_station,
            station_distance: formData.station_distance,
            assessed_value: formData.assessed_value,
            market_value: formData.market_value,
            management_company: formData.management_company,
            management_fee: formData.management_fee,
            repair_fund: formData.repair_fund
          });
        
        if (propertyError) throw propertyError;
      }
      
      // 3. カテゴリ別詳細情報の作成
      if (formData.category === 'seller') {
        const { error: sellerError } = await supabase
          .from('seller_details')
          .insert({
            customer_id: customer.id,
            desired_price: formData.desired_price,
            minimum_price: formData.minimum_price,
            reason_for_sale: formData.reason_for_sale,
            urgency: formData.urgency,
            transaction_type: formData.transaction_type,
            brokerage_type: formData.brokerage_type,
            brokerage_start_date: formData.brokerage_start_date,
            contract_number: formData.contract_number,
            report_channel: formData.report_channel,
            report_frequency: formData.report_frequency
          });
        
        if (sellerError) throw sellerError;
      }
      
      if (formData.category === 'buyer') {
        const { error: buyerError } = await supabase
          .from('buyer_details')
          .insert({
            customer_id: customer.id,
            preferred_areas: formData.preferred_areas,
            budget_min: formData.budget_min,
            budget_max: formData.budget_max,
            preferred_property_types: formData.preferred_property_types,
            min_area: formData.min_area,
            max_building_age: formData.max_building_age,
            required_floor_plan: formData.required_floor_plan,
            self_funds: formData.self_funds,
            loan_amount: formData.loan_amount,
            pre_approved: formData.pre_approved,
            bank_name: formData.bank_name
          });
        
        if (buyerError) throw buyerError;
      }
      
      if (formData.category === 'reform') {
        const { error: reformError } = await supabase
          .from('reform_projects')
          .insert({
            customer_id: customer.id,
            project_number: formData.project_number,
            is_existing_customer: formData.is_existing_customer,
            referrer_customer_id: formData.referrer_customer_id,
            requested_works: formData.requested_works,
            estimated_amount: formData.estimated_amount,
            quoted_amount: formData.quoted_amount,
            survey_date: formData.survey_date,
            scheduled_end_date: formData.scheduled_end_date,
            sales_user_id: user?.id,
            project_manager_id: formData.project_manager_id
          });
        
        if (reformError) throw reformError;
      }
      
      // 打ち合わせ記録の保存
      if (formData.meeting_title && formData.meeting_date && formData.meeting_content) {
        try {
          // ミーティングを保存
          const { data: meeting, error: meetingError } = await supabase
            .from('meetings')
            .insert({
              customer_id: customer.id,
              started_at: formData.meeting_date,
              summary: formData.meeting_title,
              source: 'manual'
            })
            .select()
            .single();

          if (meetingError) throw meetingError;

          // ミーティングノートを保存
          const { error: noteError } = await supabase
            .from('meeting_notes')
            .insert({
              meeting_id: meeting.id,
              raw_text: formData.meeting_content
            });

          if (noteError) throw noteError;

          // 写真があれば文書テーブルに保存
          if (formData.meeting_photos && formData.meeting_photos.length > 0) {
            for (const photo of formData.meeting_photos) {
              await supabase
                .from('documents')
                .insert({
                  customer_id: customer.id,
                  type: 'meeting_photo',
                  filename: photo.name,
                  file_path: `meetings/${meeting.id}/${photo.name}`,
                  file_size: photo.size,
                  mime_type: photo.type,
                  uploaded_by: user?.id || 'unknown'
                });
            }
          }
        } catch (meetingError) {
          console.error('打ち合わせ記録保存エラー:', meetingError);
          // 打ち合わせ記録の保存に失敗しても顧客登録は成功とする
        }
      }
      
      alert('顧客を正常に登録しました！');
      router.push(`/admin/customers/${customer.id}`);
      
    } catch (error) {
      console.error('顧客登録エラー:', error);
      alert(`顧客登録に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setLoading(false);
    }
  };

  // 入力フィールドの更新
  const handleInputChange = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 配列フィールドの更新
  const handleArrayChange = (field: keyof CustomerFormData, value: string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">新規顧客登録</h1>
          <p className="text-gray-600 mt-2">新しい顧客の情報を入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="seller">売却</option>
                  <option value="buyer">購入</option>
                  <option value="reform">リフォーム</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  顧客名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="田中太郎"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カナ
                </label>
                <input
                  type="text"
                  value={formData.name_kana || ''}
                  onChange={(e) => handleInputChange('name_kana', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="タナカタロウ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="090-1234-5678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tanaka@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  流入元 *
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="flyer">チラシ</option>
                  <option value="lp">LP</option>
                  <option value="suumo">SUUMO</option>
                  <option value="homes">HOME&apos;S</option>
                  <option value="referral">紹介</option>
                  <option value="walk_in">来店</option>
                  <option value="repeat">リピート</option>
                  <option value="other">その他</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  優先度
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="urgent">緊急</option>
                </select>
              </div>
            </div>
          </div>

          {/* 物件情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">物件情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  物件タイプ
                </label>
                <select
                  value={formData.property_type}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="mansion">マンション</option>
                  <option value="land">土地</option>
                  <option value="house">戸建</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="東京都渋谷区..."
                />
              </div>
              
              {formData.property_type === 'mansion' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      マンション名
                    </label>
                    <input
                      type="text"
                      value={formData.mansion_name || ''}
                      onChange={(e) => handleInputChange('mansion_name', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="○○マンション"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      部屋番号
                    </label>
                    <input
                      type="text"
                      value={formData.room_number || ''}
                      onChange={(e) => handleInputChange('room_number', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1001"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  面積（㎡）
                </label>
                <input
                  type="number"
                  value={formData.area || ''}
                  onChange={(e) => handleInputChange('area', parseFloat(e.target.value) || undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="80.5"
                />
              </div>
            </div>
          </div>

          {/* カテゴリ別詳細情報 */}
          {formData.category === 'seller' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">売却詳細</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    希望価格 *
                  </label>
                  <input
                    type="number"
                    value={formData.desired_price || ''}
                    onChange={(e) => handleInputChange('desired_price', parseInt(e.target.value) || undefined)}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.desired_price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="50000000"
                  />
                  {errors.desired_price && <p className="text-red-500 text-sm mt-1">{errors.desired_price}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    媒介契約タイプ
                  </label>
                  <select
                    value={formData.transaction_type}
                    onChange={(e) => handleInputChange('transaction_type', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="brokerage">仲介</option>
                    <option value="purchase">買取</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    媒介契約種別
                  </label>
                  <select
                    value={formData.brokerage_type}
                    onChange={(e) => handleInputChange('brokerage_type', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="exclusive">専任</option>
                    <option value="exclusive_right">専任専売</option>
                    <option value="general">一般</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    報告方法
                  </label>
                  <select
                    value={formData.report_channel}
                    onChange={(e) => handleInputChange('report_channel', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="email">メール</option>
                    <option value="postal">郵送</option>
                    <option value="line">LINE</option>
                    <option value="phone">電話</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {formData.category === 'buyer' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">購入詳細</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    予算下限 *
                  </label>
                  <input
                    type="number"
                    value={formData.budget_min || ''}
                    onChange={(e) => handleInputChange('budget_min', parseInt(e.target.value) || undefined)}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.budget_min ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="30000000"
                  />
                  {errors.budget_min && <p className="text-red-500 text-sm mt-1">{errors.budget_min}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    予算上限 *
                  </label>
                  <input
                    type="number"
                    value={formData.budget_max || ''}
                    onChange={(e) => handleInputChange('budget_max', parseInt(e.target.value) || undefined)}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.budget_max ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="50000000"
                  />
                  {errors.budget_max && <p className="text-red-500 text-sm mt-1">{errors.budget_max}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    希望物件タイプ
                  </label>
                  <div className="space-y-2">
                    {(['mansion', 'land', 'house'] as const).map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.preferred_property_types?.includes(type) || false}
                          onChange={(e) => {
                            const current = formData.preferred_property_types || [];
                            if (e.target.checked) {
                              handleArrayChange('preferred_property_types', [...current, type]);
                            } else {
                              handleArrayChange('preferred_property_types', current.filter(t => t !== type));
                            }
                          }}
                          className="mr-2"
                        />
                        {type === 'mansion' && 'マンション'}
                        {type === 'land' && '土地'}
                        {type === 'house' && '戸建'}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.category === 'reform' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">リフォーム詳細</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    概算金額 *
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_amount || ''}
                    onChange={(e) => handleInputChange('estimated_amount', parseInt(e.target.value) || undefined)}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.estimated_amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="2000000"
                  />
                  {errors.estimated_amount && <p className="text-red-500 text-sm mt-1">{errors.estimated_amount}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    案件番号
                  </label>
                  <input
                    type="text"
                    value={formData.project_number || ''}
                    onChange={(e) => handleInputChange('project_number', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="REF-2025-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    既存顧客
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_existing_customer}
                      onChange={(e) => handleInputChange('is_existing_customer', e.target.checked)}
                      className="mr-2"
                    />
                    既存の顧客である
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 打ち合わせ記録 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">打ち合わせ記録</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  打ち合わせタイトル
                </label>
                <input
                  type="text"
                  value={formData.meeting_title || ''}
                  onChange={(e) => handleInputChange('meeting_title', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例：物件の現況確認と査定依頼"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  打ち合わせ日時
                </label>
                <input
                  type="datetime-local"
                  value={formData.meeting_date || ''}
                  onChange={(e) => handleInputChange('meeting_date', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  打ち合わせ内容
                </label>
                <textarea
                  value={formData.meeting_content || ''}
                  onChange={(e) => handleInputChange('meeting_content', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="打ち合わせの詳細内容を記載してください..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  写真アップロード（最大30枚）
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 30) {
                      alert('写真は最大30枚までアップロードできます');
                      return;
                    }
                    handleInputChange('meeting_photos', files);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  選択された写真: {formData.meeting_photos?.length || 0}枚
                </p>
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登録中...' : '顧客を登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
