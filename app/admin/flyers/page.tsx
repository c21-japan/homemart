import Link from 'next/link';
import {
  getDesignPerformance,
  getAreaPerformance,
  getWeeklySummary,
  getAIAnalysis
} from '@/server/actions/flyers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  MapPin,
  Calendar,
  BarChart3,
  FileText,
  MessageSquare,
  Palette,
  Printer
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FlyersDashboardPage() {
  const [designPerf, areaPerf, weeklySummary, aiAnalysis] = await Promise.all([
    getDesignPerformance(),
    getAreaPerformance(),
    getWeeklySummary(),
    getAIAnalysis()
  ]);

  const currentWeek = weeklySummary?.[0];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-3xl font-bold">チラシマーケティング分析</h1>
        <div className="flex gap-2">
          <Link href="/admin/flyers/prints/new">
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              印刷記録登録
            </Button>
          </Link>
          <Link href="/admin/flyers/distributions/new">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              配布記録登録
            </Button>
          </Link>
          <Link href="/admin/flyers/inquiries/new">
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              問い合わせ登録
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今週の配布枚数</CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWeek?.total_distributed?.toLocaleString?.() || 0}枚
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">配布回数</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWeek?.distribution_count || 0}回
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">使用デザイン数</CardTitle>
            <Palette className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWeek?.unique_designs || 0}種類
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">配布エリア数</CardTitle>
            <MapPin className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWeek?.unique_areas || 0}地域
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            デザイン別反応率ランキング
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {designPerf.slice(0, 5).map((design, index) => (
              <div key={design.design_id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{design.design_name}</p>
                    <p className="text-sm text-gray-500">
                      {design.total_distributed.toLocaleString()}枚 → {design.total_inquiries}件
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {design.response_rate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-500">
                    {design.areas_distributed}エリアで配布
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            エリア別反応率
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {areaPerf.slice(0, 5).map((area, index) => (
              <div key={area.area} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-500">
                    {index + 1}.
                  </span>
                  <div>
                    <p className="font-medium">{area.area}</p>
                    <p className="text-sm text-gray-500">
                      {area.total_distributed.toLocaleString()}枚 / {area.unique_designs_used}デザイン使用
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">
                    {area.response_rate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-500">
                    {area.total_inquiries}件の問い合わせ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {aiAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              AI分析による提案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{aiAnalysis.recommendations}</p>
            </div>
            <div className="mt-4">
              <Link href="/admin/flyers/analysis">
                <Button variant="outline">
                  詳細な分析レポートを見る
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/admin/flyers/distributions">
          <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
            <CardContent className="flex items-center gap-3 p-6">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold">配布記録一覧</p>
                <p className="text-sm text-gray-500">過去の配布履歴を確認</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/flyers/inquiries">
          <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
            <CardContent className="flex items-center gap-3 p-6">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold">問い合わせ一覧</p>
                <p className="text-sm text-gray-500">反応データを確認</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/flyers/designs">
          <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
            <CardContent className="flex items-center gap-3 p-6">
              <Palette className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold">デザイン管理</p>
                <p className="text-sm text-gray-500">チラシデザインを管理</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/flyers/prints">
          <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
            <CardContent className="flex items-center gap-3 p-6">
              <Printer className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold">印刷進捗一覧</p>
                <p className="text-sm text-gray-500">印刷の進捗を確認</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
