import { DistributionForm } from '@/components/flyers/DistributionForm';
import { getFlyerDesigns, getUniqueAreas } from '@/server/actions/flyers';

export const dynamic = 'force-dynamic';

export default async function NewDistributionPage() {
  const [designs, areas] = await Promise.all([
    getFlyerDesigns(true),
    getUniqueAreas()
  ]);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">チラシ配布記録登録</h1>
      <DistributionForm designs={designs} existingAreas={areas} />
    </div>
  );
}
