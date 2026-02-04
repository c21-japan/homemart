import { NextResponse } from 'next/server';
import { getDesignPerformance } from '@/server/actions/flyers';

export async function POST(request: Request) {
  try {
    const { appeal_point, count = 3 } = await request.json();

    const pastPerformance = await getDesignPerformance();

    const prompt = `
不動産・リフォーム会社のチラシデザイン

【訴求ポイント】
${appeal_point}

【デザイン要件】
- A4サイズ、縦向き
- 会社名: センチュリー21 HOMEMART
- 信頼感のあるプロフェッショナルなデザイン
- 連絡先情報: 0120-43-8639
- カラー: 企業カラーを意識した配色
- 写真: 不動産・リフォーム関連の高品質イメージ
- 読みやすいレイアウト

【参考情報】
過去の高反応率デザインの特徴:
${pastPerformance.slice(0, 3).map(d => `- ${d.design_name}: ${d.response_rate}%`).join('\n')}
`;

    const designConcepts = [];
    for (let i = 0; i < count; i += 1) {
      designConcepts.push({
        url: `https://example.com/generated-design-${i + 1}.png`,
        prompt: `${prompt} - バリエーション${i + 1}`
      });
    }

    return NextResponse.json({
      success: true,
      designs: designConcepts,
      prompt
    });
  } catch (error) {
    console.error('デザイン生成エラー:', error);
    return NextResponse.json(
      { error: 'Design generation failed' },
      { status: 500 }
    );
  }
}
