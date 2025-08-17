import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient()
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { fp_info } = await request.json()
    const leadId = id

    // 顧客情報の存在確認
    const { data: existingLead, error: leadError } = await supabase
      .from('customer_leads')
      .select('id')
      .eq('id', leadId)
      .single()

    if (leadError || !existingLead) {
      return NextResponse.json({ error: '顧客情報が見つかりません' }, { status: 404 })
    }

    // FP情報を更新
    const { data, error } = await supabase
      .from('customer_leads')
      .update({ 
        fp_info,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .select()

    if (error) {
      console.error('FP情報更新エラー:', error)
      return NextResponse.json({ error: 'FP情報の更新に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'FP情報が正常に更新されました'
    })

  } catch (error) {
    console.error('FP情報更新エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient()
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const leadId = id

    // FP情報を取得
    const { data, error } = await supabase
      .from('customer_leads')
      .select('fp_info')
      .eq('id', leadId)
      .single()

    if (error) {
      console.error('FP情報取得エラー:', error)
      return NextResponse.json({ error: 'FP情報の取得に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data.fp_info || {}
    })

  } catch (error) {
    console.error('FP情報取得エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
