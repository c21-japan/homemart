import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    // クエリパラメータの検証
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        error: '検索クエリは2文字以上で入力してください' 
      }, { status: 400 });
    }

    if (limit > 20) {
      return NextResponse.json({ 
        error: '検索結果は最大20件までです' 
      }, { status: 400 });
    }

    const searchTerm = query.trim();

    // Supabaseで顧客検索を実行
    const { data: customers, error } = await supabaseServer
      .from('customers')
      .select(`
        id,
        name,
        name_kana,
        phone,
        email,
        category
      `)
      .or(`
        name.ilike.%${searchTerm}%,
        name_kana.ilike.%${searchTerm}%,
        phone.ilike.${searchTerm}%,
        email.ilike.${searchTerm}%
      `)
      .eq('is_active', true)
      .order('name')
      .limit(limit);

    if (error) {
      console.error('顧客検索エラー:', error);
      return NextResponse.json({ 
        error: '顧客検索中にエラーが発生しました' 
      }, { status: 500 });
    }

    // レスポンス形式を統一
    const results = (customers || []).map(customer => ({
      id: customer.id,
      label: `${customer.name}${customer.phone ? ` | ${customer.phone}` : ''}`,
      kana: customer.name_kana || '',
      phone: customer.phone || '',
      email: customer.email || '',
      category: customer.category
    }));

    return NextResponse.json({
      results,
      total: results.length,
      query: searchTerm
    });

  } catch (error) {
    console.error('顧客検索API エラー:', error);
    return NextResponse.json({ 
      error: 'サーバーエラーが発生しました' 
    }, { status: 500 });
  }
}
