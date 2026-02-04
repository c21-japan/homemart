'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInquiry } from '@/server/actions/flyers';
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

interface InquiryFormProps {
  designs: FlyerDesign[];
  existingAreas: string[];
}

export function InquiryForm({ designs, existingAreas }: InquiryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    inquiry_datetime: new Date().toISOString().slice(0, 16),
    inquiry_channel: '',
    inquiry_type: '',
    design_id: '',
    distribution_area: '',
    conversion_possibility: '',
    handler_name: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createInquiry({
        inquiry_datetime: formData.inquiry_datetime,
        inquiry_channel: formData.inquiry_channel as any,
        inquiry_type: formData.inquiry_type,
        design_id: formData.design_id || undefined,
        distribution_area: formData.distribution_area || undefined,
        conversion_possibility: (formData.conversion_possibility as any) || undefined,
        handler_name: formData.handler_name || undefined,
        notes: formData.notes || undefined
      });

      toast.success('問い合わせを登録しました');
      router.push('/admin/flyers/inquiries');
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
        <Label htmlFor="inquiry_datetime">問い合わせ日時 *</Label>
        <Input
          id="inquiry_datetime"
          type="datetime-local"
          value={formData.inquiry_datetime}
          onChange={(e) => handleChange('inquiry_datetime', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inquiry_channel">問い合わせ経路 *</Label>
        <Select
          value={formData.inquiry_channel}
          onValueChange={(value) => handleChange('inquiry_channel', value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="経路を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="phone">電話</SelectItem>
            <SelectItem value="line">LINE</SelectItem>
            <SelectItem value="web">Webフォーム</SelectItem>
            <SelectItem value="visit">来店</SelectItem>
            <SelectItem value="other">その他</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inquiry_type">問い合わせ内容 *</Label>
        <Select
          value={formData.inquiry_type}
          onValueChange={(value) => handleChange('inquiry_type', value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="内容を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="売買相談">売買相談</SelectItem>
            <SelectItem value="買取相談">買取相談</SelectItem>
            <SelectItem value="リフォーム見積もり">リフォーム見積もり</SelectItem>
            <SelectItem value="査定依頼">査定依頼</SelectItem>
            <SelectItem value="物件問い合わせ">物件問い合わせ</SelectItem>
            <SelectItem value="その他">その他</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="design_id">どのチラシを見たか</Label>
        <Select
          value={formData.design_id}
          onValueChange={(value) => handleChange('design_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="デザインを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">不明</SelectItem>
            {designs.map((design) => (
              <SelectItem key={design.design_id} value={design.design_id}>
                {design.design_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="distribution_area">配布エリア</Label>
        <Select
          value={formData.distribution_area}
          onValueChange={(value) => handleChange('distribution_area', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="エリアを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">不明</SelectItem>
            <SelectItem value="広陵町笠">広陵町笠</SelectItem>
            <SelectItem value="広陵町百済">広陵町百済</SelectItem>
            {existingAreas.map(area => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="conversion_possibility">成約可能性</Label>
        <Select
          value={formData.conversion_possibility}
          onValueChange={(value) => handleChange('conversion_possibility', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="可能性を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">高</SelectItem>
            <SelectItem value="medium">中</SelectItem>
            <SelectItem value="low">低</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="handler_name">対応担当者</Label>
        <Input
          id="handler_name"
          value={formData.handler_name}
          onChange={(e) => handleChange('handler_name', e.target.value)}
          placeholder="例: 乾"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">備考</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="詳細な内容や特記事項を入力してください"
          rows={4}
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
