'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerUnion, CustomerInput } from '@/lib/zod-schemas';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const ErrorMessage = ({ error }: { error: any }) => {
  if (!error?.message) return null;
  if (typeof error.message !== 'string') return null;
  return <p className="mt-1 text-sm text-red-600">{error.message}</p>;
};

interface CustomerFormProps {
  onSubmit: (data: CustomerInput) => void;
  initialData?: Partial<CustomerInput>;
  mode?: 'create' | 'edit';
}

export function CustomerForm({ onSubmit, initialData, mode = 'create' }: CustomerFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<'seller' | 'buyer' | 'reform'>(
    initialData?.category || 'seller'
  );
  const [selectedPropertyType, setSelectedPropertyType] = useState<'mansion' | 'land' | 'house'>(
    initialData?.property_type || 'mansion'
  );
  const [isExistingCustomer, setIsExistingCustomer] = useState(
    initialData?.category === 'reform' ? initialData.is_existing_customer || false : false
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    reset
  } = useForm<any>({
    resolver: zodResolver(customerUnion as any),
    defaultValues: {
      category: selectedCategory,
      property_type: selectedPropertyType,
      ...initialData
    }
  });

  const watchedValues = watch();

  // カテゴリ変更時の処理
  const handleCategoryChange = (category: 'seller' | 'buyer' | 'reform') => {
    setSelectedCategory(category);
    setValue('category', category);
    
    // カテゴリに応じてデフォルト値を設定
    if (category === 'seller') {
      setValue('brokerage', 'exclusive_right');
      setValue('report_channel', 'email');
      setValue('purchase_or_brokerage', '仲介');
    } else if (category === 'buyer') {
      setValue('preferred_area', '');
    } else if (category === 'reform') {
      setValue('is_existing_customer', false);
      setValue('requested_works', ['']);
    }
  };

  // 物件種別変更時の処理
  const handlePropertyTypeChange = (propertyType: 'mansion' | 'land' | 'house') => {
    setSelectedPropertyType(propertyType);
    setValue('property_type', propertyType);
  };

  // フォーム送信
  const handleFormSubmit = async (data: CustomerInput) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('フォーム送信エラー:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* カテゴリ選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          顧客カテゴリ <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-2">
          {[
            { value: 'seller', label: '売却', color: 'bg-blue-100 text-blue-800' },
            { value: 'buyer', label: '購入', color: 'bg-green-100 text-green-800' },
            { value: 'reform', label: 'リフォーム', color: 'bg-purple-100 text-purple-800' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleCategoryChange(option.value as any)}
              className={cn(
                'px-4 py-2 rounded-lg border-2 transition-all',
                selectedCategory === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Badge variant="outline" className={option.color}>
                {option.label}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* 基本情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            氏名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="山田太郎"
          />
          {errors.name && (
            <ErrorMessage error={errors.name} />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            フリガナ
          </label>
          <input
            type="text"
            {...register('name_kana')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="ヤマダタロウ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            電話番号
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="090-1234-5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="yamada@example.com"
          />
          {errors.email && (
            <ErrorMessage error={errors.email} />
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            住所
          </label>
          <input
            type="text"
            {...register('address')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="東京都渋谷区..."
          />
        </div>
      </div>

      {/* 流入元・担当者 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            流入元
          </label>
          <select
            {...register('source')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">選択してください</option>
            <option value="flyer">チラシ</option>
            <option value="lp">LP</option>
            <option value="suumo">SUUMO</option>
            <option value="homes">HOME&apos;S</option>
            <option value="referral">紹介</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            担当者ID
          </label>
          <input
            type="text"
            {...register('assignee_user_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="UUID"
          />
        </div>
      </div>

      {/* 物件種別 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          物件種別 <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-2">
          {[
            { value: 'mansion', label: 'マンション' },
            { value: 'land', label: '土地' },
            { value: 'house', label: '戸建' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePropertyTypeChange(option.value as any)}
              className={cn(
                'px-4 py-2 rounded-lg border-2 transition-all',
                selectedPropertyType === option.value
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* カテゴリ別の追加項目 */}
      {selectedCategory === 'seller' && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900">売却情報</h3>
          
          {/* 物件種別別の追加項目 */}
          {selectedPropertyType === 'mansion' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  マンション名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('mansion_specific.mansion_name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="サンライズマンション"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  部屋番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('mansion_specific.room_no')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="1001号室"
                />
              </div>
            </div>
          )}

          {selectedPropertyType === 'land' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                地番・地目 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('land_specific.land_info')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="○○町1-2-3、宅地"
              />
            </div>
          )}

          {selectedPropertyType === 'house' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  建物面積（㎡）
                </label>
                <input
                  type="number"
                  {...register('house_specific.building_area')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  間取り
                </label>
                <input
                  type="text"
                  {...register('house_specific.floor_plan')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="3LDK"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                希望価格（万円）
              </label>
              <input
                type="number"
                {...register('desired_price')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="3000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                媒介種別 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('brokerage')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">選択してください</option>
                <option value="exclusive_right">専属専任</option>
                <option value="exclusive">専任</option>
                <option value="general">一般</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                媒介開始日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('brokerage_start')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                連絡手段 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('report_channel')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">選択してください</option>
                <option value="email">メール</option>
                <option value="postal">郵送</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                取引種別 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('purchase_or_brokerage')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">選択してください</option>
                <option value="買取">買取</option>
                <option value="仲介">仲介</option>
              </select>
            </div>
          </div>

          {/* メール選択時の注意事項 */}
          {watchedValues.report_channel === 'email' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">注意:</span> メール送信を選択した場合は、メールアドレスが必須となります。
              </p>
            </div>
          )}
        </div>
      )}

      {selectedCategory === 'buyer' && (
        <div className="space-y-4 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-medium text-green-900">購入情報</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                希望エリア <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('preferred_area')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="渋谷区、新宿区など"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                予算下限（万円）
              </label>
              <input
                type="number"
                {...register('budget_min')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="3000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                予算上限（万円）
              </label>
              <input
                type="number"
                {...register('budget_max')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="5000"
              />
            </div>
          </div>
        </div>
      )}

      {selectedCategory === 'reform' && (
        <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
          <h3 className="text-lg font-medium text-purple-900">リフォーム情報</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                顧客タイプ
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isExistingCustomer}
                    onChange={() => setIsExistingCustomer(false)}
                    className="mr-2"
                  />
                  新規顧客
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isExistingCustomer}
                    onChange={() => setIsExistingCustomer(true)}
                    className="mr-2"
                  />
                  既存顧客
                </label>
              </div>
            </div>

            {isExistingCustomer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  既存顧客ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('existing_customer_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="UUID"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                依頼内容 <span className="text-red-500">*</span>
              </label>
              <Controller
                name="requested_works"
                control={control}
                defaultValue={['']}
                render={({ field }) => (
                  <div className="space-y-2">
                    {field.value.map((work: string, index: number) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={work}
                          onChange={(e) => {
                            const newWorks = [...field.value];
                            newWorks[index] = e.target.value;
                            field.onChange(newWorks);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="キッチンリフォーム"
                        />
                        {field.value.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newWorks = field.value.filter((_: string, i: number) => i !== index);
                              field.onChange(newWorks);
                            }}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            削除
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => field.onChange([...field.value, ''])}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + 依頼内容を追加
                    </button>
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  概算予算（万円）
                </label>
                <input
                  type="number"
                  {...register('expected_revenue')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  希望工期開始日
                </label>
                <input
                  type="date"
                  {...register('start_date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  希望工期完了日
                </label>
                <input
                  type="date"
                  {...register('end_date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  現調希望日
                </label>
                <input
                  type="date"
                  {...register('survey_date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 送信ボタン */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          リセット
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '送信中...' : mode === 'create' ? '登録' : '更新'}
        </button>
      </div>
    </form>
  );
}
