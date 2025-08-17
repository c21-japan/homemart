import { NextRequest, NextResponse } from 'next/server';

// 顧客一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const query = searchParams.get('query') || '';
    const propertyType = searchParams.get('property_type') || '';
    const source = searchParams.get('source') || '';
    const assigneeUserId = searchParams.get('assignee_user_id') || '';

    // 一時的にモックデータを返す
    const mockCustomers = [
      {
        id: '1',
        name: '田中太郎',
        email: 'tanaka@example.com',
        phone: '090-1234-5678',
        category: 'buyer',
        source: 'website',
        created_at: '2025-01-15'
      },
      {
        id: '2',
        name: '佐藤花子',
        email: 'sato@example.com',
        phone: '090-8765-4321',
        category: 'seller',
        source: 'referral',
        created_at: '2025-01-10'
      }
    ];

    return NextResponse.json(mockCustomers);

  } catch (error) {
    console.error('顧客一覧取得エラー:', error);
    return NextResponse.json({ error: '顧客一覧の取得中にエラーが発生しました' }, { status: 500 });
  }
}

// 顧客新規作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 一時的にモックレスポンスを返す
    const mockCustomer = {
      id: Date.now().toString(),
      ...body,
      created_at: new Date().toISOString()
    };
    
    return NextResponse.json(mockCustomer, { status: 201 });

  } catch (error) {
    console.error('顧客作成エラー:', error);
    return NextResponse.json({ error: '顧客の作成中にエラーが発生しました' }, { status: 500 });
  }
}
