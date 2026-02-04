import Link from 'next/link';
import { getDistributions } from '@/server/actions/flyers';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function DistributionsPage() {
  const distributions = await getDistributions();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">配布記録一覧</h1>
        <Link href="/admin/flyers/distributions/new">
          <Button>配布記録を追加</Button>
        </Link>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">配布日</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">デザイン</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">エリア</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">配布範囲</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">枚数</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">担当</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">未配布/伝達</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {distributions.map((dist) => (
              <tr key={dist.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{dist.distribution_date}</td>
                <td className="px-4 py-3">
                  {(dist as any).flyer_designs?.design_name || dist.design_id}
                </td>
                <td className="px-4 py-3">{dist.area}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {dist.start_point || dist.end_point
                    ? `${dist.start_point || '-'} 〜 ${dist.end_point || '-'}`
                    : '-'}
                </td>
                <td className="px-4 py-3 text-right">{dist.quantity.toLocaleString()}枚</td>
                <td className="px-4 py-3">{dist.distributor_name || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="max-w-xs whitespace-pre-wrap">
                    {dist.undistributed_buildings || dist.communication_notes
                      ? [dist.undistributed_buildings, dist.communication_notes].filter(Boolean).join('\n')
                      : '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {distributions.length === 0 && (
          <div className="p-6 text-center text-gray-500">配布記録がありません</div>
        )}
      </div>
    </div>
  );
}
