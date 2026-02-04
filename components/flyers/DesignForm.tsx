'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFlyerDesign } from '@/server/actions/flyers';
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

export function DesignForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    design_id: '',
    design_name: '',
    design_image_url: '',
    designer_name: '',
    designer_source: 'internal',
    appeal_point: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createFlyerDesign({
        design_id: formData.design_id,
        design_name: formData.design_name,
        design_image_url: formData.design_image_url || undefined,
        designer_name: formData.designer_name || undefined,
        designer_source: formData.designer_source as any,
        appeal_point: formData.appeal_point || undefined,
        is_active: formData.is_active
      });

      toast.success('デザインを登録しました');
      router.push('/admin/flyers/designs');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="design_id">デザインID *</Label>
        <Input
          id="design_id"
          value={formData.design_id}
          onChange={(e) => handleChange('design_id', e.target.value)}
          placeholder="例: design-004"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="design_name">デザイン名 *</Label>
        <Input
          id="design_name"
          value={formData.design_name}
          onChange={(e) => handleChange('design_name', e.target.value)}
          placeholder="例: 買取強化キャンペーン_青"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="designer_source">制作元</Label>
        <Select
          value={formData.designer_source}
          onValueChange={(value) => handleChange('designer_source', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="制作元を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="internal">社内</SelectItem>
            <SelectItem value="crowdworks">クラウドワークス</SelectItem>
            <SelectItem value="ai-generated">AI生成</SelectItem>
            <SelectItem value="other">その他</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="designer_name">デザイナー名</Label>
        <Input
          id="designer_name"
          value={formData.designer_name}
          onChange={(e) => handleChange('designer_name', e.target.value)}
          placeholder="例: 山田"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="design_image_url">画像URL</Label>
        <Input
          id="design_image_url"
          value={formData.design_image_url}
          onChange={(e) => handleChange('design_image_url', e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="appeal_point">訴求ポイント</Label>
        <Textarea
          id="appeal_point"
          value={formData.appeal_point}
          onChange={(e) => handleChange('appeal_point', e.target.value)}
          placeholder="訴求内容を入力"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_active"
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => handleChange('is_active', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="is_active">アクティブ</Label>
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
