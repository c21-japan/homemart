import Link from 'next/link';
import { getPrintJobs } from '@/server/actions/flyers';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'planned':
      return '予定';
    case 'in_progress':
      return '進行中';
    case 'completed':
      return '完了';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planned':
      return 'bg-gray-100 text-gray-700';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default async function PrintJobsPage() {
  const printJobs = await getPrintJobs();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">印刷進捗一覧</h1>
        <Link href="/admin/flyers/prints/new">
          <Button>印刷記録を追加</Button>
        </Link>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">印刷日</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">デザイン</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">担当</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">範囲</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">予定枚数</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">印刷済み</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">達成率</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">進捗</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {printJobs.map((job) => {
              const planned = job.range_end - job.range_start + 1;
              const rate = planned > 0 ? (job.printed_quantity / planned) * 100 : 0;
              return (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{job.print_date}</td>
                  <td className="px-4 py-3">
                    {(job as any).flyer_designs?.design_name || job.design_id}
                  </td>
                  <td className="px-4 py-3">{job.printer_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {job.range_start} 〜 {job.range_end}
                  </td>
                  <td className="px-4 py-3 text-right">{planned.toLocaleString()}枚</td>
                  <td className="px-4 py-3 text-right">{job.printed_quantity.toLocaleString()}枚</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {rate.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {printJobs.length === 0 && (
          <div className="p-6 text-center text-gray-500">印刷記録がありません</div>
        )}
      </div>
    </div>
  );
}
