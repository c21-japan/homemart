import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createCustomer, getCustomers } from '@/server/actions/customers';

// 顧客一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const query = searchParams.get('query') || '';
    const propertyType = searchParams.get('property_type') || '';
    const source = searchParams.get('source') || '';
    const assigneeUserId = searchParams.get('assignee_user_id') || '';

    const supabase = createClient();
    
    // 基本クエリ
    let supabaseQuery = supabase
      .from('customers')
      .select(`
        *,
        properties(*),
        seller_details(*),
        buyer_details(*),
        reform_projects(*)
      `)
      .order('created_at', { ascending: false });

    // カテゴリフィルター
    if (category && category !== 'all') {
      supabaseQuery = supabaseQuery.eq('category', category);
    }

    // 検索クエリ
    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,name_kana.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`);
    }

    // 物件種別フィルター
    if (propertyType) {
      supabaseQuery = supabaseQuery.eq('properties.property_type', propertyType);
    }

    // 流入元フィルター
    if (source) {
      supabaseQuery = supabaseQuery.eq('source', source);
    }

    // 担当者フィルター
    if (assigneeUserId) {
      supabaseQuery = supabaseQuery.eq('assignee_user_id', assigneeUserId);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('顧客一覧取得エラー:', error);
      return NextResponse.json({ error: '顧客一覧の取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('顧客一覧取得エラー:', error);
    return NextResponse.json({ error: '顧客一覧の取得中にエラーが発生しました' }, { status: 500 });
  }
}

// 顧客新規作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await createCustomer(body);
    
    if (result.success) {
      return NextResponse.json(result.customer, { status: 201 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

  } catch (error) {
    console.error('顧客作成エラー:', error);
    return NextResponse.json({ error: '顧客の作成中にエラーが発生しました' }, { status: 500 });
  }
}
