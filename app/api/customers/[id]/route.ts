import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { updateCustomer, deleteCustomer, getCustomer } from '@/server/actions/customers';

// 顧客詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getCustomer(params.id);
    
    if (result.success) {
      return NextResponse.json(result.customer);
    } else {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

  } catch (error) {
    console.error('顧客詳細取得エラー:', error);
    return NextResponse.json({ error: '顧客詳細の取得中にエラーが発生しました' }, { status: 500 });
  }
}

// 顧客更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const result = await updateCustomer(params.id, body);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

  } catch (error) {
    console.error('顧客更新エラー:', error);
    return NextResponse.json({ error: '顧客の更新中にエラーが発生しました' }, { status: 500 });
  }
}

// 顧客削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteCustomer(params.id);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

  } catch (error) {
    console.error('顧客削除エラー:', error);
    return NextResponse.json({ error: '顧客の削除中にエラーが発生しました' }, { status: 500 });
  }
}
