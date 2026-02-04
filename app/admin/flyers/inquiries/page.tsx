import Link from 'next/link';
import { getInquiries } from '@/server/actions/flyers';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">問い合わせ一覧</h1>
        <Link href="/admin/flyers/inquiries/new">
          <Button>問い合わせを追加</Button>
        </Link>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">日時</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">経路</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">内容</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">デザイン</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">エリア</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">担当</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inquiries.map((inq) => (
              <tr key={inq.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{new Date(inq.inquiry_datetime).toLocaleString('ja-JP')}</td>
                <td className="px-4 py-3">{inq.inquiry_channel}</td>
                <td className="px-4 py-3">{inq.inquiry_type}</td>
                <td className="px-4 py-3">{(inq as any).flyer_designs?.design_name || inq.design_id || '-'}</td>
                <td className="px-4 py-3">{inq.distribution_area || '-'}</td>
                <td className="px-4 py-3">{inq.handler_name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {inquiries.length === 0 && (
          <div className="p-6 text-center text-gray-500">問い合わせがありません</div>
        )}
      </div>
    </div>
  );
}
