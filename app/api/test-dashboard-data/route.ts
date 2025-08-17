import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    console.log('ダッシュボードデータテスト開始...')
    
    const supabase = await createClient()
    
    // 各テーブルの存在確認とデータ取得テスト
    const results = {
      customer_leads: null,
      listing_agreements: null,
      customer_checklists: null,
      errors: []
    }
    
    // 1. customer_leadsテーブルのテスト
    try {
      const { data: leads, error: leadsError } = await supabase
        .from('customer_leads')
        .select('count')
        .limit(1)
      
      if (leadsError) {
        results.errors.push(`customer_leads: ${leadsError.message}`)
      } else {
        results.customer_leads = { success: true, count: leads?.length || 0 }
      }
    } catch (err) {
      results.errors.push(`customer_leads: ${err instanceof Error ? err.message : '不明なエラー'}`)
    }
    
    // 2. listing_agreementsテーブルのテスト
    try {
      const { data: agreements, error: agreementsError } = await supabase
        .from('listing_agreements')
        .select('count')
        .limit(1)
      
      if (agreementsError) {
        results.errors.push(`listing_agreements: ${agreementsError.message}`)
      } else {
        results.listing_agreements = { success: true, count: agreements?.length || 0 }
      }
    } catch (err) {
      results.errors.push(`listing_agreements: ${err instanceof Error ? err.message : '不明なエラー'}`)
    }
    
    // 3. customer_checklistsテーブルのテスト
    try {
      const { data: checklists, error: checklistsError } = await supabase
        .from('customer_checklists')
        .select('count')
        .limit(1)
      
      if (checklistsError) {
        results.errors.push(`customer_checklists: ${checklistsError.message}`)
      } else {
        results.customer_checklists = { success: true, count: checklists?.length || 0 }
      }
    } catch (err) {
      results.errors.push(`customer_checklists: ${err instanceof Error ? err.message : '不明なエラー'}`)
    }
    
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('ダッシュボードデータテスト中にエラーが発生:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'ダッシュボードデータテスト中にエラーが発生しました',
      error: error instanceof Error ? error.message : '不明なエラー',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
