import Link from 'next/link';
import { getFlyerDesigns } from '@/server/actions/flyers';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function DesignsPage() {
  const designs = await getFlyerDesigns(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">デザイン管理</h1>
        <Link href="/admin/flyers/designs/new">
          <Button>デザインを追加</Button>
        </Link>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">デザインID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">名称</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">制作元</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">反応率</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">配布枚数</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">問い合わせ</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">状態</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {designs.map((design) => (
              <tr key={design.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{design.design_id}</td>
                <td className="px-4 py-3">{design.design_name}</td>
                <td className="px-4 py-3">{design.designer_source || '-'}</td>
                <td className="px-4 py-3">{design.response_rate?.toFixed?.(2) || '0.00'}%</td>
                <td className="px-4 py-3 text-right">{design.total_distributed.toLocaleString()}枚</td>
                <td className="px-4 py-3 text-right">{design.total_inquiries.toLocaleString()}件</td>
                <td className="px-4 py-3">
                  {design.is_active ? (
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">有効</span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">停止</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {designs.length === 0 && (
          <div className="p-6 text-center text-gray-500">デザインがありません</div>
        )}
      </div>
    </div>
  );
}
