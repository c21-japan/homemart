import { NextResponse } from 'next/server';
import {
  getDistributions,
  getInquiries,
  saveAIAnalysis
} from '@/server/actions/flyers';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(today.getDate() - today.getDay());
    const lastWeekStart = new Date(lastWeekEnd);
    lastWeekStart.setDate(lastWeekEnd.getDate() - 6);

    const startDate = lastWeekStart.toISOString().split('T')[0];
    const endDate = lastWeekEnd.toISOString().split('T')[0];

    const [distributions, inquiries] = await Promise.all([
      getDistributions({ startDate, endDate }),
      getInquiries({ startDate, endDate })
    ]);

    const totalDistributed = distributions.reduce((sum, d) => sum + d.quantity, 0);
    const totalInquiries = inquiries.length;
    const overallResponseRate = totalDistributed > 0
      ? (totalInquiries / totalDistributed) * 100
      : 0;

    const designStats = distributions.reduce((acc, dist) => {
      if (!acc[dist.design_id]) {
        acc[dist.design_id] = {
          design_id: dist.design_id,
          design_name: (dist as any).flyer_designs?.design_name || dist.design_id,
          distributed: 0,
          inquiries: 0
        };
      }
      acc[dist.design_id].distributed += dist.quantity;
      return acc;
    }, {} as Record<string, any>);

    inquiries.forEach(inq => {
      if (inq.design_id && designStats[inq.design_id]) {
        designStats[inq.design_id].inquiries += 1;
      }
    });

    const topDesigns = Object.values(designStats)
      .map(d => ({
        ...d,
        response_rate: d.distributed > 0 ? (d.inquiries / d.distributed) * 100 : 0
      }))
      .sort((a, b) => b.response_rate - a.response_rate)
      .slice(0, 5);

    const areaStats = distributions.reduce((acc, dist) => {
      if (!acc[dist.area]) {
        acc[dist.area] = { area: dist.area, distributed: 0, inquiries: 0 };
      }
      acc[dist.area].distributed += dist.quantity;
      return acc;
    }, {} as Record<string, any>);

    inquiries.forEach(inq => {
      if (inq.distribution_area && areaStats[inq.distribution_area]) {
        areaStats[inq.distribution_area].inquiries += 1;
      }
    });

    const topAreas = Object.values(areaStats)
      .map(a => ({
        ...a,
        response_rate: a.distributed > 0 ? (a.inquiries / a.distributed) * 100 : 0
      }))
      .sort((a, b) => b.response_rate - a.response_rate)
      .slice(0, 5);

    const recommendations = `
【分析結果】

◆ 最も効果的なデザイン
${topDesigns[0]?.design_name}が反応率${topDesigns[0]?.response_rate.toFixed(2)}%で最高のパフォーマンスを示しています。

◆ 推奨エリア
${topAreas[0]?.area}エリアでの反応率が${topAreas[0]?.response_rate.toFixed(2)}%と高く、重点配布を推奨します。

◆ 来週の戦略提案
1. ${topDesigns[0]?.design_name}を${topAreas[0]?.area}エリアに集中投下
2. 反応率の低いデザインは訴求ポイントの見直しを検討
3. 新規エリアでのテスト配布を実施
`;

    await saveAIAnalysis({
      analysis_week: startDate,
      week_start: startDate,
      week_end: endDate,
      total_distributed: totalDistributed,
      total_inquiries: totalInquiries,
      overall_response_rate: parseFloat(overallResponseRate.toFixed(2)),
      top_performing_designs: topDesigns,
      top_performing_areas: topAreas,
      recommendations,
      analysis_data: {
        distributions,
        inquiries,
        designStats,
        areaStats
      }
    });

    return NextResponse.json({
      success: true,
      message: '週次分析が完了しました',
      data: {
        period: `${startDate} - ${endDate}`,
        totalDistributed,
        totalInquiries,
        overallResponseRate: overallResponseRate.toFixed(2)
      }
    });
  } catch (error) {
    console.error('週次分析エラー:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
