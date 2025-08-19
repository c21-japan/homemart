'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SellerSelect from '@/components/admin/properties/SellerSelect';

export default function NewPropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URLパラメータから売主IDを取得
  const sellerId = searchParams.get('sellerId');
  
  const [formData, setFormData] = useState({
    // 基本情報
    title: '',
    address: '',
    price: '',
    description: '',
    propertyType: 'apartment',
    status: 'available',
    featured: false,
    seller_customer_id: sellerId || '',
    
    // 詳細情報
    buildingAge: '',
    floor: '',
    totalFloors: '',
    area: '',
    rooms: '',
    bathrooms: '',
    parking: false,
    balcony: false,
    elevator: false,
    
    // 価格詳細
    managementFee: '',
    commonServiceFee: '',
    deposit: '',
    keyMoney: '',
    
    // 交通アクセス
    nearestStation: '',
    stationDistance: '',
    accessLine: '',
    
    // 周辺環境
    nearbyFacilities: '',
    environment: '',
    
    // 契約条件（売却・購入・リフォーム特化）
    contractType: 'sale', // sale, purchase, reform
    minContractPeriod: '',
    petAllowed: false,
    smokingAllowed: false,
    
    // その他
    notes: '',
    tags: ''
  });
  
  // 大阪・奈良県の路線データ
  const [lines] = useState([
    { id: 'jr', name: 'JR西日本', stations: ['大阪駅', '天王寺駅', '奈良駅', '王寺駅', '高田駅'] },
    { id: 'kintetsu', name: '近鉄', stations: ['大阪上本町駅', '奈良駅', '生駒駅', '学園前駅', '西大寺駅'] },
    { id: 'hankyu', name: '阪急', stations: ['梅田駅', '十三駅', '茨木市駅', '高槻市駅'] },
    { id: 'osaka_metro', name: '大阪メトロ', stations: ['梅田駅', '心斎橋駅', '難波駅', '天王寺駅'] },
    { id: 'nara_kotsu', name: '奈良交通', stations: ['奈良駅', '西大寺駅', '学園前駅', '生駒駅'] }
  ]);
  
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedStations] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSellerChange = (customerId: string | null) => {
    setFormData(prev => ({
      ...prev,
      seller_customer_id: customerId || ''
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // 30枚まで制限
      if (selectedImages.length + files.length > 30) {
        alert('画像は最大30枚までアップロードできます');
        return;
      }
      setSelectedImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // ドラッグ&ドロップ機能
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;

    const newImages = [...selectedImages];
    const draggedImage = newImages[dragIndex];
    newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    setSelectedImages(newImages);
    setDragIndex(null);
  };

  // 路線選択時の駅更新
  const handleLineChange = (lineId: string) => {
    setSelectedLine(lineId);
    // const line = lines.find(l => l.id === lineId);
    // if (line) {
    //   setSelectedStations(line.stations);
    // }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: 実際のAPIエンドポイントに置き換え
      console.log('物件登録データ:', formData);
      console.log('選択された画像:', selectedImages);
      
      // 成功時の処理
      alert('物件が正常に登録されました');
      router.push('/admin/properties');
    } catch (error) {
      console.error('物件登録エラー:', error);
      alert('物件登録中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">新規物件登録</h1>
          <Link
            href="/admin/properties"
            className="text-gray-600 hover:text-gray-900"
          >
            ← 物件一覧に戻る
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本情報セクション */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  物件名 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="物件名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  住所 *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="住所を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  価格 *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="価格を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  物件種別
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="apartment">マンション</option>
                  <option value="house">一戸建て</option>
                  <option value="land">土地</option>
                  <option value="commercial">商業施設</option>
                  <option value="office">オフィス</option>
                  <option value="warehouse">倉庫</option>
                </select>
                
                {/* 物件種別に応じた詳細選択ボタン */}
                <div className="mt-3 space-y-2">
                  {formData.propertyType === 'apartment' && (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">新築</button>
                      <button type="button" className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">中古</button>
                      <button type="button" className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">タワーマンション</button>
                      <button type="button" className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">低層マンション</button>
                    </div>
                  )}
                  {formData.propertyType === 'house' && (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200">新築</button>
                      <button type="button" className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200">中古</button>
                      <button type="button" className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200">注文住宅</button>
                      <button type="button" className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200">建売住宅</button>
                    </div>
                  )}
                  {formData.propertyType === 'land' && (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200">宅地</button>
                      <button type="button" className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200">農地</button>
                      <button type="button" className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200">商業地</button>
                      <button type="button" className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200">工業地</button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">空室</option>
                  <option value="occupied">入居中</option>
                  <option value="reserved">予約済み</option>
                  <option value="maintenance">メンテナンス中</option>
                  <option value="sold">売却済み</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  おすすめ物件として表示
                </label>
              </div>

              {/* 売主選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  売主
                </label>
                <SellerSelect
                  value={formData.seller_customer_id}
                  onChange={handleSellerChange}
                  placeholder="売主を検索（漢字・かな・ローマ字）"
                  className="mb-2"
                />
                <p className="text-xs text-gray-500">
                  💡 売主を選択しても物件情報は編集可能です。売主選択はロックではありません。
                </p>
              </div>
            </div>
          </div>

          {/* 詳細情報セクション */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">詳細情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  築年数
                </label>
                <input
                  type="number"
                  name="buildingAge"
                  value={formData.buildingAge}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="築年数を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  階数
                </label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="階数を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  総階数
                </label>
                <input
                  type="number"
                  name="totalFloors"
                  value={formData.totalFloors}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="総階数を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  面積（㎡）
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="面積を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  部屋数
                </label>
                <input
                  type="number"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="部屋数を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  浴室数
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="浴室数を入力"
                />
              </div>
            </div>

            {/* 設備・特徴 */}
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">設備・特徴</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="parking"
                    checked={formData.parking}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">駐車場</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="balcony"
                    checked={formData.balcony}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">バルコニー</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="elevator"
                    checked={formData.elevator}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">エレベーター</label>
                </div>
              </div>
            </div>
          </div>

          {/* 価格詳細セクション（売却・購入・リフォーム特化） */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">価格詳細</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  希望価格
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="希望価格を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  管理費・共益費
                </label>
                <input
                  type="number"
                  name="managementFee"
                  value={formData.managementFee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="月額管理費・共益費"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  リフォーム費用
                </label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="リフォーム費用（該当する場合）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  その他費用
                </label>
                <input
                  type="number"
                  name="keyMoney"
                  value={formData.keyMoney}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="その他必要な費用"
                />
              </div>
            </div>
          </div>

          {/* 交通アクセスセクション */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">交通アクセス</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  路線 *
                </label>
                <select
                  value={selectedLine}
                  onChange={(e) => handleLineChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">路線を選択</option>
                  {lines.map(line => (
                    <option key={line.id} value={line.id}>{line.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最寄り駅 *
                </label>
                <select
                  name="nearestStation"
                  value={formData.nearestStation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!selectedLine}
                >
                  <option value="">駅を選択</option>
                  {selectedStations.map(station => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  駅からの距離
                </label>
                <input
                  type="text"
                  name="stationDistance"
                  value={formData.stationDistance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="徒歩○分"
                />
              </div>
            </div>
          </div>

          {/* 周辺環境セクション */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">周辺環境</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  周辺施設
                </label>
                <textarea
                  name="nearbyFacilities"
                  value={formData.nearbyFacilities}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="スーパー、コンビニ、病院、学校などの周辺施設"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  環境・特徴
                </label>
                <textarea
                  name="environment"
                  value={formData.environment}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="静かな住宅街、商業地域、自然豊かなど"
                />
              </div>
            </div>
          </div>

          {/* 契約条件セクション（売却・購入・リフォーム特化） */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">契約条件</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  取引種別 *
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="sale">売却</option>
                  <option value="purchase">購入</option>
                  <option value="reform">リフォーム</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  希望時期
                </label>
                <select
                  name="minContractPeriod"
                  value={formData.minContractPeriod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="immediate">すぐに</option>
                  <option value="within_3months">3ヶ月以内</option>
                  <option value="within_6months">6ヶ月以内</option>
                  <option value="within_1year">1年以内</option>
                  <option value="over_1year">1年以上</option>
                </select>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="petAllowed"
                    checked={formData.petAllowed}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">ペット可</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="smokingAllowed"
                    checked={formData.smokingAllowed}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">喫煙可</label>
                </div>
              </div>
            </div>
          </div>

          {/* 写真・画像アップロードセクション（30枚対応・ドラッグ&ドロップ） */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">写真・画像（最大30枚）</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  物件写真を選択
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  複数選択可能（JPG、PNG、最大5MB）・ドラッグ&ドロップで並び替え可能
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  現在 {selectedImages.length}/30 枚
                </p>
              </div>

              {selectedImages.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-2">
                    選択された画像（ドラッグ&ドロップで並び替え）
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {selectedImages.map((image, index) => (
                      <div
                        key={index}
                        className={`relative cursor-move ${
                          dragIndex === index ? 'opacity-50' : ''
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`物件画像 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
                        />
                        <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    💡 画像をドラッグ&ドロップして順番を変更できます
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* その他セクション */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">その他</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  物件説明
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="物件の詳細説明、特徴、魅力などを入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグ
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="カンマ区切りでタグを入力（例：新築、駅近、ペット可）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  備考
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="その他特記事項があれば入力"
                />
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link
              href="/admin/properties"
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '登録中...' : '物件を登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
