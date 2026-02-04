import { PrintJobForm } from '@/components/flyers/PrintJobForm';
import { getFlyerDesigns } from '@/server/actions/flyers';

export const dynamic = 'force-dynamic';

export default async function NewPrintJobPage() {
  const designs = await getFlyerDesigns(true);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">チラシ印刷記録登録</h1>
      <div className="bg-white border rounded-lg p-6">
        <PrintJobForm designs={designs} />
      </div>
    </div>
  );
}
