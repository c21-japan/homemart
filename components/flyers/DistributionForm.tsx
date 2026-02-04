'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDistribution } from '@/server/actions/flyers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { FlyerDesign } from '@/types/flyers';

interface DistributionFormProps {
  designs: FlyerDesign[];
  existingAreas: string[];
}

export function DistributionForm({ designs, existingAreas }: DistributionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    distribution_date: new Date().toISOString().split('T')[0],
    design_id: '',
    area: '',
    start_point: '',
    end_point: '',
    undistributed_buildings: '',
    communication_notes: '',
    quantity: '',
    distributor_name: '',
    print_date: '',
    print_quantity: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createDistribution({
        distribution_date: formData.distribution_date,
        design_id: formData.design_id,
        area: formData.area,
        start_point: formData.start_point || undefined,
        end_point: formData.end_point || undefined,
        undistributed_buildings: formData.undistributed_buildings || undefined,
        communication_notes: formData.communication_notes || undefined,
        quantity: parseInt(formData.quantity, 10),
        distributor_name: formData.distributor_name || undefined,
        print_date: formData.print_date || undefined,
        print_quantity: formData.print_quantity ? parseInt(formData.print_quantity, 10) : undefined,
        notes: formData.notes || undefined
      });

      toast.success('配布記録を登録しました');
      router.push('/admin/flyers/distributions');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="distribution_date">配布日 *</Label>
        <Input
          id="distribution_date"
          type="date"
          value={formData.distribution_date}
          onChange={(e) => handleChange('distribution_date', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="design_id">チラシデザイン *</Label>
        <Select
          value={formData.design_id}
          onValueChange={(value) => handleChange('design_id', value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="デザインを選択" />
          </SelectTrigger>
          <SelectContent>
            {designs.map((design) => (
              <SelectItem key={design.design_id} value={design.design_id}>
                {design.design_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="area">配布エリア *</Label>
        <Select
          value={formData.area}
          onValueChange={(value) => handleChange('area', value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="エリアを選択または新規入力" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="広陵町笠">広陵町笠</SelectItem>
            <SelectItem value="広陵町百済">広陵町百済</SelectItem>
            <SelectItem value="広陵町古寺">広陵町古寺</SelectItem>
            <SelectItem value="広陵町南郷">広陵町南郷</SelectItem>
            {existingAreas
              .filter(a => !['広陵町笠', '広陵町百済', '広陵町古寺', '広陵町南郷'].includes(a))
              .map(area => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="または新しいエリア名を入力"
          value={formData.area}
          onChange={(e) => handleChange('area', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">配布枚数 *</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => handleChange('quantity', e.target.value)}
          placeholder="例: 500"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_point">配布開始地点</Label>
          <Input
            id="start_point"
            value={formData.start_point}
            onChange={(e) => handleChange('start_point', e.target.value)}
            placeholder="例: 〇〇マンション 1階から"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_point">配布終了地点</Label>
          <Input
            id="end_point"
            value={formData.end_point}
            onChange={(e) => handleChange('end_point', e.target.value)}
            placeholder="例: 〇〇マンション 10階まで"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="undistributed_buildings">配布できなかったマンション</Label>
        <Textarea
          id="undistributed_buildings"
          value={formData.undistributed_buildings}
          onChange={(e) => handleChange('undistributed_buildings', e.target.value)}
          placeholder="例: △△マンション（管理人NG）\n□□マンション（ポスト封鎖）"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="communication_notes">伝達事項</Label>
        <Textarea
          id="communication_notes"
          value={formData.communication_notes}
          onChange={(e) => handleChange('communication_notes', e.target.value)}
          placeholder="例: 管理人から注意あり、次回は事前連絡"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="distributor_name">配布担当者</Label>
        <Input
          id="distributor_name"
          value={formData.distributor_name}
          onChange={(e) => handleChange('distributor_name', e.target.value)}
          placeholder="例: 今津"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="print_date">印刷日</Label>
          <Input
            id="print_date"
            type="date"
            value={formData.print_date}
            onChange={(e) => handleChange('print_date', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="print_quantity">印刷枚数</Label>
          <Input
            id="print_quantity"
            type="number"
            min="1"
            value={formData.print_quantity}
            onChange={(e) => handleChange('print_quantity', e.target.value)}
            placeholder="例: 1000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">備考</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="特記事項があれば入力してください"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '登録中...' : '登録する'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
