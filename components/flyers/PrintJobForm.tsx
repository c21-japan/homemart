'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPrintJob } from '@/server/actions/flyers';
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

interface PrintJobFormProps {
  designs: FlyerDesign[];
}

const PRINTER_SUGGESTIONS = ['千春', 'ひな'];

export function PrintJobForm({ designs }: PrintJobFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    print_date: new Date().toISOString().split('T')[0],
    design_id: '',
    printer_name: '',
    range_start: '',
    range_end: '',
    printed_quantity: '',
    status: 'planned',
    notes: ''
  });

  const plannedQuantity = useMemo(() => {
    const start = parseInt(formData.range_start, 10);
    const end = parseInt(formData.range_end, 10);
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
    return end - start + 1;
  }, [formData.range_start, formData.range_end]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const printedQuantityValue = formData.printed_quantity
        ? parseInt(formData.printed_quantity, 10)
        : 0;

      if (plannedQuantity !== null && printedQuantityValue > plannedQuantity) {
        toast.error('印刷済み枚数が予定枚数を超えています');
        setIsLoading(false);
        return;
      }

      await createPrintJob({
        print_date: formData.print_date,
        design_id: formData.design_id,
        printer_name: formData.printer_name,
        range_start: parseInt(formData.range_start, 10),
        range_end: parseInt(formData.range_end, 10),
        printed_quantity: printedQuantityValue,
        status: formData.status as 'planned' | 'in_progress' | 'completed',
        notes: formData.notes || undefined
      });

      toast.success('印刷記録を登録しました');
      router.push('/admin/flyers/prints');
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
        <Label htmlFor="print_date">印刷日 *</Label>
        <Input
          id="print_date"
          type="date"
          value={formData.print_date}
          onChange={(e) => handleChange('print_date', e.target.value)}
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
        <Label htmlFor="printer_name">印刷担当者 *</Label>
        <Input
          id="printer_name"
          list="printer_suggestions"
          value={formData.printer_name}
          onChange={(e) => handleChange('printer_name', e.target.value)}
          placeholder="例: 千春"
          required
        />
        <datalist id="printer_suggestions">
          {PRINTER_SUGGESTIONS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="range_start">印刷開始番号 *</Label>
          <Input
            id="range_start"
            type="number"
            min="1"
            value={formData.range_start}
            onChange={(e) => handleChange('range_start', e.target.value)}
            placeholder="例: 1"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="range_end">印刷終了番号 *</Label>
          <Input
            id="range_end"
            type="number"
            min="1"
            value={formData.range_end}
            onChange={(e) => handleChange('range_end', e.target.value)}
            placeholder="例: 500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="printed_quantity">印刷済み枚数</Label>
          <Input
            id="printed_quantity"
            type="number"
            min="0"
            value={formData.printed_quantity}
            onChange={(e) => handleChange('printed_quantity', e.target.value)}
            placeholder={plannedQuantity ? `予定 ${plannedQuantity} 枚` : '例: 250'}
          />
          {plannedQuantity !== null && (
            <p className="text-xs text-gray-500">予定枚数: {plannedQuantity}枚</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">進捗ステータス</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="進捗を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">予定</SelectItem>
              <SelectItem value="in_progress">進行中</SelectItem>
              <SelectItem value="completed">完了</SelectItem>
            </SelectContent>
          </Select>
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
