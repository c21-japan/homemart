import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 一時的にモックデータを返す
    const mockStats = {
      totalCustomers: 150,
      newCustomersThisMonth: 25,
      totalProperties: 89,
      activeLeads: 67,
      conversionRate: 23.5
    };
    
    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('統計データ取得エラー:', error);
    return NextResponse.json(
      { error: '統計データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
