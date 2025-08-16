import { NextResponse } from 'next/server';
import { getMonthlyStats } from '@/server/actions/customers';

export async function GET() {
  try {
    const stats = await getMonthlyStats();
    
    if (stats.success) {
      return NextResponse.json(stats.stats);
    } else {
      return NextResponse.json(
        { error: stats.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('統計データ取得エラー:', error);
    return NextResponse.json(
      { error: '統計データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
