import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// センチュリー21システム連携設定
const CENTURY21_CONFIG = {
  baseUrl: process.env.CENTURY21_API_URL || 'https://api.century21.co.jp',
  apiKey: process.env.CENTURY21_API_KEY,
  companyId: process.env.CENTURY21_COMPANY_ID,
  branchId: process.env.CENTURY21_BRANCH_ID
}

// 物件登録
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    const { leadId, propertyData } = await request.json()

    if (!leadId || !propertyData) {
      return NextResponse.json({ error: '必要なパラメータが不足しています' }, { status: 400 })
    }

    // 顧客情報を取得
    const { data: lead, error: leadError } = await supabase
      .from('customer_leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError) throw leadError

    // センチュリー21システムに物件登録
    const registrationResult = await registerPropertyToCentury21(lead, propertyData)

    if (registrationResult.success) {
      // 登録成功時、データベースに外部IDを保存
      await supabase
        .from('customer_leads')
        .update({
          extra: {
            ...lead.extra,
            century21_property_id: registrationResult.propertyId,
            registered_at: new Date().toISOString()
          }
        })
        .eq('id', leadId)

      return NextResponse.json({
        success: true,
        propertyId: registrationResult.propertyId,
        message: 'センチュリー21システムに物件が登録されました'
      })
    } else {
      throw new Error(registrationResult.error)
    }

  } catch (error) {
    console.error('Error in Century21 integration:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    }, { status: 500 })
  }
}

// 物件反響取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const leadId = searchParams.get('leadId')

    if (!propertyId && !leadId) {
      return NextResponse.json({ error: 'propertyIdまたはleadIdは必須です' }, { status: 400 })
    }

    let targetPropertyId = propertyId

    // leadIdが指定されている場合、センチュリー21の物件IDを取得
    if (leadId && !propertyId) {
      const { data: lead, error: leadError } = await supabase
        .from('customer_leads')
        .select('extra')
        .eq('id', leadId)
        .single()

      if (leadError) throw leadError

      targetPropertyId = lead.extra?.century21_property_id
      if (!targetPropertyId) {
        return NextResponse.json({ error: 'センチュリー21システムに登録されていません' }, { status: 404 })
      }
    }

    // センチュリー21システムから反響データを取得
    const inquiryData = await fetchInquiriesFromCentury21(targetPropertyId!)

    return NextResponse.json({
      success: true,
      data: inquiryData
    })

  } catch (error) {
    console.error('Error fetching Century21 inquiries:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    }, { status: 500 })
  }
}

// センチュリー21システムに物件登録
async function registerPropertyToCentury21(lead: any, propertyData: any) {
  try {
    if (!CENTURY21_CONFIG.apiKey) {
      throw new Error('センチュリー21 APIキーが設定されていません')
    }

    // 物件データを構築
    const propertyPayload = {
      company_id: CENTURY21_CONFIG.companyId,
      branch_id: CENTURY21_CONFIG.branchId,
      property_type: lead.type === 'sell' ? 'sale' : 'rent',
      customer_info: {
        name: `${lead.last_name} ${lead.first_name}`,
        phone: lead.phone,
        email: lead.email,
        address: `${lead.prefecture} ${lead.city} ${lead.address1}`
      },
      property_details: {
        ...propertyData,
        extra_info: lead.extra
      }
    }

    // センチュリー21 APIに登録リクエスト
    const response = await fetch(`${CENTURY21_CONFIG.baseUrl}/properties/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CENTURY21_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(propertyPayload)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`センチュリー21登録エラー: ${errorData.message || response.statusText}`)
    }

    const result = await response.json()

    return {
      success: true,
      propertyId: result.property_id,
      message: '登録成功'
    }

  } catch (error) {
    console.error('Century21 registration error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー'
    }
  }
}

// センチュリー21システムから反響データを取得
async function fetchInquiriesFromCentury21(propertyId: string) {
  try {
    if (!CENTURY21_CONFIG.apiKey) {
      throw new Error('センチュリー21 APIキーが設定されていません')
    }

    // 反響データを取得
    const response = await fetch(`${CENTURY21_CONFIG.baseUrl}/properties/${propertyId}/inquiries`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CENTURY21_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`センチュリー21反響取得エラー: ${errorData.message || response.statusText}`)
    }

    const result = await response.json()

    // 反響データを整形
    return {
      property_id: propertyId,
      total_inquiries: result.total_count || 0,
      inquiries: result.inquiries?.map((inquiry: any) => ({
        id: inquiry.id,
        date: inquiry.inquiry_date,
        customer_name: inquiry.customer_name,
        phone: inquiry.phone,
        email: inquiry.email,
        message: inquiry.message,
        source: inquiry.source,
        status: inquiry.status
      })) || [],
      last_updated: result.last_updated
    }

  } catch (error) {
    console.error('Century21 inquiry fetch error:', error)
    throw error
  }
}

// 物件情報更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('認証が必要です')
    }

    const { propertyId, updateData } = await request.json()

    if (!propertyId || !updateData) {
      return NextResponse.json({ error: '必要なパラメータが不足しています' }, { status: 400 })
    }

    // センチュリー21システムで物件情報を更新
    const updateResult = await updatePropertyInCentury21(propertyId, updateData)

    if (updateResult.success) {
      return NextResponse.json({
        success: true,
        message: '物件情報が更新されました'
      })
    } else {
      throw new Error(updateResult.error)
    }

  } catch (error) {
    console.error('Error updating Century21 property:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    }, { status: 500 })
  }
}

// センチュリー21システムで物件情報を更新
async function updatePropertyInCentury21(propertyId: string, updateData: any) {
  try {
    if (!CENTURY21_CONFIG.apiKey) {
      throw new Error('センチュリー21 APIキーが設定されていません')
    }

    // 物件情報を更新
    const response = await fetch(`${CENTURY21_CONFIG.baseUrl}/properties/${propertyId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CENTURY21_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`センチュリー21更新エラー: ${errorData.message || response.statusText}`)
    }

    return {
      success: true,
      message: '更新成功'
    }

  } catch (error) {
    console.error('Century21 update error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー'
    }
  }
}
