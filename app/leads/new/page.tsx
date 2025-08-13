'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadFormSchema, LeadFormData, LeadType } from '@/types/schemas';
import { createLead } from '@/app/(secure)/actions/leads';
import { offlineStorage } from '@/lib/offline-storage';
import { useRouter } from 'next/navigation';

export default function NewLeadPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'sell',
      extra: {}
    }
  });

  const selectedType = watch('type');

  // オンライン状態の監視
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // 位置情報の取得
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('位置情報が利用できません');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;

      // 住所情報を取得（逆ジオコーディング）
      let address = '位置情報を取得しました';
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=ja`
        );
        const data = await response.json();
        if (data.display_name) {
          address = data.display_name;
        }
      } catch (error) {
        console.warn('Address lookup failed:', error);
        address = `緯度: ${latitude.toFixed(6)}, 経度: ${longitude.toFixed(6)}`;
      }

      const location = { latitude, longitude, address };
      setLocationData(location);
      setValue('extra.location', location);
    } catch (error) {
      console.error('Location error:', error);
      alert('位置情報の取得に失敗しました');
    }
  };

  // 画像の追加
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    setValue('attachments', [...attachments, ...files]);
  };

  // 画像の削除
  const removeImage = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
    setValue('attachments', newAttachments);
  };

  // フォーム送信
  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);

    try {
      if (isOnline) {
        // オンライン時：直接送信
        const result = await createLead(data);
        if (result.success) {
          alert('顧客情報を登録しました');
          reset();
          setAttachments([]);
          setLocationData(null);
        } else {
          alert(`送信に失敗しました: ${result.error}`);
        }
      } else {
        // オフライン時：ローカル保存
        const offlineResult = await offlineStorage.trySave(data);
        if (offlineResult.success === false && offlineResult.offlineId) {
          alert('オフライン保存しました。再接続時に自動送信されます。');
          reset();
          setAttachments([]);
          setLocationData(null);
        } else {
          alert(`オフライン保存に失敗しました: ${offlineResult.error}`);
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            顧客情報登録
          </h1>
          <p className="text-gray-600">
            用途を選択して、顧客の情報を入力してください
          </p>
          
          {/* オンライン状態表示 */}
          <div className={`mt-4 px-3 py-2 rounded-lg text-sm ${
            isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isOnline ? 'オンライン' : 'オフライン'}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 用途選択 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">用途</h2>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="sell">売却</option>
                  <option value="purchase">購入</option>
                  <option value="reform">リフォーム</option>
                </select>
              )}
            />
            {errors.type && (
              <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓 <span className="text-red-600">*</span>
                </label>
                <input
                  {...register('last_name')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="山田"
                />
                {errors.last_name && (
                  <p className="text-red-600 text-sm mt-1">{errors.last_name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名 <span className="text-red-600">*</span>
                </label>
                <input
                  {...register('first_name')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="太郎"
                />
                {errors.first_name && (
                  <p className="text-red-600 text-sm mt-1">{errors.first_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓（カナ）
                </label>
                <input
                  {...register('last_name_kana')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="ヤマダ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名（カナ）
                </label>
                <input
                  {...register('first_name_kana')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="タロウ"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号 <span className="text-red-600">*</span>
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="090-1234-5678"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                取得経路
              </label>
              <select
                {...register('source')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">選択してください</option>
                <option value="現地">現地</option>
                <option value="電話">電話</option>
                <option value="紹介">紹介</option>
                <option value="チラシ">チラシ</option>
                <option value="サイト">サイト</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </div>

          {/* 住所情報 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">住所情報</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  郵便番号
                </label>
                <input
                  {...register('postal_code')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  都道府県
                </label>
                <input
                  {...register('prefecture')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="奈良県"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  市区町村
                </label>
                <input
                  {...register('city')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="奈良市"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                番地・建物名
              </label>
              <input
                {...register('address1')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="1-2-3 マンション名"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                その他住所
              </label>
              <input
                {...register('address2')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="部屋番号など"
              />
            </div>

            {/* 位置情報取得ボタン */}
            <button
              type="button"
              onClick={getCurrentLocation}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📍 現在位置を取得
            </button>
            
            {locationData && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>位置情報:</strong> {locationData.address}
                </p>
              </div>
            )}
          </div>

          {/* 用途別の追加項目 */}
          {selectedType === 'sell' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">売却物件情報</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    物件種別
                  </label>
                  <select
                    {...register('extra.property_type')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">選択してください</option>
                    <option value="戸建て">戸建て</option>
                    <option value="マンション">マンション</option>
                    <option value="土地">土地</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    築年数
                  </label>
                  <input
                    {...register('extra.year_built')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="例: 2000年"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    土地面積（㎡）
                  </label>
                  <input
                    {...register('extra.land_size', { valueAsNumber: true })}
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    延床面積（㎡）
                  </label>
                  <input
                    {...register('extra.floor_area', { valueAsNumber: true })}
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    希望価格（万円）
                  </label>
                  <input
                    {...register('extra.expected_price', { valueAsNumber: true })}
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="2000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    残債（万円）
                  </label>
                  <input
                    {...register('extra.remaining_loan', { valueAsNumber: true })}
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    {...register('extra.psychological_defect')}
                    type="checkbox"
                    id="psychological_defect"
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="psychological_defect" className="ml-2 text-sm text-gray-700">
                    心理的瑕疵あり
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    {...register('extra.parking_state')}
                    type="checkbox"
                    id="parking_state"
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="parking_state" className="ml-2 text-sm text-gray-700">
                    駐車場空き
                  </label>
                </div>
              </div>
            </div>
          )}

          {selectedType === 'purchase' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">購入希望情報</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    予算（万円）
                  </label>
                  <input
                    {...register('extra.budget', { valueAsNumber: true })}
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="3000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    希望エリア
                  </label>
                  <input
                    {...register('extra.desired_area')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="奈良市、生駒市など"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    希望間取り
                  </label>
                  <select
                    {...register('extra.layout')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">選択してください</option>
                    <option value="1LDK">1LDK</option>
                    <option value="2LDK">2LDK</option>
                    <option value="3LDK">3LDK</option>
                    <option value="4LDK以上">4LDK以上</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    入居希望時期
                  </label>
                  <select
                    {...register('extra.move_in_timing')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">選択してください</option>
                    <option value="即入居可能">即入居可能</option>
                    <option value="1ヶ月以内">1ヶ月以内</option>
                    <option value="3ヶ月以内">3ヶ月以内</option>
                    <option value="6ヶ月以内">6ヶ月以内</option>
                    <option value="1年以内">1年以内</option>
                    <option value="未定">未定</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  {...register('extra.loan_preapproved')}
                  type="checkbox"
                  id="loan_preapproved"
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="loan_preapproved" className="ml-2 text-sm text-gray-700">
                  事前審査済み
                </label>
              </div>
            </div>
          )}

          {selectedType === 'reform' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">リフォーム希望情報</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対象箇所
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['キッチン', '浴室', 'トイレ', '洗面台', 'リビング', '寝室', '玄関', '外装'].map((room) => (
                    <div key={room} className="flex items-center">
                      <input
                        {...register('extra.target_rooms')}
                        type="checkbox"
                        value={room}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">{room}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    概算予算（万円）
                  </label>
                  <input
                    {...register('extra.rough_budget', { valueAsNumber: true })}
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    希望完了時期
                  </label>
                  <select
                    {...register('extra.desired_deadline')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">選択してください</option>
                    <option value="1ヶ月以内">1ヶ月以内</option>
                    <option value="3ヶ月以内">3ヶ月以内</option>
                    <option value="6ヶ月以内">6ヶ月以内</option>
                    <option value="1年以内">1年以内</option>
                    <option value="未定">未定</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  {...register('extra.visit_request')}
                  type="checkbox"
                  id="visit_request"
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="visit_request" className="ml-2 text-sm text-gray-700">
                  現地調査希望
                </label>
              </div>
            </div>
          )}

          {/* その他情報 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">その他情報</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                居住形態
              </label>
              <select
                {...register('residence_structure')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">選択してください</option>
                <option value="持家">持家</option>
                <option value="賃貸">賃貸</option>
                <option value="社宅">社宅</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                家族構成
              </label>
              <textarea
                {...register('household')}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="例: 夫婦2人、子供2人（小学生）"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                備考
              </label>
              <textarea
                {...register('note')}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="その他、特記事項があれば入力してください"
              />
            </div>
          </div>

          {/* 画像添付 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">画像添付</h2>
            
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleImageUpload}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                カメラで撮影するか、既存の画像を選択してください
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {attachments.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`添付画像 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 送信ボタン */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full px-6 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '送信中...' : '顧客情報を登録'}
            </button>
            
            {!isOnline && (
              <p className="text-sm text-yellow-600 mt-2 text-center">
                ※ オフライン状態です。入力内容はローカルに保存され、オンライン復帰時に自動送信されます。
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
