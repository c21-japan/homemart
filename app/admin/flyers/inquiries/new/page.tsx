import { InquiryForm } from '@/components/flyers/InquiryForm';
import { getFlyerDesigns, getUniqueAreas } from '@/server/actions/flyers';

export const dynamic = 'force-dynamic';

export default async function NewInquiryPage() {
  const [designs, areas] = await Promise.all([
    getFlyerDesigns(true),
    getUniqueAreas()
  ]);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">問い合わせ登録</h1>
      <InquiryForm designs={designs} existingAreas={areas} />
    </div>
  );
}
