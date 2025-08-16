'use client';

import { useState, useEffect } from 'react';
import { updateReformCosts } from '@/server/actions/customers';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface ReformCostCardProps {
  projectId: string;
  expectedRevenue: number;
  initialCosts?: {
    material_cost: number;
    outsourcing_cost: number;
    travel_cost: number;
    other_cost: number;
    note?: string;
  };
  onUpdate?: () => void;
}

export function ReformCostCard({ 
  projectId, 
  expectedRevenue, 
  initialCosts, 
  onUpdate 
}: ReformCostCardProps) {
  const [costs, setCosts] = useState({
    material_cost: initialCosts?.material_cost || 0,
    outsourcing_cost: initialCosts?.outsourcing_cost || 0,
    travel_cost: initialCosts?.travel_cost || 0,
    other_cost: initialCosts?.other_cost || 0,
    note: initialCosts?.note || ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 初期値との比較で変更があるかチェック
  useEffect(() => {
    const changed = 
      costs.material_cost !== (initialCosts?.material_cost || 0) ||
      costs.outsourcing_cost !== (initialCosts?.outsourcing_cost || 0) ||
      costs.travel_cost !== (initialCosts?.travel_cost || 0) ||
      costs.other_cost !== (initialCosts?.other_cost || 0) ||
      costs.note !== (initialCosts?.note || '');
    
    setHasChanges(changed);
  }, [costs, initialCosts]);

  // 合計原価
  const totalCosts = costs.material_cost + costs.outsourcing_cost + costs.travel_cost + costs.other_cost;
  
  // 見込み粗利
  const expectedProfit = expectedRevenue - totalCosts;
  
  // 粗利率
  const profitMargin = expectedRevenue > 0 ? (expectedProfit / expectedRevenue) * 100 : 0;

  // 入力値の更新
  const handleInputChange = (field: keyof typeof costs, value: string | number) => {
    setCosts(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value : Math.max(0, value)
    }));
  };

  // 保存処理
  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const result = await updateReformCosts(projectId, costs);
      
      if (result.success) {
        setIsEditing(false);
        setHasChanges(false);
        onUpdate?.();
      } else {
        console.error('原価更新エラー:', result.error);
        alert('原価の更新に失敗しました');
      }
    } catch (error) {
      console.error('原価更新エラー:', error);
      alert('原価の更新中にエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    setCosts({
      material_cost: initialCosts?.material_cost || 0,
      outsourcing_cost: initialCosts?.outsourcing_cost || 0,
      travel_cost: initialCosts?.travel_cost || 0,
      other_cost: initialCosts?.other_cost || 0,
      note: initialCosts?.note || ''
    });
    setIsEditing(false);
    setHasChanges(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">原価・収益管理</h3>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                  hasChanges && !isSaving
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              編集
            </button>
          )}
        </div>
      </div>

      {/* 収益・粗利サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-600">見込み売上</div>
          <div className="text-2xl font-bold text-blue-900">
            ¥{expectedRevenue.toLocaleString()}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm font-medium text-red-600">合計原価</div>
          <div className="text-2xl font-bold text-red-900">
            ¥{totalCosts.toLocaleString()}
          </div>
        </div>
        <div className={cn(
          "rounded-lg p-4",
          expectedProfit >= 0 ? "bg-green-50" : "bg-orange-50"
        )}>
          <div className={cn(
            "text-sm font-medium",
            expectedProfit >= 0 ? "text-green-600" : "text-orange-600"
          )}>
            見込み粗利
          </div>
          <div className={cn(
            "text-2xl font-bold",
            expectedProfit >= 0 ? "text-green-900" : "text-orange-900"
          )}>
            ¥{expectedProfit.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            粗利率: {profitMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 原価詳細 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">原価内訳</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 材料費 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              材料費
            </label>
            {isEditing ? (
              <input
                type="number"
                value={costs.material_cost}
                onChange={(e) => handleInputChange('material_cost', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                ¥{costs.material_cost.toLocaleString()}
              </div>
            )}
          </div>

          {/* 外注費 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              外注費
            </label>
            {isEditing ? (
              <input
                type="number"
                value={costs.outsourcing_cost}
                onChange={(e) => handleInputChange('outsourcing_cost', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                ¥{costs.outsourcing_cost.toLocaleString()}
              </div>
            )}
          </div>

          {/* 交通費 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              交通費
            </label>
            {isEditing ? (
              <input
                type="number"
                value={costs.travel_cost}
                onChange={(e) => handleInputChange('travel_cost', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                ¥{costs.travel_cost.toLocaleString()}
              </div>
            )}
          </div>

          {/* その他 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              その他
            </label>
            {isEditing ? (
              <input
                type="number"
                value={costs.other_cost}
                onChange={(e) => handleInputChange('other_cost', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                ¥{costs.other_cost.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* 備考 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            備考
          </label>
          {isEditing ? (
            <textarea
              value={costs.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="原価に関する備考があれば入力してください"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md min-h-[60px]">
              {costs.note || '備考なし'}
            </div>
          )}
        </div>
      </div>

      {/* 収益性インジケーター */}
      {expectedRevenue > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">収益性分析</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">原価率:</span>
              <span className="text-sm font-medium">
                {((totalCosts / expectedRevenue) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">粗利率:</span>
              <span className={cn(
                "text-sm font-medium",
                profitMargin >= 20 ? "text-green-600" : 
                profitMargin >= 10 ? "text-yellow-600" : "text-red-600"
              )}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">収益性:</span>
              <Badge 
                variant={profitMargin >= 20 ? "success" : profitMargin >= 10 ? "warning" : "destructive"}
              >
                {profitMargin >= 20 ? "高収益" : profitMargin >= 10 ? "中収益" : "低収益"}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
