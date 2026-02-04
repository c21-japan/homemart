import { DesignForm } from '@/components/flyers/DesignForm';

export const dynamic = 'force-dynamic';

export default async function NewDesignPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">デザイン登録</h1>
      <DesignForm />
    </div>
  );
}
