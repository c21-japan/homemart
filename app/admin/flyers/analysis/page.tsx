import { getAIAnalysis } from '@/server/actions/flyers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function FlyerAnalysisPage() {
  const analysis = await getAIAnalysis();

  if (!analysis) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">AI分析レポート</h1>
        <div className="text-gray-500">分析データがありません</div>
      </div>
    );
  }

  const topDesigns = Array.isArray(analysis.top_performing_designs)
    ? analysis.top_performing_designs
    : [];
  const topAreas = Array.isArray(analysis.top_performing_areas)
    ? analysis.top_performing_areas
    : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">AI分析レポート</h1>

      <Card>
        <CardHeader>
          <CardTitle>期間</CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.week_start} 〜 {analysis.week_end}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>サマリー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">配布枚数</div>
              <div className="text-xl font-semibold">{analysis.total_distributed.toLocaleString()}枚</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">問い合わせ</div>
              <div className="text-xl font-semibold">{analysis.total_inquiries.toLocaleString()}件</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">反応率</div>
              <div className="text-xl font-semibold">{analysis.overall_response_rate?.toFixed?.(2) || '0.00'}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>デザイン別TOP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topDesigns.length === 0 && <div className="text-gray-500">データなし</div>}
            {topDesigns.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <div>{item.design_name || item.design_id}</div>
                <div className="text-gray-600">{item.response_rate?.toFixed?.(2) || '0.00'}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>エリア別TOP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topAreas.length === 0 && <div className="text-gray-500">データなし</div>}
            {topAreas.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <div>{item.area}</div>
                <div className="text-gray-600">{item.response_rate?.toFixed?.(2) || '0.00'}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>提案</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{analysis.recommendations}</p>
        </CardContent>
      </Card>
    </div>
  );
}
